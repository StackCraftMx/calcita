import {test} from 'node:test';
import assert from 'node:assert/strict';

import {moveRow} from '@/sortable/sortableRows.js';

const ROUTE = Object.freeze(['centro', 'polanco', 'chapultepec', 'juriquilla']);

test('mover un renglón hacia abajo y hacia arriba recorre a los demás', () => {
    assert.deepEqual(moveRow(ROUTE, 0, 2), ['polanco', 'chapultepec', 'centro', 'juriquilla']);
    assert.deepEqual(moveRow(ROUTE, 3, 0), ['juriquilla', 'centro', 'polanco', 'chapultepec']);
    assert.deepEqual(moveRow(ROUTE, 1, 3), ['centro', 'chapultepec', 'juriquilla', 'polanco']);
});

test('no toca la lista que recibe: regresa una nueva', () => {
    const moved = moveRow(ROUTE, 0, 1);
    assert.notEqual(moved, ROUTE);
    assert.deepEqual(ROUTE, ['centro', 'polanco', 'chapultepec', 'juriquilla']);
});

test('el mismo lugar o una posición que no existe regresa una copia igual', () => {
    for (const [from, to] of [[2, 2], [-1, 0], [0, 4], [1.5, 0], [0, Number.NaN]]) {
        const same = moveRow(ROUTE, from, to);
        assert.deepEqual(same, [...ROUTE], `de ${from} a ${to}`);
        assert.notEqual(same, ROUTE);
    }
});
