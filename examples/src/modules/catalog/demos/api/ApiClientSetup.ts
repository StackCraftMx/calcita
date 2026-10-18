import {createApiClient} from '@stackcraftmx/calcita';

// El cliente del proyecto: UNO, en su core (core/api.ts), y cada módulo lo usa desde su *Api.ts.
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

// Un módulo (modules/orders/ordersApi.ts): sus llamadas con nombre, sin repetir caminos en las pantallas
export const ordersApi = {
    list: ({page, signal}: {page: number; signal?: AbortSignal}) => api.get('/orders', {params: {page}, signal}),
    create: (order: {customerId: number}) => api.post('/orders', order),
    cancel: (folio: string) => api.post(`/orders/${folio}/cancel`),
    // ¿hay sesión? Al arrancar, un 401 es lo normal (nadie ha entrado): no es una sesión vencida
    session: () => api.get('/auth/session', {skipUnauthenticatedHandler: true}),
};
