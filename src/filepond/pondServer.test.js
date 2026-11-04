// Pruebas del «server» de FilePond de la casa: el envío de un solo POST y el de trozos, llamados como los llama FilePond
// (process con sus callbacks y, al final, sus opciones de trozos). Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {afterEach, test} from 'node:test';

import {createPondServer, usesChunks} from '@/filepond/pondServer.js';
import {CHUNK_HEADER, defaultPatchUrlOf} from '@/upload/chunkedUpload.js';
import {configureToolkit} from '@/toolkit/toolkitSettings.js';

afterEach(() => configureToolkit({language: 'es'}));

/** Un servidor de mentira que anota cada petición y contesta con answerOf. */
function recordingServer(answerOf) {
    const requests = [];
    const sendRequest = async (url, body, {method, headers, onProgress, signal}) => {
        if (signal.aborted) {
            throw new DOMException('cancelada', 'AbortError');
        }
        requests.push({url, body, method, headers});
        onProgress?.(100, {loaded: 10, total: 10});
        return answerOf({url, body, method, headers});
    };
    return {sendRequest, requests};
}

/**
 * Llama process como FilePond y espera a que el archivo termine (load o error).
 *
 * @returns {Promise<{loaded?: string, failed?: string, transferId?: string, progress: number[][]}>}
 */
function processLikePond(server, file, pondOptions) {
    return new Promise((resolve) => {
        const outcome = {progress: []};
        server.process('filepond', file, {}, (serverId) => resolve({...outcome, loaded: serverId}),
            (message) => resolve({...outcome, failed: message}),
            (computable, loaded, total) => outcome.progress.push([loaded, total]),
            () => resolve({...outcome, aborted: true}),
            (transferId) => {
                outcome.transferId = transferId;
            },
            pondOptions);
    });
}

const fileOf = (text, name = 'contrato.pdf') => new File([text], name, {type: 'application/pdf'});

test('sin trozos: un POST con el archivo en su campo, el idioma activo y lo que contesta el servidor como id', async () => {
    configureToolkit({language: 'en'});
    const backend = recordingServer(() => new Response('archivo-81', {status: 201}));
    const server = createPondServer({url: '/api/adjuntos', headers: {Authorization: 'Bearer prueba'}, sendRequest: backend.sendRequest});

    const outcome = await processLikePond(server, fileOf('hola'), {});

    assert.equal(outcome.loaded, 'archivo-81');
    assert.equal(backend.requests.length, 1);
    const [request] = backend.requests;
    assert.equal(request.method, 'POST');
    assert.equal(request.headers['Accept-Language'], 'en');
    assert.equal(request.headers.Authorization, 'Bearer prueba');
    assert.equal(request.body.get('filepond').name, 'contrato.pdf');
    assert.deepEqual(outcome.progress, [[10, 10]]);
});

test('el error del servidor va a la tarjeta; con toProblem, también el de un backend que no habla RFC 9457', async () => {
    const laravelError = {message: 'Datos inválidos', errors: {filepond: ['El contrato debe venir firmado.']}};
    const backend = recordingServer(() => new Response(JSON.stringify(laravelError), {status: 422}));
    const plain = createPondServer({url: '/api/adjuntos', sendRequest: backend.sendRequest});
    const adapted = createPondServer({
        url: '/api/adjuntos', sendRequest: backend.sendRequest,
        toProblem: (body) => ({title: Object.values(body.errors ?? {}).flat()[0] ?? body.message}),
    });

    const plainOutcome = await processLikePond(plain, fileOf('hola'), {});
    const adaptedOutcome = await processLikePond(adapted, fileOf('hola'), {});

    // sin adaptador no hay title: el texto del paquete para un 422 (nunca vacío ni en inglés)
    assert.ok(plainOutcome.failed && plainOutcome.failed !== 'Datos inválidos');
    assert.equal(adaptedOutcome.failed, 'El contrato debe venir firmado.');
});

test('con trozos: folio, cada trozo a patchUrl con su folio, FilePond guarda el folio y lo recibe al final', async () => {
    const backend = recordingServer(({method}) => (method === 'POST' ? new Response('folio-3', {status: 200}) : new Response(null, {status: 204})));
    const server = createPondServer({url: '/upload', patchUrl: '/upload?&patch=', headers: {'X-Upload-Context': '{"grupo":"12"}'}, sendRequest: backend.sendRequest});

    const outcome = await processLikePond(server, fileOf('0123456789abcde'), {chunkUploads: true, chunkForce: true, chunkSize: 10, chunkRetryDelays: []});

    assert.equal(outcome.loaded, 'folio-3');
    assert.equal(outcome.transferId, 'folio-3');
    assert.deepEqual(backend.requests.map((request) => [request.method, request.url]),
        [['POST', '/upload'], ['PATCH', '/upload?&patch=folio-3'], ['PATCH', '/upload?&patch=folio-3']]);
    assert.equal(backend.requests[1].headers['X-Upload-Context'], '{"grupo":"12"}');
    assert.equal(backend.requests[2].headers[CHUNK_HEADER.offset], '10');
    assert.ok(outcome.progress.every(([loaded, total]) => loaded < total), 'nunca dice 100 % antes de que el servidor confirme');
});

test('la ✕ cancela la petición de verdad y no escribe un error en la tarjeta', async () => {
    let finishRequest = null;
    const server = createPondServer({
        url: '/api/adjuntos',
        sendRequest: (url, body, {signal}) => new Promise((resolve, reject) => {
            finishRequest = resolve;
            signal.addEventListener('abort', () => reject(new DOMException('cancelada', 'AbortError')));
        }),
    });
    let failed = null;
    let aborted = false;
    const running = server.process('filepond', fileOf('hola'), {}, () => undefined, (message) => {
        failed = message;
    }, () => undefined, () => {
        aborted = true;
    }, () => undefined, {});

    running.abort();
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.equal(aborted, true);
    assert.equal(failed, null);
    assert.ok(finishRequest);
});

test('cuándo va por trozos y a dónde, si no se dice', () => {
    const big = fileOf('x'.repeat(20));
    const small = fileOf('x');
    assert.equal(usesChunks(big, {chunkUploads: true, chunkSize: 10}), true);
    assert.equal(usesChunks(small, {chunkUploads: true, chunkSize: 10}), false);
    assert.equal(usesChunks(small, {chunkUploads: true, chunkForce: true, chunkSize: 10}), true);
    assert.equal(usesChunks(big, {chunkSize: 10}), false);
    assert.equal(defaultPatchUrlOf('/upload'), '/upload?patch=');
    assert.equal(defaultPatchUrlOf('/upload?tipo=pdf'), '/upload?tipo=pdf&patch=');
});
