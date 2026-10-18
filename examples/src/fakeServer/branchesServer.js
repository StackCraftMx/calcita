// Lo que respondería el API de las sucursales: dónde está cada una (latitud y longitud), su dirección y si está abierta.
// Datos de mentira en ciudades de México; las que se agregan viven en la memoria de la pestaña (al recargar se van).
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {ApiError} from '@/fakeServer/ApiError.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

/** El estado de una sucursal, como lo manda el API. */
export const BRANCH_STATUS = Object.freeze({open: 'open', remodeling: 'remodeling', closed: 'closed'});

/**
 * Las ciudades donde puede haber sucursal y su centro. Un backend de verdad saca la ubicación de la dirección (geocodifica);
 * este pone el alfiler en el centro de la ciudad, un poco recorrido por cada sucursal nueva para que no se encimen.
 */
export const BRANCH_CITIES = Object.freeze({
    'Ciudad de México': [19.4326, -99.1332],
    Guadalajara: [20.6597, -103.3496],
    Monterrey: [25.6866, -100.3161],
    Puebla: [19.0414, -98.2063],
    Querétaro: [20.5888, -100.3899],
    Mérida: [20.9674, -89.5926],
    Tijuana: [32.5149, -117.0382],
    León: [21.1250, -101.6860],
    Cancún: [21.1619, -86.8515],
});

const HTTP_STATUS = Object.freeze({unprocessable: 422});
// lo que se recorre el alfiler de cada sucursal nueva en la misma ciudad (grados): unas cuadras
const NEW_BRANCH_OFFSET_DEGREES = 0.012;

const branches = [
    {id: 'cdmx-centro', name: 'Centro Histórico', city: 'Ciudad de México', address: 'Av. Madero 32', position: [19.4342, -99.1386], status: BRANCH_STATUS.open, orders: 412},
    {id: 'cdmx-polanco', name: 'Polanco', city: 'Ciudad de México', address: 'Av. Presidente Masaryk 120', position: [19.4326, -99.1955], status: BRANCH_STATUS.open, orders: 388},
    {id: 'gdl-chapultepec', name: 'Chapultepec', city: 'Guadalajara', address: 'Av. Chapultepec 215', position: [20.6736, -103.3707], status: BRANCH_STATUS.open, orders: 296},
    {id: 'mty-san-pedro', name: 'San Pedro', city: 'Monterrey', address: 'Calzada del Valle 400', position: [25.6531, -100.3592], status: BRANCH_STATUS.remodeling, orders: 0},
    {id: 'pue-centro', name: 'Centro', city: 'Puebla', address: 'Calle 5 de Mayo 10', position: [19.0436, -98.1981], status: BRANCH_STATUS.open, orders: 154},
    {id: 'qro-juriquilla', name: 'Juriquilla', city: 'Querétaro', address: 'Blvd. Juriquilla 2210', position: [20.7020, -100.4446], status: BRANCH_STATUS.open, orders: 121},
    {id: 'mid-montejo', name: 'Paseo de Montejo', city: 'Mérida', address: 'Paseo de Montejo 485', position: [20.9876, -89.6181], status: BRANCH_STATUS.closed, orders: 0},
    {id: 'tij-rio', name: 'Zona Río', city: 'Tijuana', address: 'Paseo de los Héroes 9350', position: [32.5257, -117.0236], status: BRANCH_STATUS.open, orders: 98},
];

/** La sucursal como la manda el API: la posición en latitud y longitud. */
function toResponse({position, ...branch}) {
    return {...branch, latitude: position[0], longitude: position[1]};
}

/**
 * GET branches?status=: las sucursales, todas o las de un estado.
 *
 * @param {{status?: string|null}} [filters]
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{id: string, name: string, city: string, address: string, latitude: number, longitude: number, status: string, orders: number}>>}
 */
export async function listBranches({status = null} = {}, signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return branches.filter((branch) => !status || branch.status === status).map(toResponse);
}

/**
 * POST branches: una sucursal nueva. Valida como el backend: lo obligatorio, que la ciudad exista y que no se repita el
 * nombre en la misma ciudad (422 con el error en su campo).
 *
 * @param {{name: string, city: string, address: string, status: string}} input
 * @returns {Promise<{branch: object, message: string}>}
 */
export async function createBranch({name, city, address, status}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const cleanName = name?.trim() ?? '';
    const errors = {};
    if (!cleanName) {
        errors.name = [serverTextOf('branches.nameRequired')];
    } else if (branches.some((branch) => branch.city === city && branch.name.toLowerCase() === cleanName.toLowerCase())) {
        errors.name = [serverTextOf('branches.duplicateName', {name: cleanName, city})];
    }
    if (!BRANCH_CITIES[city]) {
        errors.city = [serverTextOf('branches.cityRequired')];
    }
    if (!address?.trim()) {
        errors.address = [serverTextOf('branches.addressRequired')];
    }
    if (Object.keys(errors).length > 0) {
        throw new ApiError({status: HTTP_STATUS.unprocessable, problem: {title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors}});
    }
    const [latitude, longitude] = BRANCH_CITIES[city];
    const sameCityCount = branches.filter((branch) => branch.city === city).length;
    const branch = {
        id: `branch-${Date.now()}`, name: cleanName, city, address: address.trim(), status, orders: 0,
        position: [latitude + NEW_BRANCH_OFFSET_DEGREES * sameCityCount, longitude + NEW_BRANCH_OFFSET_DEGREES * sameCityCount],
    };
    branches.push(branch);
    return {branch: toResponse(branch), message: serverTextOf('branches.created', {name: cleanName})};
}
