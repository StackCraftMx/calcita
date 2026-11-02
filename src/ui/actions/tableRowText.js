// Un renglón de tabla como texto para el portapapeles: sus celdas separadas por tabulador, como copian Excel y las tablas de
// datos. Al pegarlo en una hoja cada dato cae en su celda; en un correo se lee como una línea. Va con CopyButton:
//
//   <CopyButton label="Copiar el pedido" value={() => tableRowTextOf([order.folio, order.customer, formatCurrency(order.total)])} />
//
// Puro (sin React): se prueba con node (tableRowText.test.js).
//
// Genérico del paquete: function (regla de la casa).

/**
 * @param {Array<string|number|null|undefined>} cells las celdas en el orden de las columnas, ya formateadas
 * @returns {string} las celdas unidas con tabulador; una vacía o nula queda vacía. Un tabulador o un salto de renglón dentro
 *     de una celda se cambia por un espacio: partirían el renglón al pegarlo
 */
export function tableRowTextOf(cells) {
    return cells
        .map((cell) => (cell === null || cell === undefined ? '' : String(cell)).replace(/[\t\r\n]+/g, ' '))
        .join('\t');
}
