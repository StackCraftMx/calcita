// Las claves de México que se escriben en casi cualquier sistema: el RFC (SAT), la CURP (RENAPO) y la CLABE (Banxico). Revisan
// la forma de cada una y su dígito verificador, para avisar ANTES de mandar algo mal escrito. Lo que de verdad vale (que el
// RFC exista, que la CLABE sea de esa persona) lo dice el SAT o el banco, del lado del servidor.
//
// Son estándares nacionales, no reglas de un cliente.
//
// Puro (sin React): se prueba con node (mexicoIdentifiers.test.js).
//
// Genérico del paquete: function (regla de la casa).

// RFC: 3 letras (persona moral) o 4 (persona física), la fecha AAMMDD y la homoclave de 3 (la última es el dígito)
const RFC_PATTERN = /^([A-ZÑ&]{3,4})(\d{2})(\d{2})(\d{2})([A-Z\d]{2})([A\d])$/;
// los genéricos del SAT: público en general (nacional) y extranjero
const GENERIC_RFCS = Object.freeze(['XAXX010101000', 'XEXX010101000']);
const RFC_CHECK_TABLE = '0123456789ABCDEFGHIJKLMN&OPQRSTUVWXYZ Ñ';
const RFC_CHECK_MODULUS = 11;
const RFC_CHECK_LENGTH = 12;

// CURP: 4 letras, la fecha AAMMDD, el sexo (H, M o X), el estado (o NE: nacido en el extranjero), 3 consonantes, el carácter
// que distingue al siglo y el dígito
const CURP_PATTERN = /^[A-Z][AEIOUX][A-Z]{2}(\d{2})(\d{2})(\d{2})[HMX](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;
const CURP_CHECK_TABLE = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
const CURP_BODY_LENGTH = 17;

// CLABE: 18 dígitos; los pesos 3, 7, 1 se repiten sobre los primeros 17
const CLABE_PATTERN = /^\d{18}$/;
const CLABE_WEIGHTS = Object.freeze([3, 7, 1]);
const DECIMAL_BASE = 10;

/** De qué tipo es un RFC. */
export const RFC_KIND = Object.freeze({company: 'company', person: 'person', generic: 'generic'});

/**
 * ¿La fecha AAMMDD existe? (el 31 de febrero no).
 *
 * @param {string} year dos dígitos
 * @param {string} month
 * @param {string} day
 * @returns {boolean}
 */
function isRealShortDate(year, month, day) {
    // el siglo no importa para saber si el día existe, salvo el 29 de febrero: 2000 fue bisiesto y 1900 no, y las dos se
    // escriben «00». Se toma el 2000 (el de cualquier persona viva nacida un 29 de febrero «00»)
    const date = new Date(Date.UTC(2000 + Number(year), Number(month) - 1, Number(day)));
    return date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day);
}

/**
 * El dígito verificador de un RFC (el último carácter), calculado con el resto de 11 del SAT.
 *
 * @param {string} rfc el RFC completo (se ignora su último carácter)
 * @returns {string} '0'-'9' o 'A'
 */
export function rfcCheckDigitOf(rfc) {
    const body = rfc.slice(0, -1).toUpperCase();
    // la persona moral (11 sin el dígito) se rellena a 12 con un espacio al frente
    const padded = body.padStart(RFC_CHECK_LENGTH, ' ');
    let sum = 0;
    for (let position = 0; position < RFC_CHECK_LENGTH; position += 1) {
        sum += RFC_CHECK_TABLE.indexOf(padded[position]) * (RFC_CHECK_LENGTH + 1 - position);
    }
    const rest = sum % RFC_CHECK_MODULUS;
    if (rest === 0) {
        return '0';
    }
    return rest === 1 ? 'A' : String(RFC_CHECK_MODULUS - rest);
}

/**
 * De qué tipo es un RFC bien formado; null si no tiene la forma.
 *
 * @param {string|null|undefined} rfc
 * @returns {string|null} RFC_KIND
 */
export function rfcKindOf(rfc) {
    const clean = (rfc ?? '').trim().toUpperCase();
    if (GENERIC_RFCS.includes(clean)) {
        return RFC_KIND.generic;
    }
    const match = RFC_PATTERN.exec(clean);
    if (!match) {
        return null;
    }
    return match[1].length === 3 ? RFC_KIND.company : RFC_KIND.person;
}

/**
 * ¿El RFC está bien escrito? Revisa su forma (persona moral, física o genérico) y que la fecha exista.
 *
 * El dígito verificador va aparte (strict) y no por omisión: si un RFC real no lo cumpliera, la persona se quedaría sin poder
 * seguir, y quien dice si un RFC existe es el SAT.
 *
 * @param {string|null|undefined} rfc
 * @param {{strict?: boolean}} [options] strict: además, el dígito verificador
 * @returns {boolean}
 */
export function isValidRfc(rfc, {strict = false} = {}) {
    const clean = (rfc ?? '').trim().toUpperCase();
    if (GENERIC_RFCS.includes(clean)) {
        return true;
    }
    const match = RFC_PATTERN.exec(clean);
    if (!match || !isRealShortDate(match[2], match[3], match[4])) {
        return false;
    }
    return !strict || rfcCheckDigitOf(clean) === clean.at(-1);
}

/**
 * El dígito verificador de una CURP (el último).
 *
 * @param {string} curp la CURP completa (se ignora su último carácter)
 * @returns {string}
 */
export function curpCheckDigitOf(curp) {
    const body = curp.slice(0, CURP_BODY_LENGTH).toUpperCase();
    let sum = 0;
    for (let position = 0; position < CURP_BODY_LENGTH; position += 1) {
        sum += CURP_CHECK_TABLE.indexOf(body[position]) * (CURP_BODY_LENGTH + 1 - position);
    }
    return String((DECIMAL_BASE - (sum % DECIMAL_BASE)) % DECIMAL_BASE);
}

/**
 * ¿La CURP está bien escrita? Su forma (con el estado y el sexo), que la fecha exista y su dígito verificador.
 *
 * @param {string|null|undefined} curp
 * @returns {boolean}
 */
export function isValidCurp(curp) {
    const clean = (curp ?? '').trim().toUpperCase();
    const match = CURP_PATTERN.exec(clean);
    return Boolean(match) && isRealShortDate(match[1], match[2], match[3]) && curpCheckDigitOf(clean) === clean.at(-1);
}

/**
 * El dígito verificador de una CLABE (el 18.º).
 *
 * @param {string} clabe la CLABE completa o sus primeros 17 dígitos
 * @returns {string}
 */
export function clabeCheckDigitOf(clabe) {
    let sum = 0;
    for (let position = 0; position < 17; position += 1) {
        sum += (Number(clabe[position]) * CLABE_WEIGHTS[position % CLABE_WEIGHTS.length]) % DECIMAL_BASE;
    }
    return String((DECIMAL_BASE - (sum % DECIMAL_BASE)) % DECIMAL_BASE);
}

/**
 * ¿La CLABE está bien escrita? 18 dígitos (los espacios no cuentan) y su dígito verificador.
 *
 * @param {string|null|undefined} clabe
 * @returns {boolean}
 */
export function isValidClabe(clabe) {
    const clean = (clabe ?? '').replace(/\s/g, '');
    return CLABE_PATTERN.test(clean) && clabeCheckDigitOf(clean) === clean.at(-1);
}
