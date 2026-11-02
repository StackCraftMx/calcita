// Pruebas de la versión aceptada de un aviso. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {acceptedVersionOf, rememberAcceptedVersion} from '@/legal/consentStorage.js';

const memoryStorage = () => {
    const stored = new Map();
    return {getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, String(value))};
};

test('se guarda la versión aceptada, no un sí: con otra versión se vuelve a preguntar', () => {
    const storage = memoryStorage();
    assert.equal(acceptedVersionOf('app:cookies', storage), null);
    rememberAcceptedVersion('app:cookies', '2026-11', storage);
    assert.equal(acceptedVersionOf('app:cookies', storage), '2026-11');
});

test('si el navegador niega el almacenamiento no truena', () => {
    const deniedStorage = {getItem: () => { throw new Error('SecurityError'); }, setItem: () => { throw new Error('SecurityError'); }};
    assert.equal(acceptedVersionOf('app:cookies', deniedStorage), null);
    assert.doesNotThrow(() => rememberAcceptedVersion('app:cookies', '1', deniedStorage));
});
