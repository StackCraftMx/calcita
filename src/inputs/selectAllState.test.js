// Pruebas de «Elegir todos». Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {selectAllStateOf} from '@/inputs/selectAllState.js';

test('con algunos elegidos la casilla va a medias y picarla agrega los que faltan al final', () => {
    const state = selectAllStateOf(['b'], ['a', 'b', 'c']);
    assert.equal(state.allChosen, false);
    assert.equal(state.someChosen, true);
    assert.deepEqual(state.toggled(), ['b', 'a', 'c']);
});

test('con todos elegidos picarla los quita, y deja lo que no es de los candidatos (lo de otra búsqueda)', () => {
    const state = selectAllStateOf(['x', 'a', 'b'], ['a', 'b']);
    assert.equal(state.allChosen, true);
    assert.equal(state.someChosen, false);
    assert.deepEqual(state.toggled(), ['x']);
    // sin candidatos (nada coincide) no hay «todos»
    assert.equal(selectAllStateOf(['a'], []).allChosen, false);
});
