// Lo que respondería el API de las sucursales: dónde está cada una (latitud y longitud), su dirección y si está abierta.
// Datos de mentira y fijos, en ciudades de México.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';

/** El estado de una sucursal, como lo manda el API. */
export const BRANCH_STATUS = Object.freeze({open: 'open', remodeling: 'remodeling', closed: 'closed'});

const BRANCHES = Object.freeze([
    {id: 'cdmx-centro', name: 'Centro Histórico', city: 'Ciudad de México', address: 'Av. Madero 32', position: [19.4342, -99.1386], status: BRANCH_STATUS.open, orders: 412},
    {id: 'cdmx-polanco', name: 'Polanco', city: 'Ciudad de México', address: 'Av. Presidente Masaryk 120', position: [19.4326, -99.1955], status: BRANCH_STATUS.open, orders: 388},
    {id: 'gdl-chapultepec', name: 'Chapultepec', city: 'Guadalajara', address: 'Av. Chapultepec 215', position: [20.6736, -103.3707], status: BRANCH_STATUS.open, orders: 296},
    {id: 'mty-san-pedro', name: 'San Pedro', city: 'Monterrey', address: 'Calzada del Valle 400', position: [25.6531, -100.3592], status: BRANCH_STATUS.remodeling, orders: 0},
    {id: 'pue-centro', name: 'Centro', city: 'Puebla', address: 'Calle 5 de Mayo 10', position: [19.0436, -98.1981], status: BRANCH_STATUS.open, orders: 154},
    {id: 'qro-juriquilla', name: 'Juriquilla', city: 'Querétaro', address: 'Blvd. Juriquilla 2210', position: [20.7020, -100.4446], status: BRANCH_STATUS.open, orders: 121},
    {id: 'mid-montejo', name: 'Paseo de Montejo', city: 'Mérida', address: 'Paseo de Montejo 485', position: [20.9876, -89.6181], status: BRANCH_STATUS.closed, orders: 0},
    {id: 'tij-rio', name: 'Zona Río', city: 'Tijuana', address: 'Paseo de los Héroes 9350', position: [32.5257, -117.0236], status: BRANCH_STATUS.open, orders: 98},
]);

/**
 * GET branches?status=: las sucursales, todas o las de un estado.
 *
 * @param {{status?: string|null}} [filters]
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{id: string, name: string, city: string, address: string, latitude: number, longitude: number, status: string, orders: number}>>}
 */
export async function listBranches({status = null} = {}, signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return BRANCHES.filter((branch) => !status || branch.status === status).map(({position, ...branch}) => ({
        ...branch, latitude: position[0], longitude: position[1],
    }));
}
