// Los topes de los cuatro campos de fecha cuando la fecha se TECLEA. El calendario ya apaga lo que queda fuera (minDate,
// maxDate, disablePast, disableFuture…), pero tecleada entraba igual y sin aviso: la casa le pasa al campo su propio error
// (el del formulario) y eso tapa el que calcula MUI X. Aquí se dice qué tope rompe lo tecleado, con el mensaje en el idioma
// activo, y a qué se corrige en el modo fix (LIMIT_MODE, fieldLimits.js).
//
// Cada campo manda su valor como texto que se ordena solo: '2026-11-11', '2026-11', '15:30' y el instante en UTC
// '2026-11-11T21:30:00Z'. Por eso se compara como texto, sin convertir.
//
// «Hoy» (disablePast y disableFuture) es el de la computadora de la persona, como lo calcula MUI X para apagar los días.
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (pickerLimits.test.js).
import dayjs from 'dayjs';

import {CALENDAR_DATE_FORMAT, CALENDAR_MONTH_FORMAT, INSTANT_FORMAT, zonedDayjs} from '@/datePickers/pickerValues.js';

/** De qué es el campo: fecha, fecha con hora, hora o mes. */
export const PICKER_KIND = Object.freeze({date: 'date', dateTime: 'dateTime', time: 'time', month: 'month'});

// el mensaje de cada clase de campo, con la misma forma que los de yup (validation.js)
const PROBLEM_KEYS_BY_KIND = Object.freeze({
    [PICKER_KIND.date]: {min: 'validation:dateMin', max: 'validation:dateMax'},
    [PICKER_KIND.dateTime]: {min: 'validation:dateMin', max: 'validation:dateMax'},
    [PICKER_KIND.time]: {min: 'validation:timeMin', max: 'validation:timeMax'},
    [PICKER_KIND.month]: {min: 'validation:monthMin', max: 'validation:monthMax'},
});

/**
 * «Ahora» con la forma del valor del campo; la hora del día no tiene pasado ni futuro.
 *
 * @param {string} kind PICKER_KIND
 * @param {number} now milisegundos
 * @returns {string|undefined}
 */
function nowTextOf(kind, now) {
    if (kind === PICKER_KIND.date) {
        return dayjs(now).format(CALENDAR_DATE_FORMAT);
    }
    if (kind === PICKER_KIND.month) {
        return dayjs(now).format(CALENDAR_MONTH_FORMAT);
    }
    if (kind === PICKER_KIND.dateTime) {
        return zonedDayjs().utc(now).format(INSTANT_FORMAT);
    }
    return undefined;
}

/**
 * El más tarde y el más temprano de varios valores (sin los vacíos).
 *
 * @param {Array<string|undefined|null>} texts
 * @param {1|-1} direction 1 = el más tarde, -1 = el más temprano
 * @returns {string|undefined}
 */
function outermostOf(texts, direction) {
    const present = texts.filter(Boolean);
    if (present.length === 0) {
        return undefined;
    }
    return present.reduce((chosen, text) => ((text > chosen) === (direction === 1) ? text : chosen));
}

/**
 * Los topes que de verdad aplican: el de la pantalla y el de «solo pasadas» o «solo futuras», el más estrecho.
 *
 * @param {object} limits
 * @param {string} [limits.min] con la forma del valor del campo
 * @param {string} [limits.max]
 * @param {boolean} [limits.disablePast]
 * @param {boolean} [limits.disableFuture]
 * @param {string} kind PICKER_KIND
 * @param {number} [now] milisegundos; por omisión, ahora
 * @returns {{min: string|undefined, max: string|undefined}}
 */
export function pickerBoundsOf({min, max, disablePast = false, disableFuture = false}, kind, now = Date.now()) {
    const nowText = nowTextOf(kind, now);
    return {
        min: outermostOf([min, disablePast ? nowText : undefined], 1),
        max: outermostOf([max, disableFuture ? nowText : undefined], -1),
    };
}

/**
 * El tope que rompe lo tecleado, con su mensaje; null si está dentro o vacío.
 *
 * @param {string|null|undefined} valueText el valor del campo
 * @param {{min?: string, max?: string}} bounds los de pickerBoundsOf
 * @param {string} kind PICKER_KIND
 * @param {(bound: string) => string} formatBound cómo se ve el tope en pantalla («01/11/2026»)
 * @returns {{key: string, values: object, rule: string}|null}
 */
export function pickerLimitProblemOf(valueText, bounds, kind, formatBound) {
    if (!valueText) {
        return null;
    }
    const keys = PROBLEM_KEYS_BY_KIND[kind];
    if (bounds.min && valueText < bounds.min) {
        return {key: keys.min, values: {min: formatBound(bounds.min)}, rule: 'min'};
    }
    if (bounds.max && valueText > bounds.max) {
        return {key: keys.max, values: {max: formatBound(bounds.max)}, rule: 'max'};
    }
    return null;
}

/**
 * Lo tecleado corregido al tope que rompe (modo fix); dentro del tope o vacío, igual.
 *
 * @param {string|null|undefined} valueText
 * @param {{min?: string, max?: string}} bounds
 * @returns {string|null|undefined}
 */
export function fixedPickerText(valueText, bounds) {
    if (!valueText) {
        return valueText;
    }
    if (bounds.min && valueText < bounds.min) {
        return bounds.min;
    }
    if (bounds.max && valueText > bounds.max) {
        return bounds.max;
    }
    return valueText;
}
