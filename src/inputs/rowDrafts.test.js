// Pruebas del almacén de lo capturado sin guardar por renglón. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {UNSAVED_ROWS, createRowDraftsStore} from '@/inputs/rowDrafts.js';

test('guarda lo capturado por renglón, lo quita y lo cuenta', () => {
    const store = createRowDraftsStore();
    store.set(7, {values: {amount: '10'}, row: {id: 7, amount: '5'}});
    store.set(9, {values: {amount: '20'}, row: {id: 9, amount: '8'}});
    assert.equal(store.size(), 2);
    assert.deepEqual(store.get(7).values, {amount: '10'});
    store.remove(7);
    assert.equal(store.get(7), null);
    assert.deepEqual(store.entries().map(([rowId]) => rowId), [9]);
    store.clear();
    assert.equal(store.size(), 0);
});

test('avisa cada cambio a quien escucha, y no avisa si no cambió nada', () => {
    const store = createRowDraftsStore();
    let calls = 0;
    const stop = store.subscribe(() => {
        calls += 1;
    });
    store.set(1, {values: {}, row: {}});
    store.remove(2);
    store.remove(1);
    store.clear();
    assert.equal(calls, 2);
    stop();
    store.set(3, {values: {}, row: {}});
    assert.equal(calls, 2);
});

test('los modos de lo que pasa al cambiar de página', () => {
    assert.deepEqual(Object.values(UNSAVED_ROWS), ['keep', 'confirm']);
});
