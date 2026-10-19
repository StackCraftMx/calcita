// La fecha corta de un mensaje en la lista, como la pintan los correos: si llegó hoy, la hora («09:14»); si no, el día
// («14 oct 2026»). «Hoy» es en la zona del negocio (la de ToolkitProvider), no la del servidor.
//
// Función pura: function (regla de la casa).
import {formatDate, formatTime} from '@/formatting.js';

/**
 * @param {string} receivedAt el instante ISO
 * @param {Date} [now] para las pruebas; por omisión, ahora
 * @param {{formatDate: Function, formatTime: Function}} [formatters] los de useFormatters (el proveedor más cercano); por
 *     omisión los sueltos (el de la raíz)
 * @returns {string}
 */
export function inboxDateOf(receivedAt, now = new Date(), formatters = {formatDate, formatTime}) {
    const isToday = formatters.formatDate(receivedAt) === formatters.formatDate(now.toISOString());
    return isToday ? formatters.formatTime(receivedAt) : formatters.formatDate(receivedAt);
}
