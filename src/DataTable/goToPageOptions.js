// «Ir a la página N»: qué páginas enseña la lista según lo que se teclea.
//
// Sin recorte: GoToPage pinta solo las páginas que se ven (react-window), así que la lista puede traer decenas de miles de
// páginas y deslizarse hasta la última. Al teclear, primero las que EMPIEZAN con lo tecleado (13 da 13, 130, 131...) y
// después las que lo contienen (213, 1013...).
//
// Puro (sin React): se prueba con node (goToPageOptions.test.js).
//
// Genérico del paquete: function (regla de la casa).

/**
 * @param {number} pageCount cuántas páginas tiene la tabla
 * @returns {number[]} las páginas como las cuenta una persona: 1, 2, 3... pageCount
 */
export function pageNumbersOf(pageCount) {
    return Array.from({length: pageCount}, (unused, position) => position + 1);
}

/**
 * filterOptions del Autocomplete.
 *
 * @param {number[]} pageNumbers todas las páginas
 * @param {{inputValue: string}} state lo que lleva tecleado la persona
 * @returns {number[]} sin teclear, todas; tecleando, primero las que empiezan así y luego las que lo contienen
 */
export function filterPages(pageNumbers, {inputValue}) {
    const typedText = inputValue.trim();
    if (!typedText) {
        return pageNumbers;
    }

    const startingWith = pageNumbers.filter((pageNumber) => String(pageNumber).startsWith(typedText));
    const containing = pageNumbers.filter((pageNumber) => !String(pageNumber).startsWith(typedText) && String(pageNumber).includes(typedText));
    return [...startingWith, ...containing];
}
