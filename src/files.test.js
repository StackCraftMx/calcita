import assert from 'node:assert/strict';
import {test} from 'node:test';

import {isCompleteZip} from '@/files.js';

// registro de cierre de un zip sin comentario: la firma PK\x05\x06, los conteos y posiciones, y el largo del comentario en 0
function zipEndRecord() {
    const endRecord = new Uint8Array(22);
    endRecord.set([0x50, 0x4b, 0x05, 0x06]);
    return endRecord;
}

test('un zip que termina con su registro de cierre llegó completo', async () => {
    // lo de antes del registro (las hojas comprimidas) no importa: lo que dice que el archivo terminó es el cierre
    const blob = new Blob([new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2, 3]), zipEndRecord()]);

    assert.equal(await isCompleteZip(blob), true);
});

test('un zip cortado a media escritura no llegó completo', async () => {
    // así llega cuando el servidor falla a la mitad: lo último es un pedazo de una hoja y no hay registro de cierre
    const blob = new Blob([new Uint8Array([0x50, 0x4b, 0x03, 0x04]), new Uint8Array(40).fill(7)]);

    assert.equal(await isCompleteZip(blob), false);
});

test('un error de PHP pegado después del zip tampoco cuenta como completo', async () => {
    // con display_errors encendido (desarrollo) PHP escribe su error al final de la respuesta
    const blob = new Blob([zipEndRecord(), 'PHP Fatal error: Uncaught ErrorException']);

    assert.equal(await isCompleteZip(blob), false);
});

test('un archivo más chico que el registro de cierre no es un zip completo', async () => {
    assert.equal(await isCompleteZip(new Blob([new Uint8Array([0x50, 0x4b, 0x05, 0x06])])), false);
});
