// Las llaves de los badges del menú: las comparten el menu.js del módulo (qué entrada lleva el conteo) y el servidor (de
// qué es cada conteo). Una sola lista para no escribir la misma palabra en dos lados.
export const MENU_BADGE_KEYS = Object.freeze({
    // pedidos que esperan pago: el badge de la Tabla
    pendingPayment: 'pendingPayment',
});
