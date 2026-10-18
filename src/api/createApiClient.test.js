// Pruebas de la petición de la casa con un fetch de mentira (sin red ni navegador): pnpm test.
// `serverReplying` arma el fetch: guarda lo que se pidió y responde lo que diga la prueba.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {ApiError} from '@/api/ApiError.js';
import {apiUrlOf, createApiClient, retryAfterSecondsOf} from '@/api/createApiClient.js';
import {isNewBuildPublished} from '@/observability/publishedBuild.js';
import {configureToolkit} from '@/toolkit/toolkitSettings.js';

const JSON_HEADERS = {'content-type': 'application/json'};

/**
 * Un fetch de mentira: cada llamada guarda {url, init} en `calls` y responde con la siguiente de `replies` (la última se
 * repite). Una respuesta puede ser un Error: así se simula la red caída.
 */
function serverReplying(...replies) {
    const calls = [];
    const fakeFetch = async (url, init) => {
        calls.push({url, init});
        const reply = replies[Math.min(calls.length - 1, replies.length - 1)];
        if (reply instanceof Error) {
            throw reply;
        }
        return typeof reply === 'function' ? reply(url, init) : reply;
    };
    return {calls, fakeFetch};
}

const jsonReply = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {status, headers: {...JSON_HEADERS, ...headers}});

test('la dirección junta la base, el camino y los parámetros; los vacíos no viajan y las listas se repiten', () => {
    assert.equal(apiUrlOf('/api/v1', '/orders', {page: 2, status: ['paid', 'pending'], search: undefined, customer: null}),
        '/api/v1/orders?page=2&status=paid&status=pending');
    assert.equal(apiUrlOf('/api/v1', 'https://otro.com/x', {}), 'https://otro.com/x');
    assert.equal(apiUrlOf('', '/orders?sort=date', {page: 1}), '/orders?sort=date&page=1');
});

test('cada petición lleva el idioma vigente, el token y el cuerpo en JSON', async () => {
    configureToolkit({language: 'en'});
    const {calls, fakeFetch} = serverReplying(jsonReply({id: 7}, 201));
    const api = createApiClient({baseUrl: '/api', getToken: () => 'secreto-de-prueba', fetch: fakeFetch});
    const created = await api.post('/orders', {customerId: 3});
    configureToolkit({language: 'es'});

    assert.deepEqual(created, {id: 7});
    assert.equal(calls[0].url, '/api/orders');
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(calls[0].init.headers['Accept-Language'], 'en');
    assert.equal(calls[0].init.headers.Authorization, 'Bearer secreto-de-prueba');
    assert.equal(calls[0].init.headers['Content-Type'], 'application/json');
    assert.equal(calls[0].init.body, '{"customerId":3}');
});

test('un FormData va tal cual, sin Content-Type (el navegador pone su boundary)', async () => {
    const {calls, fakeFetch} = serverReplying(jsonReply({ok: true}));
    const formData = new FormData();
    formData.append('file', new Blob(['hola']), 'hola.txt');
    await createApiClient({fetch: fakeFetch}).post('/upload', formData);
    assert.equal(calls[0].init.body, formData);
    assert.equal(calls[0].init.headers['Content-Type'], undefined);
});

test('204 y un 200 vacío regresan null', async () => {
    const {fakeFetch} = serverReplying(new Response(null, {status: 204}), new Response('', {status: 200}));
    const api = createApiClient({fetch: fakeFetch});
    assert.equal(await api.delete('/orders/7'), null);
    assert.equal(await api.get('/orders/7'), null);
});

test('un 422 es un ApiError con el mensaje del servidor y sus errores por campo', async () => {
    const problem = {title: 'Datos inválidos', detail: 'Revise el correo.', errors: {email: ['El correo ya existe.']}};
    const {fakeFetch} = serverReplying(jsonReply(problem, 422, {'content-language': 'es'}));
    const error = await createApiClient({fetch: fakeFetch}).post('/customers', {}).catch((caught) => caught);
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 422);
    assert.equal(error.isValidation, true);
    assert.equal(error.message, 'Revise el correo.');
    assert.equal(error.title, 'Datos inválidos');
    assert.deepEqual(error.problem.errors, {email: ['El correo ya existe.']});
});

test('una respuesta en otro idioma que el pedido usa el texto genérico del paquete', async () => {
    const {fakeFetch} = serverReplying(jsonReply({title: 'Bad Gateway', detail: 'upstream down'}, 502, {'content-language': 'en'}));
    const error = await createApiClient({fetch: fakeFetch}).get('/orders').catch((caught) => caught);
    assert.equal(error.status, 502);
    assert.notEqual(error.message, 'upstream down');
    assert.match(error.message, /\S/);
});

test('un 502 en HTML (sin cuerpo RFC 9457) también es un ApiError con su texto genérico', async () => {
    const {fakeFetch} = serverReplying(new Response('<html>Bad gateway</html>', {status: 502, headers: {'content-type': 'text/html'}}));
    const error = await createApiClient({fetch: fakeFetch}).get('/orders').catch((caught) => caught);
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 502);
    assert.deepEqual(error.problem, {});
});

test('sin red es un ApiError con status 0, la misma forma que un error del servidor', async () => {
    const {fakeFetch} = serverReplying(new TypeError('Failed to fetch'));
    const error = await createApiClient({fetch: fakeFetch}).get('/orders').catch((caught) => caught);
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 0);
    assert.equal(error.isOffline, true);
    assert.equal(error.code, 'offline');
});

test('cancelar no es un error: se relanza tal cual', async () => {
    const controller = new AbortController();
    const abortError = new DOMException('cancelado', 'AbortError');
    const {fakeFetch} = serverReplying(() => {
        controller.abort();
        throw abortError;
    });
    const error = await createApiClient({fetch: fakeFetch}).get('/orders', {signal: controller.signal}).catch((caught) => caught);
    assert.equal(error, abortError);
});

test('un 401 avisa a onUnauthenticated, salvo que la petición lo espere', async () => {
    const unauthenticatedErrors = [];
    const {fakeFetch} = serverReplying(jsonReply({title: 'Sin sesión'}, 401));
    const api = createApiClient({fetch: fakeFetch, onUnauthenticated: (error) => unauthenticatedErrors.push(error)});
    await api.get('/orders').catch(() => {});
    await api.get('/auth/session', {skipUnauthenticatedHandler: true}).catch(() => {});
    assert.equal(unauthenticatedErrors.length, 1);
    assert.equal(unauthenticatedErrors[0].isUnauthenticated, true);
});

test('un 419 de Laravel pide una cookie nueva y repite la petición una sola vez', async () => {
    const {calls, fakeFetch} = serverReplying(jsonReply({}, 419), new Response(null, {status: 204}), jsonReply({saved: true}));
    const saved = await createApiClient({baseUrl: '/api', csrf: {refreshPath: '/auth/csrf-token'}, fetch: fakeFetch}).post('/orders', {a: 1});
    assert.deepEqual(saved, {saved: true});
    assert.deepEqual(calls.map(({url, init}) => `${init.method} ${url}`), ['POST /api/orders', 'GET /api/auth/csrf-token', 'POST /api/orders']);
});

test('la compilación publicada que anuncia el servidor prende el aviso de versión nueva', async () => {
    configureToolkit({buildId: 'build-1'});
    const {fakeFetch} = serverReplying(jsonReply({}, 200, {'x-frontend-build': 'build-2'}));
    await createApiClient({fetch: fakeFetch}).get('/orders');
    configureToolkit({buildId: undefined});
    assert.equal(isNewBuildPublished(), true);
});

test('un 429 trae los segundos de Retry-After (en segundos o como fecha)', async () => {
    const {fakeFetch} = serverReplying(jsonReply({title: 'Demasiados intentos'}, 429, {'retry-after': '30'}));
    const error = await createApiClient({fetch: fakeFetch}).post('/auth/login', {}).catch((caught) => caught);
    assert.equal(error.retryAfterSeconds, 30);
    assert.equal(retryAfterSecondsOf(new Date(Date.now() + 90_000).toUTCString()) >= 89, true);
    assert.equal(retryAfterSecondsOf(null), null);
});

test('un 200 que no es JSON (la página de la app en lugar del API) es un ApiError', async () => {
    const {fakeFetch} = serverReplying(new Response('<!doctype html><html></html>', {status: 200, headers: {'content-type': 'text/html'}}));
    const error = await createApiClient({fetch: fakeFetch}).get('/oders').catch((caught) => caught);
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 500);
});

test('una descarga trae el archivo y el nombre que mandó el servidor, avisando el avance', async () => {
    const progress = [];
    const {fakeFetch} = serverReplying(new Response('a,b\n1,2\n', {
        status: 200, headers: {'content-type': 'text/csv', 'content-length': '8', 'content-disposition': 'attachment; filename="pedidos.csv"'},
    }));
    const {blob, fileName} = await createApiClient({fetch: fakeFetch}).download('/orders/export', {onDownloadProgress: (event) => progress.push(event)});
    assert.equal(fileName, 'pedidos.csv');
    assert.equal(await blob.text(), 'a,b\n1,2\n');
    assert.deepEqual(progress.at(-1), {loaded: 8, total: 8});
});

test('un Excel que llegó cortado no se entrega: ApiError 500 con el id de la petición', async () => {
    const {fakeFetch} = serverReplying(new Response('PK-esto-no-es-un-zip-completo', {
        status: 200, headers: {'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'x-request-id': 'req-9'},
    }));
    const error = await createApiClient({fetch: fakeFetch}).download('/orders/export').catch((caught) => caught);
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 500);
    assert.equal(error.requestId, 'req-9');
});

test('los eventos salen hacia afuera: onRequest, onResponse y onError con cada error (sin red también), no al cancelar', async () => {
    const events = [];
    const {fakeFetch} = serverReplying(jsonReply({id: 1}), jsonReply({title: 'Falló'}, 500), new TypeError('Failed to fetch'));
    const api = createApiClient({
        baseUrl: '/api', fetch: fakeFetch,
        onRequest: ({method, url}) => events.push(`sale ${method} ${url}`),
        onResponse: ({status, durationMilliseconds}) => events.push(`llega ${status} ${typeof durationMilliseconds}`),
        onError: (error, {url}) => events.push(`error ${error.status} ${url}`),
    });

    await api.get('/orders');
    await api.get('/orders/9').catch(() => {});
    await api.get('/ping').catch(() => {});
    assert.deepEqual(events, [
        'sale GET /api/orders', 'llega 200 number',
        'sale GET /api/orders/9', 'llega 500 number', 'error 500 /api/orders/9',
        'sale GET /api/ping', 'error 0 /api/ping',
    ]);

    const controller = new AbortController();
    const abortError = new DOMException('cancelado', 'AbortError');
    const aborting = createApiClient({
        fetch: async () => { controller.abort(); throw abortError; }, onError: () => events.push('no debería'),
    });
    await aborting.get('/orders', {signal: controller.signal}).catch(() => {});
    assert.equal(events.includes('no debería'), false);
});

test('un evento del proyecto que truena no tumba la petición', async () => {
    const {fakeFetch} = serverReplying(jsonReply({id: 1}));
    const api = createApiClient({fetch: fakeFetch, onRequest: () => { throw new Error('evento roto'); }});
    assert.deepEqual(await api.get('/orders'), {id: 1});
});

test('un backend que ya existe: toProblem lee su error ({message, errors} de Laravel) y mapResponse desenvuelve {data}', async () => {
    const {fakeFetch} = serverReplying(
        jsonReply({message: 'Los datos no son válidos.', errors: {email: ['El correo ya existe.']}}, 422, {'content-language': 'es'}),
        jsonReply({data: [{id: 7}], meta: {total: 1}}),
    );
    const api = createApiClient({
        fetch: fakeFetch,
        toProblem: (body) => ({title: body.message, detail: body.message, errors: body.errors}),
        mapResponse: (body) => body.data ?? body,
    });

    const error = await api.post('/customers', {}).catch((caught) => caught);
    assert.equal(error.message, 'Los datos no son válidos.');
    assert.deepEqual(error.problem.errors, {email: ['El correo ya existe.']});
    assert.deepEqual(await api.get('/customers'), [{id: 7}]);
});
