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

// Los días en que el cliente recibe pedidos → su nombre (namespace dictionaries). Se eligen varios (FormSelectField multiple).
export const DELIVERY_DAY = Object.freeze({
    mon: dictionaryEntryOf('mon', 'deliveryDay.mon', 'default'),
    tue: dictionaryEntryOf('tue', 'deliveryDay.tue', 'default'),
    wed: dictionaryEntryOf('wed', 'deliveryDay.wed', 'default'),
    thu: dictionaryEntryOf('thu', 'deliveryDay.thu', 'default'),
    fri: dictionaryEntryOf('fri', 'deliveryDay.fri', 'default'),
    sat: dictionaryEntryOf('sat', 'deliveryDay.sat', 'default'),
});

/**
 * Los días de entrega como opciones de la lista, en el orden de la semana.
 *
 * @param {(key: string) => string} t el traductor de la pantalla
 * @returns {Array<{value: string, label: string}>}
 */
export function deliveryDayOptionsOf(t) {
    return Object.values(DELIVERY_DAY).map((entry) => ({value: entry.value, label: labelOf(entry, t)}));
}
