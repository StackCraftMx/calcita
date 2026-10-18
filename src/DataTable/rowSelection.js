// La selección de renglones de la tabla de servidor (ServerTable), en funciones puras: se prueban sin navegador.
//
// Dos modos:
//   - elegidos: los que la persona picó uno por uno o con la casilla de la página. Se conservan al cambiar de página (como
//     Gmail), cada uno con el renglón tal como se vio: la acción lo puede leer sin volver a consultar. Se borran al cambiar
//     un filtro (eso lo decide la tabla): así nadie actúa sobre renglones que ya no se ven;
//   - todos los que coinciden: es lo que elige la casilla de arriba (toda la página de un golpe), lo pidió el autor; el
//     aviso de la tabla deja quedarse «solo con esta página». La tabla NO tiene esos renglones, pagina en el servidor.
//     La acción recibe los filtros y el servidor hace el trabajo con sus reglas (los que no se pueden cancelar, no se
//     cancelan). OJO: en este modo `ids` va VACÍO a propósito: una acción que olvida revisar `isAllMatching` no hace nada,
//     en lugar de actuar solo sobre la página que se ve.
//
// Funciones puras, no renderizan: function (regla de la casa).

/**
 * Lo que recibe cada acción de los elegidos (y onSelectionChange).
 *
 * @typedef {object} RowSelection
 * @property {Array<string|number>} ids los ids elegidos; vacío con isAllMatching
 * @property {any[]} rows los renglones elegidos tal como se vieron; vacío con isAllMatching
 * @property {number} count cuántos van: los elegidos o, con isAllMatching, el total de la tabla
 * @property {boolean} isAllMatching true = todos los que coinciden con `filters` (mande los filtros, no los ids)
 * @property {boolean} isCapped con isAllMatching, el total es «al menos esto» (el servidor cuenta hasta un tope)
 * @property {Record<string, any>} filters los filtros puestos en la tabla
 */

/** Nada elegido. */
export const EMPTY_ROW_SELECTION = Object.freeze({rowsById: new Map(), isAllMatching: false});

/**
 * Lo que reciben las acciones, a partir del estado de la tabla.
 *
 * @param {{rowsById: Map<string|number, any>, isAllMatching: boolean}} selection
 * @param {{total: number, capped?: boolean, filters: Record<string, any>}} table
 * @returns {RowSelection}
 */
export function rowSelectionOf(selection, {total, capped = false, filters}) {
    if (selection.isAllMatching) {
        return {ids: [], rows: [], count: total, isAllMatching: true, isCapped: Boolean(capped), filters};
    }

    return {
        ids: [...selection.rowsById.keys()],
        rows: [...selection.rowsById.values()],
        count: selection.rowsById.size,
        isAllMatching: false,
        isCapped: false,
        filters,
    };
}

/**
 * Los ids que el DataGrid debe pintar marcados en la página que se ve. Con «todos los que coinciden», todos los de la
 * página que se pueden elegir.
 *
 * @param {{rowsById: Map<string|number, any>, isAllMatching: boolean}} selection
 * @param {Array<string|number>} selectablePageIds los ids de la página que se pueden elegir
 * @returns {Set<string|number>}
 */
export function checkedIdsOf(selection, selectablePageIds) {
    return selection.isAllMatching ? new Set(selectablePageIds) : new Set(selection.rowsById.keys());
}

/**
 * El DataGrid avisó qué ids quedaron marcados (por una casilla de renglón o la de la página).
 *
 * Con «todos los que coinciden», desmarcar uno sale de ese modo y se quedan elegidos los de esta página que siguen
 * marcados (lo mismo que hace Gmail).
 *
 * Con allMatchingOnWholePage, la página completa elegida DE UN GOLPE (la casilla de arriba, o un rango con Shift que la
 * cubre) elige todos los que coinciden. OJO: se decide por lo que cambió y no por el motivo que manda el DataGrid, que usa
 * el mismo para la casilla de arriba y para un rango. Llenar la página picando uno por uno no: ahí el aviso lo ofrece. Si
 * no hay más renglones que los de la página, se quedan los picados (la acción recibe ids, que es lo más claro).
 *
 * @param {{rowsById: Map<string|number, any>, isAllMatching: boolean}} selection
 * @param {Set<string|number>} checkedIds lo que el DataGrid trae marcado (incluye los de otras páginas)
 * @param {Map<string|number, any>} pageRowsById los renglones de la página que se ve, por id
 * @param {Array<string|number>} selectablePageIds los ids de la página que se pueden elegir
 * @param {{allMatchingOnWholePage?: boolean, total?: number, capped?: boolean}} [options]
 * @returns {{rowsById: Map<string|number, any>, isAllMatching: boolean}}
 */
export function selectionAfterCheck(selection, checkedIds, pageRowsById, selectablePageIds, {allMatchingOnWholePage = false, total = 0, capped = false} = {}) {
    if (selection.isAllMatching) {
        if (selectablePageIds.every((id) => checkedIds.has(id))) {
            return selection;
        }
        const rowsById = new Map();
        for (const id of selectablePageIds) {
            if (checkedIds.has(id)) {
                rowsById.set(id, pageRowsById.get(id));
            }
        }
        return {rowsById, isAllMatching: false};
    }

    if (allMatchingOnWholePage && (capped || total > selectablePageIds.length)) {
        const isWholePageChecked = selectablePageIds.length > 0 && selectablePageIds.every((id) => checkedIds.has(id));
        const newlyCheckedCount = selectablePageIds.filter((id) => checkedIds.has(id) && !selection.rowsById.has(id)).length;
        if (isWholePageChecked && newlyCheckedCount > 1) {
            return {rowsById: new Map(), isAllMatching: true};
        }
    }

    const rowsById = new Map();
    for (const id of checkedIds) {
        // el renglón de esta página o, si es de otra, el que se guardó cuando se eligió
        const row = pageRowsById.has(id) ? pageRowsById.get(id) : selection.rowsById.get(id);
        if (row !== undefined) {
            rowsById.set(id, row);
        }
    }

    return {rowsById, isAllMatching: false};
}

/**
 * ¿Se le ofrece «Elegir los N que coinciden»? Cuando ya eligió toda la página y hay más renglones que esos.
 *
 * @param {{rowsById: Map<string|number, any>, isAllMatching: boolean}} selection
 * @param {Array<string|number>} selectablePageIds
 * @param {{total: number, capped?: boolean}} table
 * @returns {boolean}
 */
export function canSelectAllMatching(selection, selectablePageIds, {total, capped = false}) {
    if (selection.isAllMatching || selectablePageIds.length === 0) {
        return false;
    }
    const isWholePageChecked = selectablePageIds.every((id) => selection.rowsById.has(id));

    return isWholePageChecked && (capped || total > selection.rowsById.size);
}
