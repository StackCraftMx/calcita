// Diccionarios de valores cerrados que llegan del API → etiqueta, tooltip y color del chip (StatusChip, DictionaryText).
//
// El paquete trae el mecanismo; los diccionarios los arma cada proyecto con dictionaryEntryOf:
//
//   export const ORDER_STATUS = Object.freeze({
//       pending: dictionaryEntryOf('pending', 'orderStatus.pending', 'warning'),
//       paid: dictionaryEntryOf('paid', 'orderStatus.paid', 'success'),
//   });
//
// Forma de cada entrada: {value, labelKey, tooltipKey, color, isKnown} y, solo en algunas, shortLabelKey
//   - value: el código del API tal cual.
//   - labelKey / tooltipKey: llaves de texto del namespace "dictionaries" (los textos los pone el proyecto con `texts` o
//     `translate` de ToolkitProvider). El texto NUNCA va aquí: así cambia de idioma sin tocar el diccionario.
//   - shortLabelKey: palabra corta para una columna angosta («Rechazada» por «Rechazada por estructura»). Solo la traen
//     las entradas cuyo nombre completo no cabe; quien la pinta deja el nombre completo en el tooltip (StatusChip, short).
//   - color: color de paleta de MUI (success, warning, error, info, default).
//   - isKnown: false solo en la entrada "unknown"; sirve para pintar el código crudo cuando no hay texto (p. ej. un
//     estatus nuevo que el backend empezó a mandar).
//
// Se congelan con Object.freeze para que nadie los mute por accidente desde una pantalla.
// Un valor que el API mande y no esté en el diccionario no truena la pantalla: lookup regresa la entrada "unknown" y lo
// anota en el log para agregarlo.
//
// Funciones puras, no renderizan: function (regla de la casa).
import {createLogger} from '@/observability/logger.js';

const log = createLogger('dictionaries');

const NAMESPACE = 'dictionaries';

const UNKNOWN_ENTRY = Object.freeze({
    value: null,
    labelKey: `${NAMESPACE}:unknown.label`,
    tooltipKey: `${NAMESPACE}:unknown.tooltip`,
    color: 'default',
    isKnown: false,
});

/**
 * Una entrada de diccionario, congelada.
 *
 * @param {string} value el código del API
 * @param {string} keyPrefix dónde viven sus textos dentro del namespace dictionaries ('orderStatus.paid' → orderStatus.paid.label)
 * @param {string} color color de paleta de MUI
 * @param {{hasShortLabel?: boolean}} [options] hasShortLabel: trae palabra corta (keyPrefix.shortLabel)
 * @returns {{value: string, labelKey: string, tooltipKey: string, shortLabelKey?: string, color: string, isKnown: boolean}}
 */
export function dictionaryEntryOf(value, keyPrefix, color, {hasShortLabel = false} = {}) {
    return Object.freeze({
        value,
        labelKey: `${NAMESPACE}:${keyPrefix}.label`,
        tooltipKey: `${NAMESPACE}:${keyPrefix}.tooltip`,
        ...(hasShortLabel ? {shortLabelKey: `${NAMESPACE}:${keyPrefix}.shortLabel`} : {}),
        color,
        isKnown: true,
    });
}

/**
 * La entrada del diccionario para un valor del API.
 *
 * @param {Record<string, object>} dictionary p. ej. ORDER_STATUS
 * @param {string|null|undefined} value código del API
 * @returns {{value: string|null, labelKey: string, tooltipKey: string, color: string, isKnown: boolean}}
 */
export function lookup(dictionary, value) {
    if (value !== null && value !== undefined && Object.hasOwn(dictionary, value)) {
        return dictionary[value];
    }
    if (value !== null && value !== undefined) {
        log.warn('valor sin entrada en el diccionario', {value});
    }
    return {...UNKNOWN_ENTRY, value: value ?? null};
}

/**
 * Texto que se pinta para una entrada: su etiqueta traducida o, si el valor no está en el diccionario, el código
 * crudo. Un estatus nuevo se lee con su código y no como "Sin estatus".
 *
 * @param {{value: string|null, labelKey: string, isKnown: boolean}} dictionaryEntry lo que regresa lookup
 * @param {(key: string) => string} translate el t de useToolkitTranslation
 * @returns {string}
 */
export function labelOf(dictionaryEntry, translate) {
    if (dictionaryEntry.isKnown || dictionaryEntry.value === null) {
        return translate(dictionaryEntry.labelKey);
    }
    return dictionaryEntry.value;
}

/**
 * La palabra corta de una entrada, para una columna angosta. Una entrada sin palabra corta regresa su etiqueta de siempre.
 *
 * @param {object} dictionaryEntry entrada del diccionario (lookup)
 * @param {Function} translate traductor
 * @returns {string}
 */
export function shortLabelOf(dictionaryEntry, translate) {
    if (dictionaryEntry.isKnown && dictionaryEntry.shortLabelKey) {
        return translate(dictionaryEntry.shortLabelKey);
    }
    return labelOf(dictionaryEntry, translate);
}
