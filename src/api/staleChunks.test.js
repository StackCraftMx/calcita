// Pruebas de la recarga por un archivo de pantalla de una versión vieja, con una ventana de mentira (location y
// sessionStorage): pnpm test.
import assert from 'node:assert/strict';
import {afterEach, test} from 'node:test';

import {isStaleChunkError, recoverFromStaleChunk} from '@/api/staleChunks.js';

/** Una ventana de mentira que cuenta las recargas y guarda lo de sessionStorage. */
function fakeWindow() {
    const storage = new Map();
    const fake = {
        reloads: 0,
        location: {reload: () => {
            fake.reloads += 1;
        }},
        sessionStorage: {getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value)},
    };
    globalThis.window = fake;
    return fake;
}

afterEach(() => {
    delete globalThis.window;
});

test('reconoce el error de archivo viejo como lo dice cada navegador', () => {
    assert.equal(isStaleChunkError(new TypeError('Failed to fetch dynamically imported module: https://x/assets/a-1.js')), true);
    assert.equal(isStaleChunkError(new TypeError('error loading dynamically imported module')), true);
    assert.equal(isStaleChunkError(new TypeError('Importing a module script failed.')), true);
    assert.equal(isStaleChunkError(new Error('Cannot read properties of undefined')), false);
});

test('un archivo viejo recarga UNA vez; si vuelve a fallar enseguida, el error sigue su camino', async () => {
    const window = fakeWindow();
    const staleError = new TypeError('Failed to fetch dynamically imported module: /assets/orders-1.js');

    const firstTry = recoverFromStaleChunk(staleError);
    assert.equal(window.reloads, 1);
    assert.ok(firstTry instanceof Promise);

    assert.throws(() => recoverFromStaleChunk(staleError), staleError);
    assert.equal(window.reloads, 1);
});

test('otro error no recarga: se relanza tal cual', () => {
    const window = fakeWindow();
    const otherError = new Error('la pantalla tronó');
    assert.throws(() => recoverFromStaleChunk(otherError), otherError);
    assert.equal(window.reloads, 0);
});
