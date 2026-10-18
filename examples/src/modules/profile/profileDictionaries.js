// Las áreas de la tienda → su nombre (namespace dictionaries, en profileTexts.js). Es el campo propio que el proyecto le
// suma a «Sus datos» de ProfileScreen (extraFields).
import {dictionaryEntryOf, labelOf} from '@stackcraftmx/calcita';

export const DEPARTMENT = Object.freeze({
    sales: dictionaryEntryOf('sales', 'department.sales', 'default'),
    warehouse: dictionaryEntryOf('warehouse', 'department.warehouse', 'default'),
    administration: dictionaryEntryOf('administration', 'department.administration', 'default'),
});

/**
 * Las áreas como opciones de la lista.
 *
 * @param {(key: string) => string} t el traductor de la pantalla
 * @returns {Array<{value: string, label: string}>}
 */
export function departmentOptionsOf(t) {
    return Object.values(DEPARTMENT).map((entry) => ({value: entry.value, label: labelOf(entry, t)}));
}
