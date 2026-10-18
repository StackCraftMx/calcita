// La fecha corta de un mensaje en la lista, como la pintan los correos: si llegó hoy, la hora («09:14»); si no, el día
// («14 oct 2026»). «Hoy» es en la zona del negocio (la de ToolkitProvider), no la del servidor.
//
// Función pura (lee la zona vigente del paquete): function (regla de la casa).
import {formatDate, formatTime} from '@/formatting.js';

/**
 * @param {string} receivedAt el instante ISO
 * @param {Date} [now] para las pruebas; por omisión, ahora
 * @returns {string}
 */
export function inboxDateOf(receivedAt, now = new Date()) {
    return formatDate(receivedAt) === formatDate(now.toISOString()) ? formatTime(receivedAt) : formatDate(receivedAt);
}
