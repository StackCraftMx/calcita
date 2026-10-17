// Lo que hace un backend con la consulta de ServerTable, pero en memoria: filtra, cuenta las facetas, ordena y corta la
// página.
//
// Contrato (el de ServerTable): {filters, sortOrders, page, pageSize} → {rows, total, facets}.
//   - Cada filtro se aplica con su regla (filterRules): el servidor es quien sabe qué significa «contiene» o «uno de».
//     Un filtro con valor y sin regla truena: un servidor de verdad respondería 400 y no lo ignoraría callado.
//   - Las facetas de un campo se cuentan con TODOS los filtros menos el suyo: así la lista de «Estado» sigue mostrando
//     los demás estados aunque ya se haya elegido uno, y se pueden elegir varios.
//   - El total es el de todo lo filtrado, no el de la página.
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (serverPage.test.js).

/**
 * ¿El filtro trae valor? Un texto vacío o una lista vacía no filtran.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function hasValue(value) {
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return value !== undefined && value !== null && value !== '';
}

/**
 * Un texto sin mayúsculas ni acentos, para que «lopez» encuentre a «López».
 *
 * @param {unknown} text
 * @returns {string}
 */
function plainTextOf(text) {
    return String(text ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/**
 * La regla de «contiene» de los filtros de texto: sin mayúsculas ni acentos.
 *
 * @param {unknown} text lo que trae el renglón
 * @param {string} search lo que escribió la persona
 * @returns {boolean}
 */
export function containsText(text, search) {
    return plainTextOf(text).includes(plainTextOf(search).trim());
}

/**
 * Los renglones que cumplen todos los filtros con valor, menos el del campo que se salta (el de su propia faceta).
 *
 * @param {object[]} rows
 * @param {Record<string, unknown>} filters
 * @param {Record<string, (row: object, value: unknown) => boolean>} filterRules
 * @param {string|null} skippedField
 * @returns {object[]}
 */
function rowsMatching(rows, filters, filterRules, skippedField) {
    const activeFilters = Object.entries(filters).filter(([field, value]) => field !== skippedField && hasValue(value));

    for (const [field] of activeFilters) {
        if (!filterRules[field]) {
            throw new Error(`El servidor de mentira no sabe filtrar por «${field}»: falta su regla en filterRules`);
        }
    }

    return rows.filter((row) => activeFilters.every(([field, value]) => filterRules[field](row, value)));
}

/**
 * La faceta de un campo: cada valor que aparece y en cuántos renglones, del más común al menos común.
 *
 * @param {object[]} rows
 * @param {string} field
 * @returns {Array<{value: string, total: number}>}
 */
function facetOf(rows, field) {
    const totalByValue = new Map();
    for (const row of rows) {
        totalByValue.set(row[field], (totalByValue.get(row[field]) ?? 0) + 1);
    }

    return [...totalByValue.entries()]
        .map(([value, total]) => ({value, total}))
        .sort((first, second) => second.total - first.total || String(first.value).localeCompare(String(second.value)));
}

/**
 * Compara dos renglones por una columna: los números como números y lo demás como texto en español.
 *
 * @param {object} first
 * @param {object} second
 * @param {{column: string, direction: 'asc'|'desc'}} sortOrder
 * @param {Record<string, (row: object) => number|string>} sortValues columna → con qué valor se ordena
 * @returns {number}
 */
function compareRows(first, second, {column, direction}, sortValues) {
    // un importe viaja como texto ('10000.00') y como texto quedaría antes que '2450.00': su regla dice con qué se ordena
    const sortValueOf = sortValues[column] ?? ((row) => row[column]);
    const firstValue = sortValueOf(first);
    const secondValue = sortValueOf(second);
    const comparison = typeof firstValue === 'number' && typeof secondValue === 'number'
        ? firstValue - secondValue
        : String(firstValue ?? '').localeCompare(String(secondValue ?? ''), 'es');

    return direction === 'asc' ? comparison : -comparison;
}

/**
 * La página que regresaría el servidor.
 *
 * @param {object[]} allRows todo el conjunto, sin filtrar
 * @param {{filters?: object, sortOrders?: Array<{column: string, direction: 'asc'|'desc'}>, page?: number, pageSize?: number}} request
 *     lo que manda ServerTable
 * @param {object} rules
 * @param {Record<string, (row: object, value: unknown) => boolean>} rules.filterRules campo → cómo se filtra
 * @param {string[]} [rules.facetFields] los campos que regresan faceta
 * @param {Record<string, (row: object) => number|string>} [rules.sortValues] columna → con qué valor se ordena, cuando no
 *     es el que viaja (un importe en texto se ordena por sus centavos)
 * @param {{column: string, direction: 'asc'|'desc'}} rules.defaultSort el orden cuando la persona no eligió uno
 * @returns {{rows: object[], total: number, facets: Record<string, Array<{value: string, total: number}>>}}
 */
export function serverPageOf(
    allRows, {filters = {}, sortOrders = [], page = 0, pageSize = 25}, {filterRules, facetFields = [], sortValues = {}, defaultSort},
) {
    const filteredRows = rowsMatching(allRows, filters, filterRules, null);
    const sortOrder = sortOrders[0] ?? defaultSort;
    const sortedRows = [...filteredRows].sort((first, second) => compareRows(first, second, sortOrder, sortValues));
    const firstRow = page * pageSize;

    const facets = {};
    for (const field of facetFields) {
        facets[field] = facetOf(rowsMatching(allRows, filters, filterRules, field), field);
    }

    return {
        rows: sortedRows.slice(firstRow, firstRow + pageSize),
        total: filteredRows.length,
        facets,
    };
}
