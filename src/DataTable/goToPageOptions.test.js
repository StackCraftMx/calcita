// Pruebas de qué páginas ofrece «Ir a la página». Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {filterPages, pageNumbersOf} from '@/DataTable/goToPageOptions.js';

test('sin teclear salen TODAS las páginas, hasta la última (antes se cortaba en 100)', () => {
    const pageNumbers = pageNumbersOf(39_000);
    const shown = filterPages(pageNumbers, {inputValue: ''});
    assert.equal(shown.length, 39_000);
    assert.equal(shown.at(-1), 39_000);
});

test('tecleando, primero las que empiezan así y después las que lo contienen', () => {
    const shown = filterPages(pageNumbersOf(1500), {inputValue: ' 13 '});
    assert.deepEqual(shown.slice(0, 3), [13, 130, 131]);
    assert.ok(shown.indexOf(213) > shown.indexOf(1399));
    assert.ok(shown.includes(1013));
});

test('las páginas se cuentan desde 1', () => {
    assert.deepEqual(pageNumbersOf(3), [1, 2, 3]);
    assert.deepEqual(pageNumbersOf(0), []);
});
