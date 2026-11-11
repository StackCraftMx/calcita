// Los topes de un campo: el mínimo y el máximo de un número, de las letras de un texto, de las opciones elegidas en una
// lista y de los archivos adjuntos. Y qué hace el campo cuando lo escrito se sale del tope (LIMIT_MODE):
//   - warn (por omisión): lo dice en rojo debajo del campo y, dentro de un formulario, no deja enviarlo. Lo escrito no se toca;
//   - fix: lo corrige solo. Un número de más se vuelve el máximo al salir del campo, un texto no deja teclear más letras
//     y una lista ya llena apaga las opciones que faltan.
// Lo que no se puede corregir solo (faltan letras, opciones o archivos: no se inventan) avisa siempre, con los dos modos.
//
// Reglas de aquí:
//   - vacío no se revisa: un campo vacío es cosa del obligatorio (required), no del tope. Un campo opcional con «al menos
//     3 letras» puede quedarse vacío;
//   - el mensaje es el mismo que da yup con buildYupLocale ({key: 'validation:numberMax', values, rule}), así se traduce y
//     se cambia igual: messages del campo o validation:fields.<campo>.<regla> en los textos del proyecto;
//   - un número se compara como TEXTO, nunca con Number(): Number('12345678901234567.89') ya no es exacto en JavaScript, y
//     el campo de número manda texto justo por eso (numberText.js);
//   - un tope mal escrito (letras en un número, un mínimo mayor que el máximo) truena al pintar el campo con un mensaje
//     claro, en vez de no hacer nada sin avisar.
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (fieldLimits.test.js).
import {completeDecimals, groupThousands} from '@/inputs/numberText.js';

/** Qué hace el campo cuando lo escrito se sale del tope: avisar o corregirlo solo. */
export const LIMIT_MODE = Object.freeze({warn: 'warn', fix: 'fix'});

/** De qué es el tope, para leerlo del esquema de yup: de un número, de las letras de un texto o de una lista. */
export const LIMIT_KIND = Object.freeze({number: 'number', text: 'text', list: 'list'});

const NUMBER_TEXT_PATTERN = /^-?\d+(\.\d+)?$/;
const NEGATIVE_SIGN = '-';
const DECIMAL_POINT = '.';

/**
 * El modo que manda: el del campo, si no el de la app (ToolkitProvider limitMode), si no avisar.
 *
 * @param {string} [fieldMode] el limitMode del campo (o de su pieza en el tema)
 * @param {string} [appMode] el limitMode de ToolkitProvider
 * @returns {'warn'|'fix'}
 */
export function limitModeOf(fieldMode, appMode) {
    const mode = fieldMode ?? appMode ?? LIMIT_MODE.warn;
    if (!Object.values(LIMIT_MODE).includes(mode)) {
        throw new Error(`limitMode «${mode}» no existe: use LIMIT_MODE.warn (avisa) o LIMIT_MODE.fix (lo corrige solo).`);
    }
    return mode;
}

/**
 * Un tope de número como texto limpio ('1000', '-5.5'), revisado.
 *
 * @param {string|number|undefined} limit
 * @param {string} propName para el mensaje si viene mal
 * @returns {string|undefined}
 */
function numberLimitTextOf(limit, propName) {
    if (limit === undefined || limit === null || limit === '') {
        return undefined;
    }
    const text = String(limit).trim();
    if (!NUMBER_TEXT_PATTERN.test(text)) {
        throw new Error(`${propName} «${limit}» no es un número: escríbalo como 1000 o '1000.50', sin comas ni moneda.`);
    }
    return text;
}

/**
 * Las partes de un número escrito como texto, sin ceros de adorno: '-007.50' → {isNegative: true, whole: '7', decimals: '5'}.
 *
 * @param {string} numberText
 * @returns {{isNegative: boolean, whole: string, decimals: string}}
 */
function numberPartsOf(numberText) {
    const isNegative = numberText.startsWith(NEGATIVE_SIGN);
    const [wholeDigits, decimalDigits = ''] = numberText.slice(isNegative ? 1 : 0).split(DECIMAL_POINT);
    const whole = wholeDigits.replace(/^0+(?=\d)/, '') || '0';
    const decimals = decimalDigits.replace(/0+$/, '');
    // el cero no tiene signo: '-0' y '0' son lo mismo
    const isZero = whole === '0' && decimals === '';
    return {isNegative: isNegative && !isZero, whole, decimals};
}

/**
 * Compara dos números escritos como texto, sin pasar por Number(): -1 si el primero es menor, 0 si son iguales, 1 si es mayor.
 *
 * @param {string|number} leftText
 * @param {string|number} rightText
 * @returns {-1|0|1}
 */
export function compareNumberTexts(leftText, rightText) {
    const left = numberPartsOf(String(leftText));
    const right = numberPartsOf(String(rightText));
    if (left.isNegative !== right.isNegative) {
        return left.isNegative ? -1 : 1;
    }
    // con el mismo signo se comparan los tamaños; con negativos, el más grande es el menor
    const direction = left.isNegative ? -1 : 1;
    if (left.whole.length !== right.whole.length) {
        return left.whole.length < right.whole.length ? -direction : direction;
    }
    if (left.whole !== right.whole) {
        return left.whole < right.whole ? -direction : direction;
    }
    const decimalLength = Math.max(left.decimals.length, right.decimals.length);
    const leftDecimals = left.decimals.padEnd(decimalLength, '0');
    const rightDecimals = right.decimals.padEnd(decimalLength, '0');
    if (leftDecimals === rightDecimals) {
        return 0;
    }
    return leftDecimals < rightDecimals ? -direction : direction;
}

/**
 * Los topes de un número revisados: el mínimo no puede pasar al máximo.
 *
 * @param {{min?: string|number, max?: string|number}} limits
 * @returns {{minText: string|undefined, maxText: string|undefined}}
 */
function numberLimitsOf({min, max}) {
    const minText = numberLimitTextOf(min, 'min');
    const maxText = numberLimitTextOf(max, 'max');
    if (minText !== undefined && maxText !== undefined && compareNumberTexts(minText, maxText) > 0) {
        throw new Error(`El mínimo (${minText}) es mayor que el máximo (${maxText}).`);
    }
    return {minText, maxText};
}

/**
 * Si un número escrito como texto todavía no es número: vacío, o solo un menos o un punto mientras se escribe.
 *
 * @param {string|number|null|undefined} valueText
 * @returns {boolean}
 */
function isIncompleteNumber(valueText) {
    const text = String(valueText ?? '').trim();
    return !NUMBER_TEXT_PATTERN.test(text.endsWith(DECIMAL_POINT) ? text.slice(0, -1) : text);
}

/**
 * El tope que rompe un número, con el mensaje de yup (validation:numberMin / numberMax); null si está dentro o vacío.
 *
 * @param {string|number|null|undefined} valueText el texto limpio del campo ('2850000.50')
 * @param {{min?: string|number, max?: string|number}} limits
 * @returns {{key: string, values: object, rule: string}|null}
 */
export function numberLimitProblemOf(valueText, limits) {
    const {minText, maxText} = numberLimitsOf(limits);
    if (isIncompleteNumber(valueText)) {
        return null;
    }
    const text = String(valueText).trim().replace(/\.$/, '');
    if (minText !== undefined && compareNumberTexts(text, minText) < 0) {
        return {key: 'validation:numberMin', values: {min: groupThousands(minText)}, rule: 'min'};
    }
    if (maxText !== undefined && compareNumberTexts(text, maxText) > 0) {
        return {key: 'validation:numberMax', values: {max: groupThousands(maxText)}, rule: 'max'};
    }
    return null;
}

/**
 * Corrige un número al tope que rompe (para el modo fix): lo de más se vuelve el máximo y lo de menos el mínimo, con los
 * decimales del campo. Vacío o dentro del tope, se queda igual.
 *
 * @param {string} valueText el texto limpio del campo
 * @param {{min?: string|number, max?: string|number}} limits
 * @param {number} decimals los decimales del campo
 * @returns {string}
 */
export function fixedNumberText(valueText, limits, decimals) {
    const problem = numberLimitProblemOf(valueText, limits);
    if (!problem) {
        return valueText;
    }
    const {minText, maxText} = numberLimitsOf(limits);
    return completeDecimals(problem.rule === 'min' ? minText : maxText, decimals);
}

/**
 * Un tope de cuántos (letras, opciones, archivos) revisado: entero de 0 en adelante.
 *
 * @param {number|undefined} limit
 * @param {string} propName para el mensaje si viene mal
 * @returns {number|undefined}
 */
function countLimitOf(limit, propName) {
    if (limit === undefined || limit === null) {
        return undefined;
    }
    if (!Number.isInteger(limit) || limit < 0) {
        throw new Error(`${propName} «${limit}» debe ser un número entero de 0 en adelante.`);
    }
    return limit;
}

/**
 * Los topes de cuántos revisados: el mínimo no puede pasar al máximo.
 *
 * @param {number|undefined} min
 * @param {number|undefined} max
 * @param {[string, string]} propNames los nombres de las dos props, para el mensaje
 * @returns {{minCount: number|undefined, maxCount: number|undefined}}
 */
function countLimitsOf(min, max, [minName, maxName]) {
    const minCount = countLimitOf(min, minName);
    const maxCount = countLimitOf(max, maxName);
    if (minCount !== undefined && maxCount !== undefined && minCount > maxCount) {
        throw new Error(`${minName} (${minCount}) es mayor que ${maxName} (${maxCount}).`);
    }
    return {minCount, maxCount};
}

/**
 * El tope de letras que rompe un texto, con el mensaje de yup (validation:stringMin / stringMax); null si está dentro o vacío.
 * Las letras se cuentan como yup y como el navegador (length), para que los tres digan lo mismo.
 *
 * @param {string|null|undefined} text
 * @param {{minLength?: number, maxLength?: number}} limits
 * @returns {{key: string, values: object, rule: string}|null}
 */
export function textLimitProblemOf(text, {minLength, maxLength}) {
    const {minCount, maxCount} = countLimitsOf(minLength, maxLength, ['minLength', 'maxLength']);
    const length = String(text ?? '').length;
    if (length === 0) {
        return null;
    }
    if (minCount !== undefined && length < minCount) {
        return {key: 'validation:stringMin', values: {count: minCount}, rule: 'min'};
    }
    if (maxCount !== undefined && length > maxCount) {
        return {key: 'validation:stringMax', values: {count: maxCount}, rule: 'max'};
    }
    return null;
}

/**
 * El tope de opciones que rompe una lista elegida, con el mensaje de yup (validation:arrayMin / arrayMax); null si está
 * dentro o vacía.
 *
 * @param {unknown[]|null|undefined} values lo elegido
 * @param {{minSelected?: number, maxSelected?: number}} limits
 * @returns {{key: string, values: object, rule: string}|null}
 */
export function listLimitProblemOf(values, {minSelected, maxSelected}) {
    const {minCount, maxCount} = countLimitsOf(minSelected, maxSelected, ['minSelected', 'maxSelected']);
    const count = Array.isArray(values) ? values.length : 0;
    if (count === 0) {
        return null;
    }
    if (minCount !== undefined && count < minCount) {
        return {key: 'validation:arrayMin', values: {count: minCount}, rule: 'min'};
    }
    if (maxCount !== undefined && count > maxCount) {
        return {key: 'validation:arrayMax', values: {count: maxCount}, rule: 'max'};
    }
    return null;
}

/**
 * Si una lista ya tiene todas las opciones que caben (para el modo fix: las que faltan se apagan).
 *
 * @param {unknown[]|null|undefined} values lo elegido
 * @param {number|undefined} maxSelected
 * @returns {boolean}
 */
export function isListFull(values, maxSelected) {
    const maxCount = countLimitOf(maxSelected, 'maxSelected');
    return maxCount !== undefined && (Array.isArray(values) ? values.length : 0) >= maxCount;
}

/**
 * Si elegir `extraCount` opciones más se pasaría del máximo (el «Elegir todos» o el «pasar» de la lista de transferencia).
 *
 * @param {unknown[]|null|undefined} values lo elegido
 * @param {number} extraCount cuántas se agregarían
 * @param {number|undefined} maxSelected
 * @returns {boolean}
 */
export function wouldOverfillList(values, extraCount, maxSelected) {
    const maxCount = countLimitOf(maxSelected, 'maxSelected');
    return maxCount !== undefined && (Array.isArray(values) ? values.length : 0) + extraCount > maxCount;
}

/**
 * El mínimo de archivos que falta, con su mensaje (validation:filesMin); null si alcanza o si no hay ninguno (eso es del
 * obligatorio).
 *
 * @param {unknown[]|null|undefined} files
 * @param {{minFiles?: number}} limits
 * @returns {{key: string, values: object, rule: string}|null}
 */
export function filesLimitProblemOf(files, {minFiles}) {
    const minCount = countLimitOf(minFiles, 'minFiles');
    const count = Array.isArray(files) ? files.length : 0;
    if (count === 0 || minCount === undefined || count >= minCount) {
        return null;
    }
    return {key: 'validation:filesMin', values: {count: minCount}, rule: 'min'};
}

/**
 * Lo que se corrigió solo (modo fix), para avisarle a la persona en el campo («Se ajustó al mínimo: 5,000.») y a la pantalla
 * (onLimitFix), como hacen muchos formularios que ya existen. El aviso trae la misma forma que los de yup, así se traduce y
 * se cambia igual (messages del campo: fixedToMin, fixedToMax).
 *
 * @param {{key: string, values: object, rule: string}} problem el tope que se rompió (numberLimitProblemOf, pickerLimitProblemOf)
 * @param {string} typedValue lo que había escrito la persona
 * @param {string} fixedValue en lo que quedó
 * @returns {{rule: 'min'|'max', limit: string, typedValue: string, fixedValue: string, message: {key: string, values: object, rule: string}}}
 *     limit es el tope como se ve en pantalla ('5,000', '11/11/2026')
 */
export function limitFixOf(problem, typedValue, fixedValue) {
    const limit = String(problem.values[problem.rule]);
    const fixRule = problem.rule === 'min' ? 'fixedToMin' : 'fixedToMax';
    return {rule: problem.rule, limit, typedValue, fixedValue, message: {key: `validation:${fixRule}`, values: {limit}, rule: fixRule}};
}
