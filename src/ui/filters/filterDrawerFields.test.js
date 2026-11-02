// Pruebas de los campos del cajón de búsqueda. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
    FILTER_FIELD_KIND, activeDrawerFilterCountOf, comparisonOf, comparisonTextOf, drawerValuesOf, emptyDrawerValuesOf,
    filterDrawerChipsOf, filterDrawerKindsOf, filterKeysOf, invalidRangesOf,
} from '@/ui/filters/filterDrawerFields.js';

const FIELDS = [
    {name: 'status', label: 'Estatus', kind: FILTER_FIELD_KIND.multiSelect, options: [{value: 'paid', label: 'Pagado'}]},
    {name: 'payment_method', label: 'Pago', kind: FILTER_FIELD_KIND.select, options: [{value: 'card', label: 'Tarjeta'}]},
    {name: 'quantity', label: 'Piezas', kind: FILTER_FIELD_KIND.numberRange, suffix: 'pzas'},
    {name: 'created', label: 'Fecha', kind: FILTER_FIELD_KIND.dateRange, keys: {from: 'created_from', to: 'created_to'}},
    {name: 'total', label: 'Total', kind: FILTER_FIELD_KIND.comparison, prefix: '$'},
];

test('cada campo viaja con sus nombres; los rangos con dos y se pueden cambiar', () => {
    assert.deepEqual(filterKeysOf(FIELDS[2]), ['quantity_min', 'quantity_max']);
    assert.deepEqual(filterKeysOf(FIELDS[3]), ['created_from', 'created_to']);
    assert.deepEqual(filterDrawerKindsOf(FIELDS), {status: 'multiSelect'});
    assert.deepEqual(emptyDrawerValuesOf(FIELDS), {status: [], payment_method: '', quantity_min: '', quantity_max: '', created_from: '', created_to: '', total: ''});
    assert.deepEqual(drawerValuesOf(FIELDS, {total: 'gte:500', search: 'ana'}).total, 'gte:500');
    assert.equal('search' in drawerValuesOf(FIELDS, {search: 'ana'}), false);
});

test('la comparación va y viene como operador:número', () => {
    assert.deepEqual(comparisonOf('gte:500.50'), {operator: 'gte', value: '500.50'});
    assert.equal(comparisonOf('otra:5'), null);
    assert.equal(comparisonOf('gte:'), null);
    assert.equal(comparisonTextOf('lt', '20'), 'lt:20');
    assert.equal(comparisonTextOf('lt', ''), '');
});

test('cuántos hay puestos (un rango cuenta uno) y los rangos al revés', () => {
    const filters = {status: ['paid'], quantity_min: '3', quantity_max: '10', total: '', created_to: '2026-11-01'};
    assert.equal(activeDrawerFilterCountOf(FIELDS, filters), 3);
    assert.deepEqual(invalidRangesOf(FIELDS, {quantity_min: '10', quantity_max: '3'}), {quantity_max: true});
    assert.deepEqual(invalidRangesOf(FIELDS, {created_from: '2026-11-05', created_to: '2026-11-01'}), {created_to: true});
    assert.deepEqual(invalidRangesOf(FIELDS, {quantity_min: '3', quantity_max: '3'}), {});
});

test('los chips dicen cada valor en palabras', () => {
    const t = (key, values) => `${values.label} ${key.endsWith('chipFrom') ? 'desde' : 'hasta'}`;
    const chips = filterDrawerChipsOf(FIELDS, {t, formatDate: (date) => `día ${date}`});
    const byKey = Object.fromEntries(chips.text.map((chip) => [chip.key, chip]));
    assert.equal(byKey.quantity_min.label, 'Piezas desde');
    assert.equal(byKey.quantity_min.format('3'), '3 pzas');
    assert.equal(byKey.created_to.format('2026-11-01'), 'día 2026-11-01');
    assert.equal(byKey.total.format('gte:500'), '≥ $500');
    assert.equal(byKey.payment_method.format('card'), 'Tarjeta');
    assert.equal(chips.multiSelect[0].itemLabel('paid'), 'Pagado');
});
