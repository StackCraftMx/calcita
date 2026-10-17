// Los tipos de cliente que acepta el API → etiqueta y explicación (namespace dictionaries, en customersTexts.js).
import {dictionaryEntryOf, labelOf} from '@stackcraftmx/calcita';

export const CUSTOMER_TYPE = Object.freeze({
    retail: dictionaryEntryOf('retail', 'customerType.retail', 'default'),
    wholesale: dictionaryEntryOf('wholesale', 'customerType.wholesale', 'info'),
});

/**
 * Los tipos de cliente como opciones de la lista desplegable, con su explicación debajo de cada nombre.
 *
 * @param {(key: string) => string} t el traductor de la pantalla
 * @returns {Array<{value: string, label: string, description: string}>}
 */
export function customerTypeOptionsOf(t) {
    return Object.values(CUSTOMER_TYPE).map((entry) => ({value: entry.value, label: labelOf(entry, t), description: t(entry.tooltipKey)}));
}
