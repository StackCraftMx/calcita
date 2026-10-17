// Los textos del paquete existen en los dos idiomas: una llave que solo está en uno sale cruda en el otro
// («auth:signIn.title» en pantalla). Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import toolkitTextsEn from '@/locales/en.js';
import toolkitTextsEs from '@/locales/es.js';

/**
 * Todas las llaves de un árbol de textos, con su camino («auth.signIn.title»).
 *
 * @param {object} texts
 * @param {string} [prefix]
 * @returns {string[]}
 */
function keysOf(texts, prefix = '') {
    return Object.entries(texts).flatMap(([key, value]) => (value !== null && typeof value === 'object'
        ? keysOf(value, `${prefix}${key}.`)
        : [`${prefix}${key}`]));
}

test('cada texto del paquete está en español y en inglés', () => {
    const spanishKeys = new Set(keysOf(toolkitTextsEs));
    const englishKeys = new Set(keysOf(toolkitTextsEn));

    assert.deepEqual([...spanishKeys].filter((key) => !englishKeys.has(key)), [], 'solo en español');
    assert.deepEqual([...englishKeys].filter((key) => !spanishKeys.has(key)), [], 'solo en inglés');
});
