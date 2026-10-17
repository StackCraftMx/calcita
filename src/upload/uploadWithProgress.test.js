// Pruebas de la subida con avance, con un XMLHttpRequest de mentira (node no trae uno). Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {afterEach, test} from 'node:test';

import {configureToolkit} from '@/toolkit/toolkitSettings.js';
import {uploadWithProgress} from '@/upload/uploadWithProgress.js';

// la última petición armada, para que cada prueba le conteste como lo haría el servidor
let lastRequest = null;

class FakeXmlHttpRequest {
    constructor() {
        this.requestHeaders = {};
        this.upload = {};
        lastRequest = this;
    }

    open(method, url) {
        this.method = method;
        this.url = url;
    }

    setRequestHeader(name, value) {
        this.requestHeaders[name] = value;
    }

    send(body) {
        this.body = body;
    }

    abort() {
        this.onabort?.();
    }

    getAllResponseHeaders() {
        return 'content-type: application/problem+json\r\nx-request-id: abc-123';
    }

    // lo que haría el navegador: avanza la subida y luego llega la respuesta
    answer(status, body) {
        this.upload.onprogress?.({lengthComputable: true, loaded: 50, total: 100});
        this.upload.onprogress?.({lengthComputable: true, loaded: 100, total: 100});
        this.status = status;
        this.response = new Blob([body]);
        this.onload?.();
    }
}

globalThis.XMLHttpRequest = FakeXmlHttpRequest;

afterEach(() => configureToolkit({language: 'es'}));

test('manda el POST con el idioma activo, avisa el avance y responde como fetch', async () => {
    configureToolkit({language: 'en'});
    const percents = [];
    const formData = new FormData();
    formData.append('archivo', new Blob(['hola']), 'pagos.xlsx');

    const uploading = uploadWithProgress('/api/pagos', formData, {headers: {Authorization: 'Bearer prueba'}, onProgress: (percent) => percents.push(percent)});
    lastRequest.answer(422, JSON.stringify({title: 'Los datos no son válidos', errors: {archivo: ['Falta la columna RFC.']}}));
    const response = await uploading;

    assert.equal(lastRequest.method, 'POST');
    assert.equal(lastRequest.requestHeaders['Accept-Language'], 'en');
    assert.equal(lastRequest.requestHeaders.Authorization, 'Bearer prueba');
    // el Content-Type lo arma el navegador con el separador del multipart: nunca a mano
    assert.equal(lastRequest.requestHeaders['Content-Type'], undefined);
    assert.deepEqual(percents, [50, 100]);
    assert.equal(response.ok, false);
    assert.equal(response.status, 422);
    assert.equal(response.headers.get('x-request-id'), 'abc-123');
    assert.deepEqual((await response.json()).errors, {archivo: ['Falta la columna RFC.']});
});

test('cancelar con la señal termina en AbortError, como fetch', async () => {
    const abortController = new AbortController();
    const uploading = uploadWithProgress('/api/pagos', new FormData(), {signal: abortController.signal});
    abortController.abort();

    await assert.rejects(uploading, {name: 'AbortError'});
});
