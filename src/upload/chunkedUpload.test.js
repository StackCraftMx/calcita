// Pruebas de la subida por trozos con un servidor de mentira que contesta como uno de verdad: el POST da el folio, cada PATCH
// guarda su trozo en su lugar y el HEAD dice hasta dónde llegó. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {ApiError} from '@/api/ApiError.js';
import {configureToolkit} from '@/toolkit/toolkitSettings.js';
import {CHUNK_HEADER, UPLOAD_FAILURE, UploadFailure, chunkPiecesOf, createChunkedUpload, headerTextOf, honestLoadedOf, startChunkedUpload, storedBytesOf} from '@/upload/chunkedUpload.js';

const FOLIO = 'folio-7';
const PATCH_URL = '/api/subidas?patch=';

/**
 * Un servidor de trozos en memoria. answers deja contestar a mano una petición (por su número), para los errores.
 *
 * @param {{answers?: Record<number, () => Response>, storedOffset?: number}} [options]
 */
function fakeChunkServer({answers = {}, storedOffset = 0} = {}) {
    const requests = [];
    const stored = new Map();
    const sendRequest = async (url, body, {method, headers, onProgress, signal}) => {
        if (signal.aborted) {
            throw new DOMException('cancelada', 'AbortError');
        }
        const number = requests.length;
        requests.push({url, body, method, headers});
        if (body instanceof Blob) {
            onProgress?.(50, {loaded: Math.floor(body.size / 2), total: body.size});
            onProgress?.(100, {loaded: body.size, total: body.size});
        }
        if (answers[number]) {
            return answers[number]();
        }
        if (method === 'POST') {
            return new Response(FOLIO, {status: 200});
        }
        if (method === 'HEAD') {
            return new Response(null, {status: 200, headers: {[CHUNK_HEADER.offset]: String(storedOffset)}});
        }
        stored.set(Number(headers[CHUNK_HEADER.offset]), new Uint8Array(await body.arrayBuffer()));
        return new Response(null, {status: 204});
    };
    const assembled = () => new TextDecoder().decode(new Uint8Array([...stored.keys()].sort((a, b) => a - b).flatMap((offset) => [...stored.get(offset)])));
    return {sendRequest, requests, assembled};
}

const fileOf = (text) => new Blob([text], {type: 'application/pdf'});

/** Lo que llegó en un header, de vuelta a texto (viaja en UTF-8 byte por byte). */
const textOfHeader = (value) => new TextDecoder().decode(Uint8Array.from(value, (character) => character.charCodeAt(0)));

const baseOptions = (server, overrides = {}) => ({
    fileName: 'estado-de-cuenta.pdf', fieldName: 'filepond', metadata: {}, url: '/api/subidas', patchUrl: PATCH_URL,
    chunkSize: 10, retryDelays: [1], sendRequest: server.sendRequest, ...overrides,
});

test('los trozos: cada uno con dónde empieza y acaba; uno exacto no deja un trozo vacío de más; uno vacío es un trozo', () => {
    assert.deepEqual(chunkPiecesOf(25, 10).map((piece) => [piece.offset, piece.end]), [[0, 10], [10, 20], [20, 25]]);
    assert.deepEqual(chunkPiecesOf(20, 10).map((piece) => [piece.offset, piece.end]), [[0, 10], [10, 20]]);
    assert.deepEqual(chunkPiecesOf(0, 10).map((piece) => [piece.offset, piece.end]), [[0, 0]]);
});

test('la barra honesta no llega al final antes de que el servidor confirme el último trozo', () => {
    assert.equal(honestLoadedOf({confirmedBytes: 900, sendingBytes: 100, totalBytes: 1000}), 990);
    assert.equal(honestLoadedOf({confirmedBytes: 300, sendingBytes: 50, totalBytes: 1000}), 350);
    // lo guardado al retomar: el último trozo completo antes del punto que dice el servidor
    assert.equal(storedBytesOf(chunkPiecesOf(25, 10), 15), 10);
    assert.equal(storedBytesOf(chunkPiecesOf(25, 10), 20), 20);
});

test('sube por trozos: el folio, cada trozo en su lugar con sus headers, y el archivo llega completo', async () => {
    const server = fakeChunkServer();
    const text = 'Estado de cuenta de julio';
    const shown = [];
    let savedFolio = null;
    const upload = startChunkedUpload(baseOptions(server, {
        file: fileOf(text), fileName: 'Recibo – julio ñ.pdf', headers: {'X-Upload-Context': JSON.stringify({sucursal: 'Querétaro'})},
        onTransferId: (folio) => {
            savedFolio = folio;
        },
        onProgress: (loaded, total) => shown.push([loaded, total]),
    }));

    assert.equal(await upload.done, FOLIO);
    assert.equal(savedFolio, FOLIO);
    assert.equal(server.assembled(), text);

    const [first, ...pieces] = server.requests;
    assert.equal(first.method, 'POST');
    assert.equal(first.url, '/api/subidas');
    assert.equal(first.headers[CHUNK_HEADER.length], String(text.length));
    assert.equal(first.body.get('filepond'), '{}');
    assert.deepEqual(pieces.map((request) => [request.method, request.url, request.headers[CHUNK_HEADER.offset]]),
        [['PATCH', `${PATCH_URL}${FOLIO}`, '0'], ['PATCH', `${PATCH_URL}${FOLIO}`, '10'], ['PATCH', `${PATCH_URL}${FOLIO}`, '20']]);
    // el nombre y los datos de la pantalla viajan en UTF-8: llegan iguales, con su «–», su ñ y su acento
    assert.equal(textOfHeader(pieces[0].headers[CHUNK_HEADER.name]), 'Recibo – julio ñ.pdf');
    assert.equal(textOfHeader(pieces[2].headers['X-Upload-Context']), '{"sucursal":"Querétaro"}');
    assert.equal(pieces[0].headers[CHUNK_HEADER.contentType], 'application/offset+octet-stream');

    // la barra nunca regresa ni llega a 25 de 25: el «Cargado» lo pone la respuesta del último trozo
    const loadedValues = shown.map(([loaded]) => loaded);
    assert.deepEqual(loadedValues, [...loadedValues].sort((a, b) => a - b));
    assert.equal(Math.max(...loadedValues), Math.floor(text.length * 0.99));
    assert.ok(shown.every(([, total]) => total === text.length));
});

test('un trozo sin respuesta o con 5xx se reintenta y la barra no regresa', async () => {
    const server = fakeChunkServer({answers: {2: () => new Response('se cayó', {status: 503})}});
    const shown = [];
    const upload = startChunkedUpload(baseOptions(server, {file: fileOf('0123456789abcdefghij'), onProgress: (loaded) => shown.push(loaded)}));

    assert.equal(await upload.done, FOLIO);
    // POST, trozo 1, trozo 2 (503), trozo 2 otra vez
    assert.deepEqual(server.requests.map((request) => request.headers[CHUNK_HEADER.offset] ?? request.method), ['POST', '0', '10', '10']);
    assert.deepEqual(shown, [...shown].sort((a, b) => a - b));
    assert.equal(server.assembled(), '0123456789abcdefghij');
});

test('un 4xx no se reintenta: el servidor dijo que no y se enseña en seguida', async () => {
    const problem = {message: 'Datos inválidos', errors: {archivo: ['El respaldo no puede pasar de 20 MB.']}};
    const server = fakeChunkServer({answers: {0: () => new Response(JSON.stringify(problem), {status: 422})}});
    const upload = startChunkedUpload(baseOptions(server, {file: fileOf('0123456789'), retryDelays: [1, 1, 1]}));

    await assert.rejects(upload.done, (failure) => failure instanceof UploadFailure && failure.reason === UPLOAD_FAILURE.rejected
        && failure.response.status === 422);
    assert.equal(server.requests.length, 1);
});

test('al reintentar con el folio de antes pregunta hasta dónde llegó y sigue desde el último trozo completo', async () => {
    const server = fakeChunkServer({storedOffset: 15});
    const upload = startChunkedUpload(baseOptions(server, {file: fileOf('0123456789abcdefghijKLMNO'), transferId: FOLIO}));

    assert.equal(await upload.done, FOLIO);
    assert.deepEqual(server.requests.map((request) => [request.method, request.headers[CHUNK_HEADER.offset] ?? null]),
        [['HEAD', null], ['PATCH', '10'], ['PATCH', '20']]);
});

test('cancelar a media espera de un reintento termina en AbortError, sin esperar', async () => {
    const server = fakeChunkServer({answers: {1: () => new Response('se cayó', {status: 500})}});
    const upload = startChunkedUpload(baseOptions(server, {file: fileOf('0123456789'), retryDelays: [60_000]}));
    // deja que salgan el POST y el primer trozo, y cancela mientras espera
    await new Promise((resolve) => setTimeout(resolve, 10));
    upload.abort();

    await assert.rejects(upload.done, {name: 'AbortError'});
});

test('un servidor que no da folio es un error con su motivo, no una subida a ninguna parte', async () => {
    const server = fakeChunkServer({answers: {0: () => new Response('  ', {status: 200})}});
    const upload = startChunkedUpload(baseOptions(server, {file: fileOf('0123456789')}));

    await assert.rejects(upload.done, (failure) => failure.reason === UPLOAD_FAILURE.noTransferId);
    assert.equal(server.requests.length, 1);
});

test('un texto para header viaja en UTF-8 byte por byte', () => {
    assert.equal(headerTextOf('abc'), 'abc');
    assert.equal(textOfHeader(headerTextOf('Señal – 😀')), 'Señal – 😀');
});

test('el cargador mini: regresa el folio como id y la barra llega a 100 % con el último byte (su «Procesando»)', async () => {
    configureToolkit({language: 'en'});
    const server = fakeChunkServer();
    const upload = createChunkedUpload({url: '/api/respaldos', patchUrl: '/api/respaldos?patch=', chunkSize: 10, chunkRetryDelays: [1], sendRequest: server.sendRequest});
    const transfers = [];

    const result = await upload(fileOf('0123456789abcdefghijKLMNO'), {onUploadProgress: (transfer) => transfers.push(transfer.loaded)});
    configureToolkit({language: 'es'});

    assert.deepEqual(result, {id: FOLIO});
    assert.equal(transfers.at(-1), 25);
    assert.deepEqual(transfers, [...transfers].sort((a, b) => a - b));
    // el primer 25 de 25 sale cuando el último trozo terminó de viajar, antes de que el servidor lo confirme
    assert.equal(transfers.indexOf(25), transfers.length - 2);
    assert.ok(server.requests.every((request) => request.headers['Accept-Language'] === 'en'));
    // sin metadatos, el primer POST va sin campos
    assert.equal([...server.requests[0].body.keys()].length, 0);
});

test('el cargador mini: un rechazo es ApiError con lo del servidor (los errores por campo de Laravel llegan tal cual)', async () => {
    const laravelError = {message: 'Datos inválidos', errors: {backup: ['El respaldo no puede pasar de 20 MB.']}};
    const server = fakeChunkServer({answers: {0: () => new Response(JSON.stringify(laravelError), {status: 422})}});
    const upload = createChunkedUpload({url: '/api/respaldos', sendRequest: server.sendRequest});

    await assert.rejects(upload(fileOf('0123456789')), (failure) => failure instanceof ApiError && failure.status === 422
        && failure.problem.errors.backup[0] === 'El respaldo no puede pasar de 20 MB.');
    // y sin respuesta, el ApiError de «sin conexión» (status 0)
    const offline = createChunkedUpload({url: '/api/respaldos', chunkRetryDelays: null, sendRequest: async () => {
        throw new TypeError('No hubo respuesta del servidor');
    }});
    await assert.rejects(offline(fileOf('0123456789')), (failure) => failure instanceof ApiError && failure.isOffline);
});

test('el cargador mini: su señal cancela la subida y termina en AbortError', async () => {
    const server = fakeChunkServer({answers: {1: () => new Response('se cayó', {status: 500})}});
    const upload = createChunkedUpload({url: '/api/respaldos', chunkSize: 10, chunkRetryDelays: [60_000], sendRequest: server.sendRequest});
    const controller = new AbortController();
    const running = upload(fileOf('0123456789'), {signal: controller.signal});
    await new Promise((resolve) => setTimeout(resolve, 10));
    controller.abort();

    await assert.rejects(running, {name: 'AbortError'});
});
