// Pruebas de qué páginas ofrece «Ir a la página». Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {filterPages, pageNumbersOf, shortPageListOf} from '@/DataTable/goToPageOptions.js';

test('sin teclear, con 100 páginas y parada en la 37, sale la lista corta de 16 renglones', () => {
    const shown = filterPages(pageNumbersOf(100), {inputValue: ''}, 37);
    assert.deepEqual(shown, [1, 10, 20, 30, 35, 36, 37, 38, 39, 40, 50, 60, 70, 80, 90, 100]);
});

test('con pocas páginas salen todas: la corta se saltaría números que sí caben', () => {
    assert.deepEqual(shortPageListOf(20, 7), pageNumbersOf(20));
    assert.deepEqual(shortPageListOf(1, 1), [1]);
});

test('en la primera y en la última, las vecinas no se salen de las páginas que hay', () => {
    assert.deepEqual(shortPageListOf(56, 1), [1, 2, 3, 10, 20, 30, 40, 50, 56]);
    assert.deepEqual(shortPageListOf(56, 56), [1, 10, 20, 30, 40, 50, 54, 55, 56]);
});

test('con cientos, de 10 en 10 dentro de la centena actual y de 100 en 100 dentro de su millar', () => {
    assert.deepEqual(shortPageListOf(500, 237),
        [1, 100, 200, 210, 220, 230, 235, 236, 237, 238, 239, 240, 250, 260, 270, 280, 290, 300, 400, 500]);
});

test('con decenas de miles sigue corta y trae la primera, la última y las vecinas', () => {
    const shown = shortPageListOf(39_000, 12_345);
    assert.ok(shown.length < 45, `salieron ${shown.length}`);
    for (const expectedPage of [1, 12_343, 12_345, 12_347, 12_350, 12_400, 13_000, 20_000, 39_000]) {
        assert.ok(shown.includes(expectedPage), `falta la ${expectedPage}`);
    }
    assert.deepEqual(shown, [...shown].sort((first, second) => first - second));
});

test('tecleando se busca en TODAS: primero las que empiezan así y después las que lo contienen', () => {
    const shown = filterPages(pageNumbersOf(1500), {inputValue: ' 13 '}, 1);
    assert.deepEqual(shown.slice(0, 3), [13, 130, 131]);
    assert.ok(shown.indexOf(213) > shown.indexOf(1399));
    assert.ok(shown.includes(1013));
    // la que no sale en la lista corta se alcanza tecleando, hasta la última
    assert.deepEqual(filterPages(pageNumbersOf(39_000), {inputValue: '38999'}, 1), [38_999]);
});

test('las páginas se cuentan desde 1', () => {
    assert.deepEqual(pageNumbersOf(3), [1, 2, 3]);
    assert.deepEqual(pageNumbersOf(0), []);
});
