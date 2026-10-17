// Pruebas de los diccionarios de valores del API. Sin navegador: npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {dictionaryEntryOf, labelOf, lookup, shortLabelOf} from '@/dictionaries/dictionaries.js';

const ORDER_STATUS = Object.freeze({
    pending: dictionaryEntryOf('pending', 'orderStatus.pending', 'warning'),
    rejected: dictionaryEntryOf('rejected', 'orderStatus.rejected', 'error', {hasShortLabel: true}),
});
const translateKey = (key) => `«${key}»`;

test('una entrada guarda sus llaves en el namespace dictionaries, congelada', () => {
    assert.deepEqual(ORDER_STATUS.pending, {
        value: 'pending', labelKey: 'dictionaries:orderStatus.pending.label', tooltipKey: 'dictionaries:orderStatus.pending.tooltip',
        color: 'warning', isKnown: true,
    });
    assert.equal(Object.isFrozen(ORDER_STATUS.pending), true);
});

test('un valor conocido se pinta con su texto y uno nuevo con su código crudo, sin tronar', () => {
    assert.equal(labelOf(lookup(ORDER_STATUS, 'pending'), translateKey), '«dictionaries:orderStatus.pending.label»');
    assert.equal(labelOf(lookup(ORDER_STATUS, 'shipped'), translateKey), 'shipped');
    assert.equal(lookup(ORDER_STATUS, 'shipped').isKnown, false);
    // sin valor: el texto de «sin estatus»
    assert.equal(labelOf(lookup(ORDER_STATUS, null), translateKey), '«dictionaries:unknown.label»');
});

test('la palabra corta sale solo si la entrada la trae; si no, su etiqueta de siempre', () => {
    assert.equal(shortLabelOf(lookup(ORDER_STATUS, 'rejected'), translateKey), '«dictionaries:orderStatus.rejected.shortLabel»');
    assert.equal(shortLabelOf(lookup(ORDER_STATUS, 'pending'), translateKey), '«dictionaries:orderStatus.pending.label»');
});
