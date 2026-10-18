import {createApiClient} from '@stackcraftmx/calcita';

// La sesión va en una cookie HttpOnly que pone el servidor: el JavaScript de la página NO la puede leer, así que un XSS
// tampoco se la puede llevar. Por eso el front no guarda ningún token en localStorage ni en sessionStorage.
//
// Con el API en el mismo dominio, credentials 'same-origin' (el de omisión) basta para que la cookie viaje sola. Y contra
// las peticiones que otra página manda a nombre de la persona (CSRF), la cookie doble de Laravel Sanctum: el servidor deja
// XSRF-TOKEN en una cookie que sí se lee, el cliente la regresa en un header y otra página no puede leerla ni ponerlo.
export const api = createApiClient({
    baseUrl: '/api/v1',
    credentials: 'same-origin',
    csrf: {refreshPath: '/auth/csrf-token'},
});

// Lo que NO se hace: localStorage.setItem('token', token) — cualquier script que logre correr en la página lo leería.
