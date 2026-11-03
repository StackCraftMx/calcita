// Dónde se pega cada columna fija de la tabla al deslizar de lado: la primera junto a la orilla (o junto a la casilla de
// elegir renglones) y cada siguiente corrida lo que miden las de antes.
//
// OJO: el desplazamiento sale del ancho que la columna declara (`width`). Una columna fija que NO es la última y no trae un
// ancho fijo (va con `flex` o sin ancho) no se puede sumar: su ancho real lo decide el navegador. Ahí se usa su minWidth
// (o el de siempre del DataGrid, 100 px) y se avisa: la que sigue podría quedar encima. La ÚLTIMA puede ser flexible
// (su ancho no mueve a nadie).
//
// Funciones puras, no renderizan: function (regla de la casa).

// el ancho de una columna del DataGrid que no dice el suyo
const DATA_GRID_DEFAULT_COLUMN_WIDTH = 100;

/**
 * Los campos fijos como lista, con el orden en que se dieron.
 *
 * @param {string|string[]|null|undefined} fixedColumn
 * @returns {string[]}
 */
export function fixedFieldsOf(fixedColumn) {
    if (!fixedColumn) {
        return [];
    }
    return Array.isArray(fixedColumn) ? fixedColumn.filter(Boolean) : [fixedColumn];
}

/**
 * Cada columna fija con su `left` en px.
 *
 * @param {string[]} fields los campos fijos, de izquierda a derecha
 * @param {Array<{field: string, width?: number, minWidth?: number, flex?: number}>} columns las columnas de la tabla
 * @param {{startLeft?: number}} [options] startLeft: lo que ya va pegado antes (la casilla de elegir renglones)
 * @returns {Array<{field: string, left: number, isLast: boolean, hasUnknownWidth: boolean}>} hasUnknownWidth: no es la última
 *     y su ancho no es fijo (la siguiente podría encimarse)
 */
export function fixedColumnOffsetsOf(fields, columns, {startLeft = 0} = {}) {
    const byField = new Map(columns.map((column) => [column.field, column]));
    let left = startLeft;
    return fields.map((field, index) => {
        const column = byField.get(field) ?? {};
        const isLast = index === fields.length - 1;
        const hasFixedWidth = typeof column.width === 'number' && !column.flex;
        const placed = {field, left, isLast, hasUnknownWidth: !isLast && !hasFixedWidth};
        left += hasFixedWidth ? column.width : (column.minWidth ?? column.width ?? DATA_GRID_DEFAULT_COLUMN_WIDTH);
        return placed;
    });
}
