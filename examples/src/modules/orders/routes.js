// Las rutas del módulo de pedidos: la lista y el detalle.
import {APP_PATHS} from '@/core';
import {ORDER_DETAIL_ROUTE} from '@/modules/orders/ordersPaths.js';

// lazy: la pantalla (y la tabla de MUI X que trae) se descarga hasta que alguien la abre, no en la primera carga
export const routes = [
    {path: APP_PATHS.orders, lazy: async () => ({Component: (await import('@/modules/orders/OrdersPage.jsx')).OrdersPage})},
    {path: ORDER_DETAIL_ROUTE, lazy: async () => ({Component: (await import('@/modules/orders/OrderDetailPage.jsx')).OrderDetailPage})},
];
