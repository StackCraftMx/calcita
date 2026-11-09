// «Ir a la página N»: qué páginas enseña la lista según lo que se teclea.
//
// Sin teclear sale una lista CORTA, para no deslizar cinco pantallas con 100 páginas: la primera, la última, las vecinas de
// la página donde está la tabla y saltos redondos alrededor de ella (de 10 en 10 dentro de su centena, de 100 en 100
// dentro de su millar...). Con 100 páginas, parada en la 37, son 16 renglones: 1, 10, 20, 30, 35-39, 40, 50... 100.
// Con pocas páginas salen todas: la corta se saltaría números que sí caben.
//
// Tecleando se busca en TODAS: primero las que EMPIEZAN con lo tecleado (13 da 13, 130, 131...) y después las que lo
// contienen (213, 1013...). Pueden ser miles; GoToPage pinta solo las que se ven (react-window).
//
// Puro (sin React): se prueba con node (goToPageOptions.test.js).
//
// Genérico del paquete: function (regla de la casa).

// hasta cuántas páginas sale la lista completa sin teclear: unas tres vistas de la lista abierta
const ALL_PAGES_UP_TO = 20;
// cuántas vecinas salen a cada lado de la página actual (la 37 trae de la 35 a la 39)
const NEIGHBOR_PAGES = 2;
// los saltos van de 10 en 10, luego de 100 en 100...: cada escalón es diez veces el anterior
const JUMP_GROWTH = 10;

/**
 * @param {number} pageCount cuántas páginas tiene la tabla
 * @returns {number[]} las páginas como las cuenta una persona: 1, 2, 3... pageCount
 */
export function pageNumbersOf(pageCount) {
    return Array.from({length: pageCount}, (unused, position) => position + 1);
}

/**
 * La lista sin teclear: la primera, la última, las vecinas de la actual y los saltos redondos alrededor de ella.
 *
 * @param {number} pageCount cuántas páginas tiene la tabla
 * @param {number} currentPageNumber donde está la tabla, contando desde 1
 * @returns {number[]} en orden, sin repetidas
 */
export function shortPageListOf(pageCount, currentPageNumber) {
    if (pageCount <= ALL_PAGES_UP_TO) {
        return pageNumbersOf(pageCount);
    }

    const shownPages = new Set([1, pageCount]);
    for (let pageNumber = currentPageNumber - NEIGHBOR_PAGES; pageNumber <= currentPageNumber + NEIGHBOR_PAGES; pageNumber += 1) {
        if (pageNumber >= 1 && pageNumber <= pageCount) {
            shownPages.add(pageNumber);
        }
    }
    // los saltos de cada escalón, solo dentro del bloque de la página actual: con 500 páginas, parada en la 237, de 10 en 10
    // va de la 210 a la 300 (su centena) y de 100 en 100 de la 100 a la 500 (su millar)
    for (let jump = JUMP_GROWTH; jump < pageCount; jump *= JUMP_GROWTH) {
        const blockSize = jump * JUMP_GROWTH;
        const blockStart = Math.floor((currentPageNumber - 1) / blockSize) * blockSize;
        const blockEnd = Math.min(blockStart + blockSize, pageCount);
        for (let pageNumber = blockStart + jump; pageNumber <= blockEnd; pageNumber += jump) {
            shownPages.add(pageNumber);
        }
    }
    return [...shownPages].sort((first, second) => first - second);
}

/**
 * filterOptions del Autocomplete.
 *
 * @param {number[]} pageNumbers todas las páginas
 * @param {{inputValue: string}} state lo que lleva tecleado la persona (MUI manda '' si abrió la lista y no ha tecleado)
 * @param {number} currentPageNumber donde está la tabla, contando desde 1
 * @returns {number[]} sin teclear, la lista corta; tecleando, primero las que empiezan así y luego las que lo contienen
 */
export function filterPages(pageNumbers, {inputValue}, currentPageNumber) {
    const typedText = inputValue.trim();
    if (!typedText) {
        return shortPageListOf(pageNumbers.length, currentPageNumber);
    }

    const startingWith = pageNumbers.filter((pageNumber) => String(pageNumber).startsWith(typedText));
    const containing = pageNumbers.filter((pageNumber) => !String(pageNumber).startsWith(typedText) && String(pageNumber).includes(typedText));
    return [...startingWith, ...containing];
}
