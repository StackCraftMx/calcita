// Lo que respondería el API de los documentos fiscales de la tienda de ejemplo: las facturas de proveedores que se cargan
// (una por folio fiscal). La e.firma no pasa por aquí: se revisa en el navegador (EfirmaFields).
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {isValidRfc} from '@stackcraftmx/calcita/mexico';

import {ApiError} from '@/fakeServer/ApiError.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

const HTTP_STATUS = Object.freeze({conflict: 409, unprocessable: 422});
/** El RFC de la tienda de ejemplo (el genérico de pruebas del SAT): el que deben traer las facturas y la e.firma. */
export const STORE_RFC = 'AAA010101AAA';

const invoices = [
    {uuid: '0C3E5A7B-1D2F-4A6B-9C8D-7E6F5A4B3C2D', issuer_rfc: 'EKU9003173C9', issuer_name: 'PROVEEDOR DE EJEMPLO', total: '5800.00', currency: 'MXN', issued_at: '2026-10-12T11:05:00', loaded_at: '2026-10-13T16:20:00Z'},
];

/**
 * GET fiscal/invoices: las facturas cargadas, la más nueva primero.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<object[]>}
 */
export async function listInvoices(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return [...invoices].reverse();
}

/**
 * POST fiscal/invoices: carga una factura. El servidor vuelve a revisar lo que importa: que sea para la tienda y que su folio
 * fiscal no esté cargado (409 si ya está).
 *
 * @param {{uuid: string, issuerRfc: string, issuerName: string, receiverRfc: string, total: string, currency: string, issuedAt: string}} invoice
 * @returns {Promise<{message: string}>}
 */
export async function uploadInvoice(invoice) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    if (invoice.receiverRfc !== STORE_RFC) {
        throw new ApiError({status: HTTP_STATUS.unprocessable, problem: {title: serverTextOf('fiscal.invoiceRejected'), detail: serverTextOf('fiscal.otherReceiver', {rfc: invoice.receiverRfc})}});
    }
    if (!invoice.uuid || !isValidRfc(invoice.issuerRfc)) {
        throw new ApiError({status: HTTP_STATUS.unprocessable, problem: {title: serverTextOf('fiscal.invoiceRejected'), detail: serverTextOf('fiscal.incomplete')}});
    }
    if (invoices.some((loaded) => loaded.uuid === invoice.uuid)) {
        throw new ApiError({status: HTTP_STATUS.conflict, problem: {title: serverTextOf('fiscal.invoiceRejected'), detail: serverTextOf('fiscal.alreadyLoaded', {uuid: invoice.uuid})}});
    }
    invoices.push({
        uuid: invoice.uuid, issuer_rfc: invoice.issuerRfc, issuer_name: invoice.issuerName, total: invoice.total, currency: invoice.currency,
        issued_at: invoice.issuedAt, loaded_at: new Date().toISOString(),
    });
    return {message: serverTextOf('fiscal.loaded', {name: invoice.issuerName})};
}
