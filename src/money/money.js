// Un monto de dinero exacto: un entero de centavos (o de la unidad menor de su moneda), nunca un número con decimales.
//
// POR QUÉ EXISTE. En JavaScript los números con decimales no son exactos: 0.1 + 0.2 da 0.30000000000000004. Sumando
// cientos de importes el error se acumula y el total de la pantalla deja de ser el del servidor. Con centavos enteros,
// 10 + 20 siempre da 30. Es la misma regla que el Money de PHP (bcmath) y el money.Amount de Go (int64 de centavos):
// el dinero nunca pasa por un número con decimales.
//
// Cómo se usa, y es a propósito que no se parezca a la aritmética normal:
//
//   const total = Money.fromString(order.total).plus(Money.fromNumber(order.shipping));
//   const withTax = total.times('1.16');                   // IVA del 16 %, redondeado al centavo
//   const perPayment = total.dividedBy(3);                 // tres pagos
//   if (total.isGreaterThan(Money.fromString('20000'))) { ... }
//   total.format()                                         // "$23,450.10" en el idioma y la moneda del proveedor
//   total.amount()                                         // "23450.10", el texto que se le manda al API
//
// Reglas que hace cumplir, para que un error truene al momento y no tres pantallas después:
//   - un texto que no es un número simple («1,234», « 12», «12.», «») no se lee como cero: truena;
//   - un monto con más decimales de los de su moneda («10.219» en pesos) truena: cortarlo perdería un centavo sin que
//     nadie se entere. Los ceros de más sí entran («10.500» son 10.50). Quien necesite más decimales los configura;
//   - no se suman ni se comparan pesos con dólares, ni montos con distintos decimales: truena;
//   - `+`, `-`, `>` y `<` truenan (valueOf): con ellos JavaScript volvería a los decimales. Se usa plus, minus,
//     isGreaterThan...
//
// Multiplicar, dividir, la potencia y la raíz sí tienen que redondear (un tercio de 10 pesos no cabe en centavos). Se
// calculan con enteros grandes (BigInt) y se redondea UNA vez al final, al centavo, con el modo que se pida
// (MONEY_ROUNDING). Por omisión, la mitad se aleja del cero, como se redondea a mano.
//
// Tope: un entero exacto de JavaScript llega a 9,007,199,254,740,991. Con dos decimales son unos 90 billones de pesos;
// con más decimales, menos. Pasarse truena.
//
// Funciones puras, sin React: function y una clase de valor (no se modifica: cada operación regresa un monto nuevo).
import {intlLocaleOf, toolkitSettings} from '@/toolkit/toolkitSettings.js';

/** Cómo se redondea al centavo lo que no cabe en centavos (al multiplicar, dividir, elevar o sacar raíz). */
export const MONEY_ROUNDING = Object.freeze({
    // la mitad se aleja del cero: 2.345 → 2.35 y −2.345 → −2.35 (como se redondea a mano)
    halfUp: 'halfUp',
    // la mitad va al par: 2.345 → 2.34 y 2.355 → 2.36 (redondeo bancario: en muchas sumas no carga hacia arriba)
    halfEven: 'halfEven',
    // corta hacia el cero: 2.349 → 2.34 (lo que hacen el Money de PHP y el de Go al leer)
    down: 'down',
});

const DEFAULT_ROUNDING = MONEY_ROUNDING.halfUp;

// un número simple: signo opcional, dígitos y, si hay punto, dígitos después. Sin comas, espacios ni exponente
const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/;
const DECIMAL_POINT = '.';
const NEGATIVE_SIGN = '-';
const TEN = 10n;

// el formateador de Intl de cada idioma, moneda y decimales: crear uno por celda en una tabla de cientos se nota
const formatterCache = new Map();

/**
 * Cuántos decimales lleva una moneda según Intl (ISO 4217): MXN y USD 2, JPY 0, KWD 3.
 *
 * @param {string} currency código ISO 4217
 * @returns {number}
 */
function decimalsOfCurrency(currency) {
    return new Intl.NumberFormat('en', {style: 'currency', currency}).resolvedOptions().maximumFractionDigits;
}

/**
 * La moneda y los decimales de un monto nuevo: los que se piden o, si no, los del proveedor.
 *
 * OJO: la moneda se fija al CREAR el monto. Un monto armado antes de que ToolkitProvider ponga la moneda del proyecto
 * (una constante de módulo) se queda con la de omisión (MXN); para esos casos se pasa la moneda explícita.
 *
 * @param {{currency?: string, decimals?: number}} options
 * @returns {{currency: string, decimals: number}}
 */
function settingsOf({currency, decimals} = {}) {
    const chosenCurrency = currency ?? toolkitSettings().currency;
    const chosenDecimals = decimals ?? decimalsOfCurrency(chosenCurrency);
    if (!Number.isInteger(chosenDecimals) || chosenDecimals < 0) {
        throw new RangeError(`Los decimales de un monto son un entero de 0 en adelante, no ${decimals}`);
    }

    return {currency: chosenCurrency, decimals: chosenDecimals};
}

/**
 * Un número simple en texto como entero con su escala: '-12.345' → {units: -12345n, scale: 3}.
 *
 * @param {string} text ya revisado con PLAIN_NUMBER
 * @returns {{units: bigint, scale: number}}
 */
function scaledIntegerOf(text) {
    const [integerText, decimalText = ''] = text.split(DECIMAL_POINT);
    return {units: BigInt(`${integerText}${decimalText}`), scale: decimalText.length};
}

/**
 * El texto de un número de JavaScript como lo escribiría una persona: 2450.5 → '2450.5'. JavaScript escribe el número
 * más corto que vuelve al mismo valor, así que lo que llegó como 2450.55 en el JSON sale como '2450.55'.
 *
 * @param {number} value
 * @returns {string}
 */
function textOfNumber(value) {
    if (!Number.isFinite(value)) {
        throw new TypeError(`${value} no es un monto de dinero`);
    }
    return String(value);
}

/**
 * Un factor o divisor (1.16, '0.16', 3) como entero con su escala, sin pasar por decimales.
 *
 * @param {number|string} value
 * @returns {{units: bigint, scale: number}}
 */
function factorOf(value) {
    const text = typeof value === 'number' ? textOfNumber(value) : value;
    if (typeof text !== 'string' || !PLAIN_NUMBER.test(text)) {
        throw new TypeError(`«${value}» no es un número simple para operar con un monto (sin comas, espacios ni exponente)`);
    }
    return scaledIntegerOf(text);
}

/**
 * Divide dos enteros grandes y redondea el resultado a entero con el modo pedido.
 *
 * @param {bigint} numerator
 * @param {bigint} denominator distinto de cero
 * @param {string} rounding uno de MONEY_ROUNDING
 * @returns {bigint}
 */
function divideRounded(numerator, denominator, rounding) {
    const isNegative = (numerator < 0n) !== (denominator < 0n);
    const positiveNumerator = numerator < 0n ? -numerator : numerator;
    const positiveDenominator = denominator < 0n ? -denominator : denominator;
    let quotient = positiveNumerator / positiveDenominator;
    // lo que sobra, por dos: comparado con el divisor dice si lo que sobra pasa de la mitad, es la mitad o no llega
    const twiceRemainder = (positiveNumerator % positiveDenominator) * 2n;

    if (rounding === MONEY_ROUNDING.halfUp && twiceRemainder >= positiveDenominator) {
        quotient += 1n;
    } else if (rounding === MONEY_ROUNDING.halfEven
        && (twiceRemainder > positiveDenominator || (twiceRemainder === positiveDenominator && quotient % 2n === 1n))) {
        quotient += 1n;
    } else if (!Object.values(MONEY_ROUNDING).includes(rounding)) {
        throw new RangeError(`«${rounding}» no es un modo de redondeo de MONEY_ROUNDING`);
    }

    return isNegative ? -quotient : quotient;
}

/**
 * La raíz cuadrada entera (hacia abajo) de un entero grande que no es negativo.
 *
 * @param {bigint} value
 * @returns {bigint}
 */
function floorSquareRoot(value) {
    // la raíz con decimales de JavaScript da un punto de partida casi exacto; los dos ciclos lo dejan exacto
    let root = BigInt(Math.floor(Math.sqrt(Number(value))));
    while (root * root > value) {
        root -= 1n;
    }
    while ((root + 1n) * (root + 1n) <= value) {
        root += 1n;
    }
    return root;
}

/**
 * Un entero grande como centavos de JavaScript, si cabe.
 *
 * @param {bigint} minorUnits
 * @returns {number}
 */
function safeMinorUnitsOf(minorUnits) {
    if (minorUnits > BigInt(Number.MAX_SAFE_INTEGER) || minorUnits < BigInt(Number.MIN_SAFE_INTEGER)) {
        throw new RangeError('El monto pasa del tope que JavaScript guarda exacto (unos 90 billones con dos decimales)');
    }
    return Number(minorUnits);
}

export class Money {
    /**
     * Centavos (la unidad menor de la moneda): 1050 son $10.50.
     *
     * @readonly
     * @type {number}
     */
    minorUnits;

    /**
     * Código ISO 4217 de la moneda.
     *
     * @readonly
     * @type {string}
     */
    currency;

    /**
     * Cuántos decimales lleva.
     *
     * @readonly
     * @type {number}
     */
    decimals;

    /**
     * No se usa directo: los montos se arman con Money.fromString, Money.fromNumber, Money.fromMinorUnits o Money.zero.
     *
     * @param {number} minorUnits centavos (la unidad menor de la moneda), entero
     * @param {string} currency código ISO 4217
     * @param {number} decimals cuántos decimales lleva
     */
    constructor(minorUnits, currency, decimals) {
        if (!Number.isSafeInteger(minorUnits)) {
            throw new RangeError(`Un monto se guarda en centavos enteros; ${minorUnits} no lo es o pasa del tope de JavaScript`);
        }
        this.minorUnits = minorUnits;
        this.currency = currency;
        this.decimals = decimals;
        // un monto no cambia nunca: cada operación regresa uno nuevo
        Object.freeze(this);
    }

    /**
     * Cero, para arrancar una suma.
     *
     * @param {object} [options]
     * @param {string} [options.currency] código ISO 4217; por omisión, la del proveedor
     * @param {number} [options.decimals] por omisión, los de la moneda
     * @returns {Money}
     */
    static zero(options) {
        const {currency, decimals} = settingsOf(options);
        return new Money(0, currency, decimals);
    }

    /**
     * Un monto a partir del texto que manda el API o la base ('1234.50', '-3', '0.5').
     *
     * @param {string} text un número simple: sin comas, espacios, símbolo ni exponente
     * @param {object} [options]
     * @param {string} [options.currency] código ISO 4217; por omisión, la del proveedor
     * @param {number} [options.decimals] por omisión, los de la moneda
     * @returns {Money}
     */
    static fromString(text, options) {
        const {currency, decimals} = settingsOf(options);
        if (typeof text !== 'string' || !PLAIN_NUMBER.test(text)) {
            throw new TypeError(`«${text}» no es un monto de dinero: se espera un número simple como '1234.50'`);
        }

        const {units, scale} = scaledIntegerOf(text);
        const extraDecimals = scale - decimals;
        // con decimales de menos se completa con ceros; con decimales de más solo entra si lo de más son ceros
        if (extraDecimals <= 0) {
            return new Money(safeMinorUnitsOf(units * TEN ** BigInt(-extraDecimals)), currency, decimals);
        }
        const divisor = TEN ** BigInt(extraDecimals);
        if (units % divisor !== 0n) {
            throw new RangeError(`«${text}» trae más de ${decimals} decimales; para no perder centavos, configure más decimales`);
        }

        return new Money(safeMinorUnitsOf(units / divisor), currency, decimals);
    }

    /**
     * Un monto a partir de un número del JSON del API (2450.5). Lo que trae decimales de más (lo que deja hacer cuentas
     * con decimales, como 0.30000000000000004) truena igual que en fromString.
     *
     * @param {number} value
     * @param {object} [options]
     * @param {string} [options.currency] código ISO 4217; por omisión, la del proveedor
     * @param {number} [options.decimals] por omisión, los de la moneda
     * @returns {Money}
     */
    static fromNumber(value, options) {
        if (typeof value !== 'number') {
            throw new TypeError(`fromNumber recibe un número; para el texto del API use fromString («${value}»)`);
        }
        return Money.fromString(textOfNumber(value), options);
    }

    /**
     * Un monto a partir de sus centavos enteros (1050 son $10.50).
     *
     * @param {number} minorUnits
     * @param {object} [options]
     * @param {string} [options.currency] código ISO 4217; por omisión, la del proveedor
     * @param {number} [options.decimals] por omisión, los de la moneda
     * @returns {Money}
     */
    static fromMinorUnits(minorUnits, options) {
        const {currency, decimals} = settingsOf(options);
        return new Money(minorUnits, currency, decimals);
    }

    /**
     * Revisa que el otro monto sea de la misma moneda y con los mismos decimales.
     *
     * @param {Money} other
     * @returns {void}
     */
    #assertSameKind(other) {
        if (!(other instanceof Money)) {
            throw new TypeError('Solo se opera un monto con otro Money; arme el otro con Money.fromString o Money.fromNumber');
        }
        if (other.currency !== this.currency || other.decimals !== this.decimals) {
            throw new RangeError(`No se mezclan ${this.currency} con ${this.decimals} decimales y ${other.currency} con ${other.decimals}`);
        }
    }

    /**
     * Un monto nuevo de la misma moneda a partir de un entero grande de centavos.
     *
     * @param {bigint} minorUnits
     * @returns {Money}
     */
    #withMinorUnits(minorUnits) {
        return new Money(safeMinorUnitsOf(minorUnits), this.currency, this.decimals);
    }

    /**
     * Este monto más otro.
     *
     * @param {Money} other
     * @returns {Money}
     */
    plus(other) {
        this.#assertSameKind(other);
        return this.#withMinorUnits(BigInt(this.minorUnits) + BigInt(other.minorUnits));
    }

    /**
     * Este monto menos otro.
     *
     * @param {Money} other
     * @returns {Money}
     */
    minus(other) {
        this.#assertSameKind(other);
        return this.#withMinorUnits(BigInt(this.minorUnits) - BigInt(other.minorUnits));
    }

    /**
     * Este monto por un factor (1.16 para el IVA, 3 piezas, '0.5'), redondeado al centavo.
     *
     * @param {number|string} factor un número simple; mejor en texto si viene de una tasa ('0.16')
     * @param {object} [options]
     * @param {string} [options.rounding] uno de MONEY_ROUNDING; por omisión halfUp
     * @returns {Money}
     */
    times(factor, {rounding = DEFAULT_ROUNDING} = {}) {
        const {units, scale} = factorOf(factor);
        return this.#withMinorUnits(divideRounded(BigInt(this.minorUnits) * units, TEN ** BigInt(scale), rounding));
    }

    /**
     * Este monto entre un divisor (3 pagos, '1.16' para quitar el IVA), redondeado al centavo.
     *
     * OJO: tres pagos de un tercio redondeado no siempre suman el total (10.00 / 3 = 3.33 y 3 × 3.33 = 9.99). Si las
     * partes tienen que sumar el total exacto, la última se calcula restando las demás.
     *
     * @param {number|string} divisor un número simple, distinto de cero
     * @param {object} [options]
     * @param {string} [options.rounding] uno de MONEY_ROUNDING; por omisión halfUp
     * @returns {Money}
     */
    dividedBy(divisor, {rounding = DEFAULT_ROUNDING} = {}) {
        const {units, scale} = factorOf(divisor);
        if (units === 0n) {
            throw new RangeError('Un monto no se divide entre cero');
        }
        return this.#withMinorUnits(divideRounded(BigInt(this.minorUnits) * TEN ** BigInt(scale), units, rounding));
    }

    /**
     * Este monto elevado a una potencia entera, redondeado al centavo: (1.05)² = 1.1025 → 1.10.
     *
     * @param {number} exponent entero de 0 en adelante
     * @param {object} [options]
     * @param {string} [options.rounding] uno de MONEY_ROUNDING; por omisión halfUp
     * @returns {Money}
     */
    pow(exponent, {rounding = DEFAULT_ROUNDING} = {}) {
        if (!Number.isInteger(exponent) || exponent < 0) {
            throw new RangeError(`La potencia de un monto es un entero de 0 en adelante, no ${exponent}; la raíz cuadrada es sqrt()`);
        }
        // el monto es centavos / 10^decimales; elevado a la n y vuelto a centavos queda centavos^n / 10^(decimales·(n−1))
        const scale = TEN ** BigInt(this.decimals);
        const power = BigInt(exponent);
        return this.#withMinorUnits(divideRounded(BigInt(this.minorUnits) ** power * scale, scale ** power, rounding));
    }

    /**
     * La raíz cuadrada de este monto, redondeada al centavo: √2.00 = 1.414… → 1.41.
     *
     * @param {object} [options]
     * @param {string} [options.rounding] uno de MONEY_ROUNDING; por omisión halfUp (en una raíz nunca cae justo en la
     *     mitad, así que halfEven da lo mismo)
     * @returns {Money}
     */
    sqrt({rounding = DEFAULT_ROUNDING} = {}) {
        if (this.minorUnits < 0) {
            throw new RangeError('Un monto negativo no tiene raíz cuadrada');
        }
        if (!Object.values(MONEY_ROUNDING).includes(rounding)) {
            throw new RangeError(`«${rounding}» no es un modo de redondeo de MONEY_ROUNDING`);
        }
        // la raíz en centavos es √(centavos × 10^decimales)
        const radicand = BigInt(this.minorUnits) * TEN ** BigInt(this.decimals);
        const root = floorSquareRoot(radicand);
        // ¿pasa de la mitad? (raíz + ½)² ≤ radicando, multiplicado por 4 para no salir de los enteros
        const passesHalf = (2n * root + 1n) ** 2n <= 4n * radicand;
        const roundsUp = rounding !== MONEY_ROUNDING.down && passesHalf;

        return this.#withMinorUnits(roundsUp ? root + 1n : root);
    }

    /**
     * Si los dos montos valen exactamente lo mismo, hasta el centavo.
     *
     * @param {Money} other
     * @returns {boolean}
     */
    equals(other) {
        this.#assertSameKind(other);
        return this.minorUnits === other.minorUnits;
    }

    /**
     * Si este monto es mayor que otro. El centavo de diferencia cuenta.
     *
     * @param {Money} other
     * @returns {boolean}
     */
    isGreaterThan(other) {
        this.#assertSameKind(other);
        return this.minorUnits > other.minorUnits;
    }

    /**
     * Si el monto es cero o negativo.
     *
     * @returns {boolean}
     */
    isZeroOrLess() {
        return this.minorUnits <= 0;
    }

    /**
     * El monto como texto, con todos sus decimales: '1234.50'. Es lo que se le manda al API para una columna NUMERIC.
     *
     * @returns {string}
     */
    amount() {
        const sign = this.minorUnits < 0 ? NEGATIVE_SIGN : '';
        // los centavos con ceros a la izquierda hasta tener un entero y sus decimales: 5 → '005' → '0.05'
        const digits = String(Math.abs(this.minorUnits)).padStart(this.decimals + 1, '0');
        if (this.decimals === 0) {
            return `${sign}${digits}`;
        }
        return `${sign}${digits.slice(0, -this.decimals)}${DECIMAL_POINT}${digits.slice(-this.decimals)}`;
    }

    /**
     * El monto como lo lee una persona, en el idioma del proveedor y con el símbolo de su moneda: $1,234.50 (es) o
     * $1,234.50 (en); US$ o ¥ según la moneda. Sin pasar por decimales: Intl recibe el texto exacto.
     *
     * @returns {string}
     */
    format() {
        const locale = intlLocaleOf(toolkitSettings().language);
        const cacheKey = `${locale}|${this.currency}|${this.decimals}`;
        if (!formatterCache.has(cacheKey)) {
            formatterCache.set(cacheKey, new Intl.NumberFormat(locale, {
                style: 'currency', currency: this.currency, currencyDisplay: 'narrowSymbol',
                minimumFractionDigits: this.decimals, maximumFractionDigits: this.decimals,
            }));
        }
        return formatterCache.get(cacheKey).format(this.amount());
    }

    /**
     * Para que JSON.stringify mande el texto del monto ('1234.50') y no un objeto.
     *
     * @returns {string}
     */
    toJSON() {
        return this.amount();
    }

    /**
     * Para que un texto con el monto adentro (`${total}`) diga '1234.50'.
     *
     * @returns {string}
     */
    toString() {
        return this.amount();
    }

    /**
     * Truena a propósito: `total + iva` o `total > limit` regresarían a los números con decimales sin que nadie se dé
     * cuenta. Se usa plus, minus, isGreaterThan...
     *
     * @returns {never}
     */
    valueOf() {
        throw new TypeError('Un Money no se opera con + - * / > <: use plus, minus, times, dividedBy, isGreaterThan o equals');
    }
}
