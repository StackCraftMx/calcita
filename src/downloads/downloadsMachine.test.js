// Pruebas de la lista de descargas (el administrador de descargas). Sin navegador: npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createActor} from 'xstate';

import {DOWNLOAD_STATUS, downloadsMachine} from '@/downloads/downloadsMachine.js';

/** Actor nuevo con la lista vacía. */
function startActor() {
    return createActor(downloadsMachine).start();
}

test('una descarga nueva entra primero y avanza con su progreso', () => {
    // Escenario: dos descargas; la segunda recibe progreso sin tamaño total (archivo armado al vuelo).
    // Esperado: la más nueva arriba, bytes al día y total en null (la barra no tiene fin).
    const actor = startActor();
    actor.send({type: 'STARTED', id: 'a', label: 'Log de Q15', format: 'xlsx'});
    actor.send({type: 'STARTED', id: 'b', label: 'Descartados de Q16'});
    actor.send({type: 'PROGRESSED', id: 'b', loadedBytes: 2048, totalBytes: undefined});

    const [newest, oldest] = actor.getSnapshot().context.downloads;
    assert.equal(newest.id, 'b');
    assert.equal(newest.loadedBytes, 2048);
    assert.equal(newest.totalBytes, null);
    assert.equal(oldest.status, DOWNLOAD_STATUS.downloading);
    assert.equal(oldest.format, 'xlsx');
    assert.equal(newest.format, null);
});

test('una descarga terminada ya no cambia aunque llegue un aviso tarde', () => {
    // Escenario: la descarga termina y después llega un progreso o un error viejo.
    // Esperado: sigue completada, con su nombre de archivo y sin error.
    const actor = startActor();
    actor.send({type: 'STARTED', id: 'a', label: 'Log de Q15'});
    actor.send({type: 'COMPLETED', id: 'a', fileName: 'pedidos_2026_enero.xlsx'});
    actor.send({type: 'PROGRESSED', id: 'a', loadedBytes: 1, totalBytes: 10});
    actor.send({type: 'FAILED', id: 'a', errorMessage: 'tarde'});

    const [download] = actor.getSnapshot().context.downloads;
    assert.equal(download.status, DOWNLOAD_STATUS.completed);
    assert.equal(download.fileName, 'pedidos_2026_enero.xlsx');
    assert.equal(download.errorMessage, null);
});

test('limpiar quita las terminadas y deja las que siguen descargando', () => {
    // Escenario: una completada, una fallida, una cancelada y una en curso.
    // Esperado: queda solo la que sigue descargando.
    const actor = startActor();
    for (const id of ['completed', 'failed', 'canceled', 'running']) {
        actor.send({type: 'STARTED', id, label: id});
    }
    actor.send({type: 'COMPLETED', id: 'completed', fileName: 'x.csv'});
    actor.send({type: 'FAILED', id: 'failed', errorMessage: 'El reporte todavía no está listo.'});
    actor.send({type: 'CANCELED', id: 'canceled'});
    actor.send({type: 'CLEAR_FINISHED'});

    assert.deepEqual(actor.getSnapshot().context.downloads.map((download) => download.id), ['running']);
});

test('al terminar se queda con el tamaño del archivo aunque nadie haya avisado avance (un CSV armado en el navegador)', () => {
    const actor = createActor(downloadsMachine).start();
    actor.send({type: 'STARTED', id: 'json', label: 'Reporte', format: 'json'});
    actor.send({type: 'COMPLETED', id: 'json', fileName: 'reporte.json', sizeBytes: 2048});
    const [download] = actor.getSnapshot().context.downloads;
    assert.equal(download.loadedBytes, 2048);
    assert.equal(download.totalBytes, 2048);
});
