// Lo que respondería el API de pedidos: la tabla, el detalle, el historial, la cancelación, los recordatorios y la
// bitácora para descargar.
//
// Cada función hace lo mismo que un endpoint: espera como la red, aplica las reglas del negocio y regresa los datos o un
// ApiError con su problema RFC 9457, con los textos en el idioma que pidió la pantalla.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {Money} from '@stackcraftmx/calcita/money';

import {MENU_BADGE_KEYS} from '@/core';
import {ApiError} from '@/fakeServer/ApiError.js';
import {ORDER_STATUSES, STORE_CURRENCY, fakeOrders, orderEventsOf} from '@/fakeServer/fakeOrders.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';
import {containsText, serverPageOf} from '@/fakeServer/serverPage.js';
import {storeDateOf} from '@/fakeServer/storeCalendar.js';

const HTTP_STATUS = Object.freeze({notFound: 404, conflict: 409});

// las reglas de cada filtro de la tabla de pedidos (los campos de filterDefaults de la pantalla)
const ORDER_FILTER_RULES = Object.freeze({
    // la caja de búsqueda: el número, el cliente o el producto
    contains: (order, search) => [order.number, order.customer_name, order.product_name].some((text) => containsText(text, search)),
    number: (order, search) => containsText(order.number, search),
    customer_name: (order, search) => containsText(order.customer_name, search),
    product_name: (order, search) => containsText(order.product_name, search),
    status: (order, statuses) => statuses.includes(order.status),
    payment_method: (order, methods) => methods.includes(order.payment_method),
    // el rango de fechas son días de la tienda (AAAA-MM-DD), con los dos extremos adentro
    created_from: (order, fromDate) => storeDateOf(order.created_at) >= fromDate,
    created_to: (order, toDate) => storeDateOf(order.created_at) <= toDate,
});

const ORDER_PAGE_RULES = Object.freeze({
    filterRules: ORDER_FILTER_RULES,
    facetFields: ['status', 'payment_method'],
    // el importe viaja en texto: se ordena por sus centavos
    sortValues: {total: (order) => Money.fromString(order.total, {currency: STORE_CURRENCY}).minorUnits},
    // sin orden elegido, lo más nuevo primero
    defaultSort: {column: 'created_at', direction: 'desc'},
});

const HISTORY_PAGE_RULES = Object.freeze({
    filterRules: {event: (event, events) => events.includes(event.event)},
    facetFields: ['event'],
    defaultSort: {column: 'occurred_at', direction: 'desc'},
});

// los estados en que un pedido ya salió del almacén: ahí ya no se cancela
const STATUSES_THAT_CANNOT_CANCEL = [ORDER_STATUSES.shipped, ORDER_STATUSES.delivered];
// un recordatorio de pago va a los pedidos que siguen sin pagar
const STATUS_THAT_NEEDS_REMINDER = ORDER_STATUSES.pending;

/**
 * Lo que el API regresa de un pedido: todo menos los campos internos del servidor.
 *
 * @param {object} order
 * @returns {object}
 */
function orderResponseOf(order) {
    const {needs_second_attempt: needsSecondAttempt, ...publicFields} = order;
    return publicFields;
}

/**
 * El pedido de un id o un 404.
 *
 * @param {number|string} orderId
 * @returns {object}
 */
function findOrderOrFail(orderId) {
    const order = fakeOrders.find((candidate) => candidate.id === Number(orderId));
    if (!order) {
        throw new ApiError({
            status: HTTP_STATUS.notFound,
            problem: {
                status: HTTP_STATUS.notFound, code: 'order_not_found',
                title: serverTextOf('orders.notFoundTitle'), detail: serverTextOf('orders.notFoundDetail', {orderId}),
            },
        });
    }
    return order;
}

/**
 * GET /orders: una página de la tabla de pedidos.
 *
 * @param {object} request {filters, sortOrders, page, pageSize} de ServerTable
 * @param {AbortSignal} [signal]
 * @returns {Promise<{rows: object[], total: number, facets: object}>}
 */
export async function getOrdersPage(request, signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    const page = serverPageOf(fakeOrders, request, ORDER_PAGE_RULES);
    return {...page, rows: page.rows.map(orderResponseOf)};
}

/**
 * GET /orders/{id}: un pedido.
 *
 * @param {number|string} orderId
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function getOrder(orderId, signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return orderResponseOf(findOrderOrFail(orderId));
}

/**
 * GET /orders/{id}/history: una página del historial, con la forma que pide AuditTrailTable.
 *
 * @param {number|string} orderId
 * @param {object} request {filters: {event}, sortOrders, page, pageSize}
 * @param {AbortSignal} [signal]
 * @returns {Promise<{rows: object[], total: number, facets: object}>}
 */
export async function getOrderHistoryPage(orderId, request, signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    const order = findOrderOrFail(orderId);
    const page = serverPageOf(orderEventsOf(order), request, HISTORY_PAGE_RULES);
    return {...page, rows: page.rows.map((event) => historyRowOf(event, order))};
}

/**
 * GET /orders/{id}/events: todo el historial en orden, para la línea de tiempo de la entrega.
 *
 * @param {number|string} orderId
 * @param {AbortSignal} [signal]
 * @returns {Promise<object[]>}
 */
export async function getOrderEvents(orderId, signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    const order = findOrderOrFail(orderId);
    return orderEventsOf(order).map((event) => historyRowOf(event, order));
}

/**
 * Un evento como lo regresa el API: la nota ya traducida, en lugar de su llave.
 *
 * @param {object} event de orderEventsOf
 * @param {object} order
 * @returns {object}
 */
function historyRowOf(event, order) {
    const {note_key: noteKey, ...publicFields} = event;
    return {...publicFields, note: noteKey ? serverTextOf(noteKey, {reason: order.cancel_reason}) : null};
}

/**
 * POST /orders/{id}/cancel: cancela un pedido que todavía no sale del almacén.
 *
 * @param {number|string} orderId
 * @param {string} reason el motivo que escribió la persona
 * @returns {Promise<{message: string}>}
 */
export async function cancelOrder(orderId, reason) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS * 2);
    const order = findOrderOrFail(orderId);

    if (order.status === ORDER_STATUSES.canceled || STATUSES_THAT_CANNOT_CANCEL.includes(order.status)) {
        const detailKey = order.status === ORDER_STATUSES.canceled ? 'orders.alreadyCanceled' : 'orders.alreadyShipped';
        throw new ApiError({
            status: HTTP_STATUS.conflict,
            problem: {
                status: HTTP_STATUS.conflict, code: 'order_cannot_be_canceled',
                title: serverTextOf('orders.cannotCancelTitle'), detail: serverTextOf(detailKey, {number: order.number}),
            },
        });
    }

    order.status = ORDER_STATUSES.canceled;
    order.canceled_at = new Date().toISOString();
    order.canceled_by = {id: 'sample-user', name: serverTextOf('orders.sampleUser')};
    order.cancel_reason = reason;

    return {message: serverTextOf('orders.canceled', {number: order.number})};
}

/**
 * GET /orders/pending-reminders: cuántos clientes recibirían el recordatorio de pago.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<{customers: number}>}
 */
export async function getPendingReminders(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return {customers: customersWithPendingOrders().length};
}

/**
 * POST /orders/pending-reminders: manda el recordatorio de pago a los clientes con pedidos sin pagar.
 *
 * @returns {Promise<{message: string}>}
 */
export async function sendPendingReminders() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS * 3);
    const count = customersWithPendingOrders().length;
    const messageKey = count === 1 ? 'orders.remindersSentOne' : 'orders.remindersSentOther';
    return {message: serverTextOf(messageKey, {count})};
}

/**
 * Los correos de los clientes con algún pedido sin pagar, sin repetir.
 *
 * @returns {string[]}
 */
function customersWithPendingOrders() {
    const pendingOrders = fakeOrders.filter((order) => order.status === STATUS_THAT_NEEDS_REMINDER);
    return [...new Set(pendingOrders.map((order) => order.customer_email))];
}

/**
 * Todos los pedidos, del más nuevo al más viejo, para la bitácora en CSV.
 *
 * @returns {object[]}
 */
export function allOrdersNewestFirst() {
    return [...fakeOrders].reverse().map(orderResponseOf);
}

/**
 * GET /users/badges: lo pendiente de cada pantalla, para los badges del menú (una lista de
 * {badgeKey, count}). Aquí, los pedidos que esperan pago.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<{badges: Array<{badgeKey: string, count: number}>}>}
 */
export async function getMenuBadges(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    const pendingPayment = fakeOrders.filter((order) => order.status === STATUS_THAT_NEEDS_REMINDER).length;
    return {badges: [{badgeKey: MENU_BADGE_KEYS.pendingPayment, count: pendingPayment}]};
}
