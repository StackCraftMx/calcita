// Lo que respondería el API de catálogos: los estados de la República, para el campo de catálogo (se busca por clave o
// por nombre y viaja solo la clave).
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';

/** Los 32 estados con la clave de dos o tres letras con que viajan. */
export const MEXICAN_STATES = Object.freeze([
    {code: 'AGS', label: 'Aguascalientes'},
    {code: 'BC', label: 'Baja California'},
    {code: 'BCS', label: 'Baja California Sur'},
    {code: 'CAM', label: 'Campeche'},
    {code: 'CHIS', label: 'Chiapas'},
    {code: 'CHIH', label: 'Chihuahua'},
    {code: 'CDMX', label: 'Ciudad de México'},
    {code: 'COAH', label: 'Coahuila'},
    {code: 'COL', label: 'Colima'},
    {code: 'DGO', label: 'Durango'},
    {code: 'MEX', label: 'Estado de México'},
    {code: 'GTO', label: 'Guanajuato'},
    {code: 'GRO', label: 'Guerrero'},
    {code: 'HGO', label: 'Hidalgo'},
    {code: 'JAL', label: 'Jalisco'},
    {code: 'MICH', label: 'Michoacán'},
    {code: 'MOR', label: 'Morelos'},
    {code: 'NAY', label: 'Nayarit'},
    {code: 'NL', label: 'Nuevo León'},
    {code: 'OAX', label: 'Oaxaca'},
    {code: 'PUE', label: 'Puebla'},
    {code: 'QRO', label: 'Querétaro'},
    {code: 'QROO', label: 'Quintana Roo'},
    {code: 'SLP', label: 'San Luis Potosí'},
    {code: 'SIN', label: 'Sinaloa'},
    {code: 'SON', label: 'Sonora'},
    {code: 'TAB', label: 'Tabasco'},
    {code: 'TAMS', label: 'Tamaulipas'},
    {code: 'TLAX', label: 'Tlaxcala'},
    {code: 'VER', label: 'Veracruz'},
    {code: 'YUC', label: 'Yucatán'},
    {code: 'ZAC', label: 'Zacatecas'},
]);

/**
 * GET /catalogs/states: el catálogo de estados.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{code: string, label: string}>>}
 */
export async function getStatesCatalog(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return MEXICAN_STATES;
}
