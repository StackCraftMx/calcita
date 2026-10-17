// Pruebas del contraste de un color contra el blanco. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {MIN_CONTRAST, contrastOnWhite, readableVariantOf} from '@/inputs/colorContrast.js';

test('el contraste sobre blanco va de 1 (blanco) a 21 (negro)', () => {
    assert.equal(Math.round(contrastOnWhite('#000000')), 21);
    assert.equal(contrastOnWhite('#FFFFFF'), 1);
    // el azul primario de MUI se lee bien sobre blanco
    assert.ok(contrastOnWhite('#1976D2') > MIN_CONTRAST);
    assert.equal(contrastOnWhite('azul'), null);
});

test('un color que casi no se lee se oscurece lo justo, y uno que ya se lee se queda igual', () => {
    const readable = readableVariantOf('#FFD54F');
    assert.ok(contrastOnWhite(readable) >= MIN_CONTRAST);
    assert.notEqual(readable, '#FFD54F');
    assert.equal(readableVariantOf('#1976d2'), '#1976D2');
    assert.equal(readableVariantOf('#12'), null);
});
