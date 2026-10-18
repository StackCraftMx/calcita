// Los nombres que salen de lo que escribe la persona («purchase-orders», «PurchaseOrders», «purchase orders»). Cada parte
// del proyecto pide el suyo: la carpeta y el namespace de textos en camelCase, el componente en PascalCase, la ruta en
// kebab-case y la constante en MAYÚSCULAS. Se arman aquí, en un solo lugar, para que no salgan distintos de un archivo a otro.
//
// Funciones puras: function (regla de la casa). Pruebas en names.test.js.

// una palabra: minúsculas con números («orders2»), una con mayúscula inicial («Orders») o unas siglas («PDF»)
const WORD_PATTERN = /[A-Z]?[a-z0-9]+|[A-Z]+(?![a-z])/g;
// lo que se acepta: letras sin acentos, números, espacios, guiones; empieza con letra. Los nombres van en inglés (regla de
// la casa) y un acento en el nombre de un archivo o de una variable da problemas entre sistemas
const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9 _-]*$/;

/**
 * Las palabras del nombre, en minúsculas: «PurchaseOrders» y «purchase-orders» dan ['purchase', 'orders'].
 *
 * @param {string} text
 * @returns {string[]}
 */
export function wordsOf(text) {
    return (text.match(WORD_PATTERN) ?? []).map((word) => word.toLowerCase());
}

/**
 * ¿Se puede usar como nombre de módulo, pantalla, formulario o componente?
 *
 * @param {string} text
 * @returns {boolean}
 */
export function isValidName(text) {
    return typeof text === 'string' && NAME_PATTERN.test(text.trim()) && wordsOf(text).length > 0;
}

const capitalized = (word) => word.charAt(0).toUpperCase() + word.slice(1);

/**
 * Todas las formas del nombre.
 *
 * @param {string} text
 * @returns {{camel: string, pascal: string, kebab: string, constant: string, human: string}} human: «Purchase orders»,
 *     para un texto de pantalla por omisión
 */
export function namesOf(text) {
    const words = wordsOf(text);
    return {
        camel: words[0] + words.slice(1).map(capitalized).join(''),
        pascal: words.map(capitalized).join(''),
        kebab: words.join('-'),
        constant: words.join('_').toUpperCase(),
        human: capitalized(words.join(' ')),
    };
}

/**
 * El nombre sin una palabra del final que el CLI ya agrega: «OrderDetailPage» con 'page' da «OrderDetail» (si no, el
 * componente saldría «OrderDetailPagePage»).
 *
 * @param {string} text
 * @param {string} suffixWord en minúsculas
 * @returns {string}
 */
export function withoutSuffixWord(text, suffixWord) {
    const words = wordsOf(text);
    return words.length > 1 && words.at(-1) === suffixWord ? words.slice(0, -1).join('-') : text;
}
