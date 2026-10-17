// Pruebas del reintento por 419 con un cliente axios real y un adaptador falso (sin red). npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import axios, {AxiosError} from 'axios';

// OJO: import relativo a propósito, única excepción a la regla del alias @/: node --test no pasa por Vite
import {createCsrfRetryHandler} from '@/laravel/csrfRetry.js';

/**
 * Cliente con el mismo enganche que api.js y un adaptador que responde lo que diga statusFor(url, intento).
 */
function buildClient(statusFor) {
    const requestedUrls = [];
    const client = axios.create({
        adapter: async (config) => {
            requestedUrls.push(config.url);
            const attempt = requestedUrls.filter((url) => url === config.url).length;
            const status = statusFor(config.url, attempt);
            const response = {data: {}, status, statusText: String(status), headers: {}, config, request: {}};
            if (status >= 400) {
                throw new AxiosError(`status ${status}`, AxiosError.ERR_BAD_REQUEST, config, {}, response);
            }
            return response;
        },
    });
    const retryAfterCsrfRefresh = createCsrfRetryHandler({
        refreshCsrfToken: () => client.get('/auth/csrf-token'),
        repeatRequest: (config) => client.request(config),
    });
    client.interceptors.response.use((response) => response, async (error) => {
        const retriedResponse = await retryAfterCsrfRefresh(error);
        if (retriedResponse) {
            return retriedResponse;
        }
        throw error;
    });
    return {client, requestedUrls};
}

test('un 419 pide una cookie nueva y repite la petición una vez', async () => {
    const {client, requestedUrls} = buildClient((url, attempt) => (url === '/auth/login' && attempt === 1 ? 419 : 200));

    const response = await client.post('/auth/login', {});

    assert.equal(response.status, 200);
    assert.deepEqual(requestedUrls, ['/auth/login', '/auth/csrf-token', '/auth/login']);
});

test('si la repetición vuelve a responder 419 no se reintenta otra vez', async () => {
    const {client, requestedUrls} = buildClient((url) => (url === '/auth/login' ? 419 : 200));

    await assert.rejects(client.post('/auth/login', {}), (error) => error.response.status === 419);
    assert.deepEqual(requestedUrls, ['/auth/login', '/auth/csrf-token', '/auth/login']);
});

test('otros errores (401, 422) no se reintentan', async () => {
    const {client, requestedUrls} = buildClient(() => 422);

    await assert.rejects(client.post('/auth/login', {}));
    assert.deepEqual(requestedUrls, ['/auth/login']);
});
