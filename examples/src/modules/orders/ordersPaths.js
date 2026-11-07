// Las direcciones propias del módulo de pedidos. La de la lista vive en core (la usan la barra y las métricas).
import {APP_PATHS} from '@/core';

/** La ruta del detalle, con su parámetro. */
export const ORDER_DETAIL_ROUTE = `${APP_PATHS.orders}/:orderId`;

/**
 * La ruta del comprobante, con su parámetro. Fuera de /orders a propósito: es la liga que se comparte con el cliente. La
 * pantalla le dice al menú que es de los pedidos (useActiveMenuPath).
 */
export const ORDER_RECEIPT_ROUTE = '/receipts/:orderId';

/**
 * La llave con que la lista anota su última URL (filtros, orden, página): el «Regresar» del detalle la usa cuando no hay
 * historial (el detalle se abrió en otra pestaña o se recargó).
 */
export const ORDERS_LIST_KEY = 'orders';

/**
 * La dirección del detalle de un pedido.
 *
 * @param {number|string} orderId
 * @returns {string}
 */
export function orderDetailPathOf(orderId) {
    return `${APP_PATHS.orders}/${orderId}`;
}

/**
 * La dirección del comprobante de un pedido.
 *
 * @param {number|string} orderId
 * @returns {string}
 */
export function orderReceiptPathOf(orderId) {
    return `/receipts/${orderId}`;
}
