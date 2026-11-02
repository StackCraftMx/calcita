// Cuánto falta para un momento (el cierre de una subasta, el inicio de una cita, el fin de una oferta), en días, horas,
// minutos y segundos, y cómo se escribe como reloj. Lo usan useCountdown y Countdown.
//
// Puro (sin React): se prueba con node (countdownParts.test.js).
//
// Genérico del paquete: function (regla de la casa).

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86_400;
const TWO_DIGITS = 2;

/**
 * El momento en milisegundos: un instante en texto ('2026-11-01T18:30:00Z'), un Date o milisegundos.
 *
 * @param {string|number|Date} until
 * @returns {number} NaN si no se entiende
 */
export function instantMillisecondsOf(until) {
    if (until instanceof Date) {
        return until.getTime();
    }
    return typeof until === 'number' ? until : Date.parse(until);
}

/**
 * Lo que falta, partido. Ya pasado (o un momento que no se entiende) es todo en cero con isOver.
 *
 * @param {string|number|Date} until
 * @param {number} now milisegundos de ahora (Date.now())
 * @returns {{days: number, hours: number, minutes: number, seconds: number, totalSeconds: number, isOver: boolean}}
 */
export function countdownPartsOf(until, now) {
    const remainingMilliseconds = instantMillisecondsOf(until) - now;
    // se redondea hacia arriba: con 0.4 s por delante todavía dice 00:00:01 y no «ya terminó» antes de tiempo
    const totalSeconds = Number.isFinite(remainingMilliseconds) && remainingMilliseconds > 0
        ? Math.ceil(remainingMilliseconds / MILLISECONDS_PER_SECOND)
        : 0;
    return {
        days: Math.floor(totalSeconds / SECONDS_PER_DAY),
        hours: Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
        minutes: Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
        seconds: totalSeconds % SECONDS_PER_MINUTE,
        totalSeconds,
        isOver: totalSeconds === 0,
    };
}

/**
 * Lo que falta como reloj: «02:14:30»; con días, «3 d 02:14:30» (la letra del día la da el idioma); sin segundos,
 * «02:14».
 *
 * @param {{days: number, hours: number, minutes: number, seconds: number}} parts
 * @param {{daysLabel?: string, showSeconds?: boolean}} [options] daysLabel: la abreviatura de días ya traducida ('d')
 * @returns {string}
 */
export function countdownClockOf({days, hours, minutes, seconds}, {daysLabel = 'd', showSeconds = true} = {}) {
    const twoDigits = (value) => String(value).padStart(TWO_DIGITS, '0');
    const clock = [hours, minutes, ...(showSeconds ? [seconds] : [])].map(twoDigits).join(':');
    return days > 0 ? `${days} ${daysLabel} ${clock}` : clock;
}
