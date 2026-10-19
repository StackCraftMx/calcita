// Lo que el detalle de una cita decide sin pintar nada: cómo se dice su recordatorio (minutos, horas o días antes) y si su
// liga de reunión es una dirección web de verdad. Funciones puras: se prueban sin navegador (calendarEvents.test.js).
//
// Funciones puras, no renderizan: function (regla de la casa).

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/** La unidad del recordatorio (la llave de su texto: calendar.reminder.<unidad>). */
export const REMINDER_UNIT = Object.freeze({none: 'none', atStart: 'atStart', minutes: 'minutes', hours: 'hours', days: 'days'});

/**
 * Cómo se dice un recordatorio: «sin recordatorio», «al empezar», «15 minutos antes», «2 horas antes», «1 día antes». Usa la
 * unidad más grande que lo dice exacto (90 minutos se quedan en minutos).
 *
 * @param {number|null|undefined} minutes cuántos minutos antes; null sin recordatorio
 * @returns {{unit: string, count: number}}
 */
export function reminderOf(minutes) {
    if (minutes === null || minutes === undefined || minutes < 0) {
        return {unit: REMINDER_UNIT.none, count: 0};
    }
    if (minutes === 0) {
        return {unit: REMINDER_UNIT.atStart, count: 0};
    }
    if (minutes % MINUTES_PER_DAY === 0) {
        return {unit: REMINDER_UNIT.days, count: minutes / MINUTES_PER_DAY};
    }
    if (minutes % MINUTES_PER_HOUR === 0) {
        return {unit: REMINDER_UNIT.hours, count: minutes / MINUTES_PER_HOUR};
    }
    return {unit: REMINDER_UNIT.minutes, count: minutes};
}

/**
 * ¿La liga de reunión se puede abrir? Solo http y https: una liga «javascript:» o con otro esquema no se ofrece para abrir
 * (la pinta quien la escribió, pero nadie le da clic a algo raro desde la app).
 *
 * @param {string|null|undefined} url
 * @returns {boolean}
 */
export function isOpenableMeetingUrl(url) {
    try {
        return ['http:', 'https:'].includes(new URL(url).protocol);
    } catch {
        return false;
    }
}
