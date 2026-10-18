// Las llamadas de la pantalla de sucursales, con los datos ya en la forma de MapView (position como [latitud, longitud]).
//
// Funciones que no renderizan: function (regla de la casa).
import {BRANCH_STATUS, listBranches} from '@/fakeServer/branchesServer.js';

export {BRANCH_STATUS};

// el color del alfiler y de la etiqueta según el estado: verde abierta, ámbar en remodelación, rojo cerrada
const TONE_BY_STATUS = Object.freeze({[BRANCH_STATUS.open]: 'success', [BRANCH_STATUS.remodeling]: 'warning', [BRANCH_STATUS.closed]: 'error'});

/**
 * @param {{status?: string|null}} filters
 * @param {AbortSignal} [signal]
 */
export async function loadBranches(filters, signal) {
    const branches = await listBranches(filters, signal);
    return branches.map((branch) => ({...branch, position: [branch.latitude, branch.longitude], tone: TONE_BY_STATUS[branch.status]}));
}
