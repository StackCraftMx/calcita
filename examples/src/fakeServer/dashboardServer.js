// Lo que respondería el API del tablero: las cifras del último mes completo contra el anterior, lo vendido por mes, los
// productos que más se pidieron en el mes y los últimos pedidos.
//
// Las cifras salen de los mismos pedidos de la tabla, así que cuadran con ella. Los pedidos llegan hasta el 15 de
// octubre: octubre va a medias, por eso se compara el último mes completo (septiembre) contra el anterior (agosto); un
// mes a medias contra uno entero siempre «bajaría». Los importes se suman con Money, al centavo.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {Money} from '@stackcraftmx/calcita/money';

import {LAST_ORDER_DATE, ORDER_STATUSES, STORE_CURRENCY, fakeOrders} from '@/fakeServer/fakeOrders.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {storeMonthOf} from '@/fakeServer/storeCalendar.js';

// cuántos productos y cuántos pedidos recientes manda
const TOP_PRODUCTS_COUNT = 5;
const RECENT_ORDERS_COUNT = 6;

/**
 * El mes anterior a uno ('2026-01' → '2025-12').
 *
 * @param {string} month AAAA-MM
 * @returns {string}
 */
function previousMonthOf(month) {
    const [year, monthNumber] = month.split('-').map(Number);
    return monthNumber === 1 ? `${year - 1}-12` : `${year}-${String(monthNumber - 1).padStart(2, '0')}`;
}

/**
 * Las cifras de un mes: pedidos recibidos, vendido (sin cancelados), cancelados y el ticket promedio.
 *
 * @param {string} month AAAA-MM
 * @returns {{orders: number, canceled: number, sold_amount: string, average_ticket: string}}
 */
function monthFiguresOf(month) {
    const monthOrders = fakeOrders.filter((order) => storeMonthOf(order.created_at) === month);
    const soldOrders = monthOrders.filter((order) => order.status !== ORDER_STATUSES.canceled);
    const soldAmount = soldOrders.reduce((total, order) => total.plus(Money.fromString(order.total, {currency: STORE_CURRENCY})), Money.zero({currency: STORE_CURRENCY}));
    return {
        orders: monthOrders.length,
        canceled: monthOrders.length - soldOrders.length,
        // los importes viajan en texto, como un NUMERIC de la base
        sold_amount: soldAmount.amount(),
        average_ticket: soldOrders.length > 0 ? soldAmount.dividedBy(soldOrders.length).amount() : '0.00',
    };
}

/**
 * Los productos que más se pidieron en el mes.
 *
 * @param {string} month
 * @returns {Array<{product_name: string, orders: number}>}
 */
function topProductsOf(month) {
    const ordersByProduct = new Map();
    for (const order of fakeOrders) {
        if (storeMonthOf(order.created_at) === month) {
            ordersByProduct.set(order.product_name, (ordersByProduct.get(order.product_name) ?? 0) + 1);
        }
    }
    return [...ordersByProduct.entries()]
        .map(([productName, orders]) => ({product_name: productName, orders}))
        .sort((first, second) => second.orders - first.orders || first.product_name.localeCompare(second.product_name))
        .slice(0, TOP_PRODUCTS_COUNT);
}

/**
 * GET dashboard.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<object>}
 */
export async function getDashboard(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    const currentMonth = previousMonthOf(LAST_ORDER_DATE.slice(0, 7));
    const previousMonth = previousMonthOf(currentMonth);
    const months = [...new Set(fakeOrders.map((order) => storeMonthOf(order.created_at)))].filter((month) => month <= currentMonth).sort();
    const recentOrders = [...fakeOrders]
        .sort((first, second) => second.created_at.localeCompare(first.created_at))
        .slice(0, RECENT_ORDERS_COUNT)
        .map(({id, number, customer_name: customerName, product_name: productName, total, status, created_at: createdAt}) => ({
            id, number, customer_name: customerName, product_name: productName, total, status, created_at: createdAt,
        }));

    return {
        currency: STORE_CURRENCY,
        current_month: currentMonth,
        previous_month: previousMonth,
        current: monthFiguresOf(currentMonth),
        previous: monthFiguresOf(previousMonth),
        monthly: months.map((month) => ({month, sold_amount: monthFiguresOf(month).sold_amount})),
        top_products: topProductsOf(currentMonth),
        recent_orders: recentOrders,
    };
}
