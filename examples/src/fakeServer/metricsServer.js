// Lo que respondería el API de cifras de la tienda: los conteos por estado, por mes, por producto y por día que pintan
// las métricas y el reporte en Excel.
//
// Las cifras salen de los mismos pedidos de la tabla, así que cuadran con ella: la tarjeta de «pendientes» dice lo mismo
// que la tabla filtrada por pendientes. Los importes se suman con Money, al centavo.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {Money} from '@stackcraftmx/calcita/money';

import {FIRST_ORDER_DATE, LAST_ORDER_DATE, ORDER_STATUSES, STORE_CURRENCY, fakeOrders} from '@/fakeServer/fakeOrders.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {storeDateOf, storeMonthOf} from '@/fakeServer/storeCalendar.js';

/**
 * El importe de un pedido como Money.
 *
 * @param {object} order
 * @returns {Money}
 */
function amountOf(order) {
    return Money.fromString(order.total, {currency: STORE_CURRENCY});
}

/**
 * Cuántos pedidos hay en cada estado y en total.
 *
 * @returns {Record<string, number>}
 */
function statusTotalsOf() {
    const totals = {all: fakeOrders.length};
    for (const status of Object.values(ORDER_STATUSES)) {
        totals[status] = fakeOrders.filter((order) => order.status === status).length;
    }
    return totals;
}

/**
 * Las cifras de cada mes: recibidos, entregados, cancelados y lo vendido.
 *
 * @returns {Array<{month: string, received: number, delivered: number, canceled: number, sold_amount: string}>}
 */
function monthlyFiguresOf() {
    const figuresByMonth = new Map();
    for (const order of fakeOrders) {
        const month = storeMonthOf(order.created_at);
        if (!figuresByMonth.has(month)) {
            figuresByMonth.set(month, {month, received: 0, delivered: 0, canceled: 0, soldAmount: Money.zero({currency: STORE_CURRENCY})});
        }
        const figures = figuresByMonth.get(month);
        figures.received += 1;
        if (order.status === ORDER_STATUSES.delivered) {
            figures.delivered += 1;
        }
        if (order.status === ORDER_STATUSES.canceled) {
            figures.canceled += 1;
        } else {
            figures.soldAmount = figures.soldAmount.plus(amountOf(order));
        }
    }

    // el importe viaja en texto, como un NUMERIC de la base
    return [...figuresByMonth.values()].map(({soldAmount, ...counts}) => ({...counts, sold_amount: soldAmount.amount()}));
}

/**
 * Los pedidos de cada producto (todos, como los cuenta la tabla filtrada por ese producto) y lo vendido (sin los
 * cancelados), del que más pedidos tiene al que menos.
 *
 * @returns {Array<{product_name: string, orders: number, sold_amount: string}>}
 */
function productFiguresOf() {
    const figuresByProduct = new Map();
    for (const order of fakeOrders) {
        const figures = figuresByProduct.get(order.product_name) ?? {orders: 0, soldAmount: Money.zero({currency: STORE_CURRENCY})};
        const isSold = order.status !== ORDER_STATUSES.canceled;
        figuresByProduct.set(order.product_name, {
            orders: figures.orders + 1,
            soldAmount: isSold ? figures.soldAmount.plus(amountOf(order)) : figures.soldAmount,
        });
    }

    return [...figuresByProduct.entries()]
        .map(([productName, figures]) => ({product_name: productName, orders: figures.orders, sold_amount: figures.soldAmount.amount()}))
        .sort((first, second) => second.orders - first.orders);
}

/**
 * Cuántos pedidos llegaron cada día (solo los días con pedidos).
 *
 * @returns {Array<{date: string, orders: number}>}
 */
function dailyOrdersOf() {
    const ordersByDate = new Map();
    for (const order of fakeOrders) {
        const date = storeDateOf(order.created_at);
        ordersByDate.set(date, (ordersByDate.get(date) ?? 0) + 1);
    }
    return [...ordersByDate.entries()].map(([date, orders]) => ({date, orders}));
}

/**
 * GET /metrics/orders: todas las cifras de los pedidos.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function getOrderMetrics(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return {
        first_date: FIRST_ORDER_DATE,
        last_date: LAST_ORDER_DATE,
        currency: STORE_CURRENCY,
        status_totals: statusTotalsOf(),
        months: monthlyFiguresOf(),
        products: productFiguresOf(),
        days: dailyOrdersOf(),
    };
}
