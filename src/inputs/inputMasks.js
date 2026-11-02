// Las máscaras de los campos que se escriben con forma fija: un teléfono, una CLABE, un RFC, un folio fiscal. MaskedInput
// las usa para que la persona vea los separadores mientras escribe y al formulario llegue el valor LIMPIO (solo dígitos o
// letras, en mayúsculas), que es lo que valida y guarda el servidor.
//
// Un patrón es un texto donde cada lugar dice qué cabe; lo demás son separadores que pone la máscara:
//   9  un dígito
//   A  una letra (Ñ incluida), en mayúscula
//   X  una letra o un dígito, en mayúscula (también & y Ñ, que llevan los RFC)
//   H  un dígito hexadecimal 0-9 A-F, en mayúscula (los folios fiscales)
// Por ejemplo '999 999 9999' muestra «555 123 4567» y al formulario llega «5551234567».
//
// Lo que no cabe en el lugar que sigue se ignora (una letra donde va un dígito) y nada pasa del largo del patrón. El RFC y la
// CURP solo se filtran y se pasan a mayúsculas mientras se escriben: que estén bien formados lo revisan sus reglas.
//
// Puro (sin React): se prueba con node (inputMasks.test.js).
//
// Genérico del paquete: function (regla de la casa).

/** Los patrones de siempre, para no escribirlos en cada pantalla. Uno propio se pasa como texto. */
export const INPUT_MASK = Object.freeze({
    // 10 dígitos en grupos de 3, 3 y 4; si su país lo escribe distinto, pase su propio patrón
    phone: '999 999 9999',
    postalCode: '99999',
    // la CLABE: banco (3), plaza (3), cuenta (11) y dígito verificador (1)
    clabe: '999 999 99999999999 9',
    card: '9999 9999 9999 9999',
    // RFC de persona física (13); el de persona moral (12) cabe igual
    rfc: 'XXXXXXXXXXXXX',
    curp: 'XXXXXXXXXXXXXXXXXX',
    // el folio fiscal (UUID) de una factura
    uuid: 'HHHHHHHH-HHHH-HHHH-HHHH-HHHHHHHHHHHH',
});

// qué cabe en cada clase de lugar del patrón
const SLOT_RULES = Object.freeze({
    9: /^\d$/,
    A: /^[A-ZÑ]$/,
    X: /^[A-Z0-9Ñ&]$/,
    H: /^[0-9A-F]$/,
});

/**
 * El patrón de una máscara: el nombre de una de INPUT_MASK o el patrón mismo.
 *
 * @param {string} mask 'phone' | '999-999' …
 * @returns {string}
 */
export function maskPatternOf(mask) {
    return INPUT_MASK[mask] ?? mask;
}

/**
 * @param {string} patternCharacter
 * @returns {boolean}
 */
function isSlot(patternCharacter) {
    return patternCharacter in SLOT_RULES;
}

/**
 * Los lugares del patrón, en orden (sin los separadores).
 *
 * @param {string} pattern
 * @returns {string[]}
 */
function slotsOf(pattern) {
    return [...pattern].filter(isSlot);
}

/**
 * El valor limpio de lo que se escribió (o se pegó): cada carácter va al lugar que sigue si cabe; lo que no, se ignora.
 *
 * @param {string} typedText lo que hay en el campo, con o sin separadores
 * @param {string} pattern
 * @returns {string} solo los dígitos o letras, en mayúsculas, hasta el largo del patrón
 */
export function rawValueOf(typedText, pattern) {
    const slots = slotsOf(pattern);
    let raw = '';
    for (const character of (typedText ?? '').toLocaleUpperCase('es-MX')) {
        if (raw.length === slots.length) {
            break;
        }
        if (SLOT_RULES[slots[raw.length]].test(character)) {
            raw += character;
        }
    }
    return raw;
}

/**
 * El valor limpio con sus separadores, como se ve en el campo. Los separadores solo salen entre lo que ya se escribió (sin
 * guiones de más al final).
 *
 * @param {string|null|undefined} rawValue
 * @param {string} pattern
 * @returns {string}
 */
export function maskedTextOf(rawValue, pattern) {
    const raw = rawValueOf(rawValue ?? '', pattern);
    let shown = '';
    let usedCharacters = 0;
    for (const patternCharacter of pattern) {
        if (usedCharacters === raw.length) {
            break;
        }
        if (isSlot(patternCharacter)) {
            shown += raw[usedCharacters];
            usedCharacters += 1;
        } else {
            shown += patternCharacter;
        }
    }
    return shown;
}

/**
 * Dónde queda el cursor después de poner los separadores: justo después del mismo número de dígitos o letras que tenía
 * antes. Sin esto, escribir en medio de un teléfono mandaría el cursor al final.
 *
 * @param {string} typedText lo que había en el campo al escribir
 * @param {number} caretPosition dónde estaba el cursor en typedText
 * @param {string} pattern
 * @returns {number} la posición en el texto ya con sus separadores
 */
export function caretPositionOf(typedText, caretPosition, pattern) {
    const valueCharactersBefore = rawValueOf(typedText.slice(0, caretPosition), pattern).length;
    const shown = maskedTextOf(rawValueOf(typedText, pattern), pattern);
    let seen = 0;
    for (let position = 0; position < shown.length; position += 1) {
        if (seen === valueCharactersBefore) {
            return position;
        }
        if (isSlot(pattern[position])) {
            seen += 1;
        }
    }
    return shown.length;
}

/**
 * ¿Ya se llenaron todos los lugares?
 *
 * @param {string|null|undefined} rawValue
 * @param {string} pattern
 * @returns {boolean}
 */
export function isMaskComplete(rawValue, pattern) {
    return rawValueOf(rawValue ?? '', pattern).length === slotsOf(pattern).length;
}
