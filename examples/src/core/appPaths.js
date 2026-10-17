// Las direcciones de las pantallas que usa más de un módulo: la barra de navegación y las ligas que llevan de una
// pantalla a otra (una tarjeta de métricas que abre la tabla ya filtrada).
//
// Viven en core porque los módulos no se importan entre sí: métricas no puede importar el módulo de pedidos para saber su
// dirección.

/** La dirección de cada ejemplo. */
export const APP_PATHS = Object.freeze({
    home: '/',
    orders: '/orders',
    customers: '/customers',
    feedback: '/feedback',
    uploads: '/uploads',
    reports: '/reports',
    metrics: '/metrics',
    glass: '/glass',
    themeBuilder: '/theme',
    dashboard: '/dashboard',
    profile: '/profile',
    profiles: '/profiles',
    // las de entrar, fuera del marco (sin sesión)
    signIn: '/sign-in',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
});

/**
 * El prefijo de la tabla de pedidos en la URL. ServerTable guarda cada filtro como <prefijo>_<campo>
 * (?orders_status=pending), así un enlace puede abrir la tabla ya filtrada.
 */
export const ORDERS_TABLE_PREFIX = 'orders';

/**
 * La tabla de pedidos filtrada por un valor de un campo: ordersListFilteredBy('status', 'pending') →
 * '/orders?orders_status=pending'.
 *
 * @param {string} field el campo del filtro (el de filterDefaults de la tabla)
 * @param {string} value el valor
 * @returns {string}
 */
export function ordersListFilteredBy(field, value) {
    const query = new URLSearchParams({[`${ORDERS_TABLE_PREFIX}_${field}`]: value});
    return `${APP_PATHS.orders}?${query}`;
}

/**
 * La dirección del detalle de un pedido: la usan la tabla de pedidos y el tablero (sus últimos pedidos).
 *
 * @param {number|string} orderId
 * @returns {string}
 */
export function orderDetailPathOf(orderId) {
    return `${APP_PATHS.orders}/${orderId}`;
}
