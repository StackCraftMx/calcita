// Pruebas de cómo se escriben los tamaños de archivo: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {formatFileSize} from '@/formatting.js';
import {configureToolkit} from '@/toolkit/toolkitSettings.js';

test('un archivo de menos de un kilobyte dice bytes, con su plural', () => {
    // el panel de descargas decía «74 byte»: la forma corta de Intl no pone plural
    configureToolkit({language: 'es'});
    assert.equal(formatFileSize(74), '74 bytes');
    assert.equal(formatFileSize(1), '1 byte');
    configureToolkit({language: 'en'});
    assert.equal(formatFileSize(74), '74 bytes');
    assert.equal(formatFileSize(1), '1 byte');
});

test('de un kilobyte en adelante va abreviado y en base 1000, como el navegador', () => {
    configureToolkit({language: 'es'});
    assert.equal(formatFileSize(1_500), '1.5 kB');
    assert.equal(formatFileSize(2_400_000), '2.4 MB');
});

test('sin dato enseña la raya', () => {
    assert.equal(formatFileSize(null), '—');
    assert.equal(formatFileSize('no es número'), '—');
});
