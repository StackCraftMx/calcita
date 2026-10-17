// El calendario de la tienda de mentira: en qué zona vive y cómo se pasa un instante a su día de calendario.
//
// Los instantes se guardan en UTC (como timestamptz) y los días se cuentan en la zona de la tienda: un pedido de las
// 11 de la noche en la Ciudad de México ya es el día siguiente en UTC, y contarlo en UTC lo movería de día.
//
// Funciones puras, sin React: function (regla de la casa).

/** La zona de la tienda. México no cambia de horario desde 2022: la hora local es siempre UTC−6. */
export const STORE_TIME_ZONE = 'America/Mexico_City';
export const STORE_UTC_OFFSET_HOURS = -6;

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
export const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

// en-CA escribe las fechas como AAAA-MM-DD, la forma de una fecha de calendario
const CALENDAR_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {timeZone: STORE_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit'});

/**
 * El día de calendario de la tienda en que cae un instante.
 *
 * @param {string} isoInstant '2026-03-01T05:30:00.000Z'
 * @returns {string} '2026-02-28' (en la Ciudad de México todavía era el 28)
 */
export function storeDateOf(isoInstant) {
    return CALENDAR_DATE_FORMAT.format(new Date(isoInstant));
}

/**
 * El mes de la tienda en que cae un instante.
 *
 * @param {string} isoInstant
 * @returns {string} '2026-02'
 */
export function storeMonthOf(isoInstant) {
    return storeDateOf(isoInstant).slice(0, 7);
}

/**
 * El instante UTC de una hora local de la tienda.
 *
 * @param {string} storeDate '2026-03-01'
 * @param {number} hour 0 a 23, hora de la tienda
 * @param {number} minute
 * @returns {string} instante ISO en UTC
 */
export function instantAtStoreTime(storeDate, hour, minute) {
    const [year, month, day] = storeDate.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, hour - STORE_UTC_OFFSET_HOURS, minute)).toISOString();
}

/**
 * Un instante más unas horas.
 *
 * @param {string} isoInstant
 * @param {number} hours
 * @returns {string}
 */
export function addHours(isoInstant, hours) {
    return new Date(new Date(isoInstant).getTime() + hours * MILLISECONDS_PER_HOUR).toISOString();
}
