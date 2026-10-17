import {test} from 'node:test';
import assert from 'node:assert/strict';

import {textSizeOf, trackingOf} from '@/theme/appleTracking.js';

test('el espaciado de cada tamaño es el de la tabla de SF Pro de Apple', () => {
    assert.equal(trackingOf(12), '0em');
    assert.equal(trackingOf(13), '-0.006em');
    assert.equal(trackingOf(16), '-0.02em');
    assert.equal(trackingOf(17), '-0.026em');
});

test('entre dos tamaños de la tabla se reparte en línea recta, y fuera de ella vale el del extremo', () => {
    // 18 px, entre 17 (-26) y 20 (-23)
    assert.equal(trackingOf(18), '-0.025em');
    assert.equal(trackingOf(8), '0.012em');
    assert.equal(trackingOf(120), '0em');
});

test('un tamaño de letra trae su espaciado y va en rem, para que crezca con el tamaño de letra de la persona', () => {
    // la etiqueta de 13 px con el espaciado de 13, no el de 16 (con el de 16 las letras salían muy juntas)
    assert.deepEqual(textSizeOf(13), {fontSize: '0.8125rem', letterSpacing: '-0.006em'});
});
