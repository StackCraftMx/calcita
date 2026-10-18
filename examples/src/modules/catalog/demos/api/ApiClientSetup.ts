// El cliente de su proyecto: UNO, en su core (core/api.ts). Cada módulo lo usa desde su *Api.ts: las pantallas nunca
// escriben direcciones ni manejan errores de red a mano.
import {createApiClient} from '@stackcraftmx/calcita';

// 1. El cliente, con la dirección de su API y cómo entra la persona. Lo de abajo es un ejemplo con Laravel; la tabla
//    «Cómo se extiende» trae todo lo que acepta (token en lugar de cookie, encabezados, tiempo máximo…)
export const api = createApiClient({
    // lo que va antes de cada camino
    baseUrl: '/api/v1',
    // Laravel Sanctum: la cookie XSRF-TOKEN viaja en su header y un 419 pide una nueva y repite una vez
    csrf: {refreshPath: '/auth/csrf-token'},
    // el header con que el servidor anuncia la compilación publicada (el aviso «Hay una versión nueva»)
    publishedBuildHeader: 'X-Frontend-Build',
    // un 401 a media consulta: la sesión se venció; en la app, ir a iniciar sesión conservando a dónde iba
    onUnauthenticated: () => window.location.assign(`/sign-in?next=${encodeURIComponent(window.location.pathname)}`),
});

// 2. Un módulo (modules/orders/ordersApi.ts): sus llamadas con nombre. Las pantallas llaman ordersApi.list({page}), no
//    direcciones
export const ordersApi = {
    list: ({page, signal}: {page: number; signal?: AbortSignal}) => api.get('/orders', {params: {page}, signal}),
    create: (order: {customerId: number}) => api.post('/orders', order),
    cancel: (folio: string) => api.post(`/orders/${folio}/cancel`),
    // ¿hay sesión? Al arrancar, un 401 es lo normal (nadie ha entrado): no es una sesión vencida
    session: () => api.get('/auth/session', {skipUnauthenticatedHandler: true}),
};
