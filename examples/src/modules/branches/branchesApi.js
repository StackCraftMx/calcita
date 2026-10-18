// Las llamadas de la pantalla de sucursales, con los datos ya en la forma de MapView (position como [latitud, longitud]).
//
// Funciones que no renderizan: function (regla de la casa).
import {BRANCH_CITIES, BRANCH_STATUS, createBranch, listBranches} from '@/fakeServer/branchesServer.js';

export {BRANCH_STATUS};

/** Las ciudades donde puede haber sucursal, para la lista del formulario (en su proyecto vendrían del API). */
export const BRANCH_CITY_NAMES = Object.freeze(Object.keys(BRANCH_CITIES));

// el color del alfiler y de la etiqueta según el estado: verde abierta, ámbar en remodelación, rojo cerrada
const TONE_BY_STATUS = Object.freeze({[BRANCH_STATUS.open]: 'success', [BRANCH_STATUS.remodeling]: 'warning', [BRANCH_STATUS.closed]: 'error'});

/** La sucursal del API en la forma de la pantalla. */
function toScreen(branch) {
    return {...branch, position: [branch.latitude, branch.longitude], tone: TONE_BY_STATUS[branch.status]};
}

/**
 * @param {{status?: string|null}} filters
 * @param {AbortSignal} [signal]
 */
export async function loadBranches(filters, signal) {
    const branches = await listBranches(filters, signal);
    return branches.map(toScreen);
}

/**
 * Agrega una sucursal. Si el servidor dice que no (422), truena con su ApiError: el formulario pone cada error en su campo.
 *
 * @param {{name: string, city: string, address: string, status: string}} values
 * @returns {Promise<{branch: object, message: string}>}
 */
export async function addBranch(values) {
    const {branch, message} = await createBranch(values);
    return {branch: toScreen(branch), message};
}
