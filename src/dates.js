// Fechas que llegan del API, leídas sin librería (Date + Intl).
//
// La zona en que se pintan las horas es la del proveedor (`timeZone` de ToolkitProvider; por omisión la del navegador).
// Un negocio que decide sus cortes en una zona fija la pasa ahí, para que alguien que abre la pantalla desde otra zona
// vea la misma hora que ve operación.
//
// El backend manda instantes ISO con desfase (UTC) y fechas de calendario sin hora ("2026-08-16"). Son dos cosas
// distintas:
//   - un instante es un punto en el tiempo (parseInstant); la zona del negocio la aplica Intl con timeZone al
//     pintarlo (formatting.js), así que aquí no se convierte nada;
//   - una fecha de calendario NO tiene zona: pasarla por Date la podría correr un día (parsePlainDate la separa en
//     año, mes y día).
//
// Funciones puras, no renderizan: function (regla de la casa).

const PLAIN_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Un instante (ISO con desfase, milisegundos o Date) como Date válido.
 *
 * @param {string|Date|number|null|undefined} value
 * @returns {Date|null} null si no hay dato o no es una fecha válida
 */
export function parseInstant(value) {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const instant = new Date(value);
    return Number.isNaN(instant.getTime()) ? null : instant;
}

/**
 * Una fecha de calendario ("2026-08-16") en sus partes, sin moverla de zona.
 *
 * @param {string|null|undefined} value
 * @returns {{year: number, month: number, day: number}|null} null si no tiene la forma o no existe (2026-02-31)
 */
export function parsePlainDate(value) {
    const match = typeof value === 'string' ? PLAIN_DATE_PATTERN.exec(value) : null;
    if (!match) {
        return null;
    }
    const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
    // guard clause: Date.UTC "arregla" el 31 de febrero pasándolo a marzo; si el día cambió, la fecha no existe
    const calendarDate = new Date(Date.UTC(year, month - 1, day));
    if (calendarDate.getUTCMonth() !== month - 1 || calendarDate.getUTCDate() !== day) {
        return null;
    }
    return {year, month, day};
}
