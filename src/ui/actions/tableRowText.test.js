// Pruebas del renglón para pegar en Excel. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {tableRowTextOf} from '@/ui/actions/tableRowText.js';

test('las celdas van separadas por tabulador, como las copia Excel', () => {
    assert.equal(tableRowTextOf(['P-0012', 'Muebles del Norte', '$1,250.50']), 'P-0012\tMuebles del Norte\t$1,250.50');
});

test('una celda vacía o nula deja su lugar vacío (no se recorren las columnas)', () => {
    assert.equal(tableRowTextOf(['a', null, undefined, '', 0]), 'a\t\t\t\t0');
});

test('un tabulador o un salto de renglón dentro de una celda se vuelve espacio (partirían el renglón)', () => {
    assert.equal(tableRowTextOf(['Calle 5\nColonia Centro', 'uno\tdos']), 'Calle 5 Colonia Centro\tuno dos');
});
