// Pruebas de la lista de estilos de la pantalla (sxListOf). Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {sxListOf} from '@/theme/themePieces.js';

test('sin estilo de la pantalla no agrega nada a la lista', () => {
    assert.deepEqual(sxListOf(undefined), []);
    assert.deepEqual(sxListOf(null), []);
});

test('un objeto o una función del tema quedan como un elemento de la lista', () => {
    const styles = {'& .MuiDataGrid-cell': {alignItems: 'flex-start'}};
    const stylesOfTheme = (theme) => ({color: theme.palette.primary.main});
    assert.deepEqual(sxListOf(styles), [styles]);
    assert.deepEqual(sxListOf(stylesOfTheme), [stylesOfTheme]);
});

test('una lista se queda igual, con sus condiciones apagadas incluidas (MUI las salta)', () => {
    const list = [{p: 2}, false, {m: 1}];
    assert.equal(sxListOf(list), list);
});
