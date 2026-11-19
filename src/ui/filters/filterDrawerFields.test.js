// Pruebas de los campos del cajón de búsqueda. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
    FILTER_FIELD_KIND, FILTER_FIELD_PROBLEM, activeDrawerFilterCountOf, comparisonOf, comparisonTextOf, dateLimitsOf, dateRangeBoundsOf,
    drawerProblemsOf, drawerValuesOf, emptyDrawerValuesOf, filterDrawerChipsOf, filterDrawerKindsOf, filterKeysOf, invalidRangesOf,
    screenProblemsOf,
} from '@/ui/filters/filterDrawerFields.js';
import * as Yup from 'yup';

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

// un rango propio: dos horas del día 'HH:mm' en sus dos llaves, con su regla de «al revés»
const PURCHASE_HOURS = {
    name: 'purchase_hours', label: 'Hora de compra', kind: FILTER_FIELD_KIND.custom, keys: {from: 'hour_from', to: 'hour_to'},
    isBackwards: (from, to) => to < from, chipFormat: (time) => `${time} h`, render: () => null,
};

test('un rango propio (custom con keys) guarda en sus dos llaves, cuenta uno y da dos chips', () => {
    const fields = [...FIELDS, PURCHASE_HOURS];
    assert.deepEqual(filterKeysOf(PURCHASE_HOURS), ['hour_from', 'hour_to']);
    // sin keys (o con una sola) sigue con su nombre, como antes
    assert.deepEqual(filterKeysOf({name: 'zone', kind: FILTER_FIELD_KIND.custom, keys: {from: 'zone_from'}}), ['zone']);
    assert.deepEqual(emptyDrawerValuesOf([PURCHASE_HOURS]), {hour_from: '', hour_to: ''});
    // «Limpiar» y abrir de nuevo: lo puesto sigue ahí por llave
    assert.deepEqual(drawerValuesOf([PURCHASE_HOURS], {hour_from: '09:00', hour_to: '14:00'}), {hour_from: '09:00', hour_to: '14:00'});
    assert.equal(activeDrawerFilterCountOf(fields, {hour_from: '09:00', hour_to: '14:00'}), 1);
    const chips = filterDrawerChipsOf([PURCHASE_HOURS], {t: (key, values) => `${values.label} ${key.endsWith('chipFrom') ? 'desde' : 'hasta'}`});
    assert.deepEqual(chips.text.map((chip) => [chip.key, chip.label, chip.format('09:00')]),
        [['hour_from', 'Hora de compra desde', '09:00 h'], ['hour_to', 'Hora de compra hasta', '09:00 h']]);
    // sin chipFormat, el chip dice el valor tal cual (no lleva format)
    assert.equal('format' in filterDrawerChipsOf([{...PURCHASE_HOURS, chipFormat: undefined}], {t: () => ''}).text[0], false);
});

test('un rango propio al revés no deja buscar si trae isBackwards; sin él, nunca se marca', () => {
    assert.deepEqual(invalidRangesOf([PURCHASE_HOURS], {hour_from: '14:00', hour_to: '09:00'}), {hour_to: true});
    assert.deepEqual(invalidRangesOf([PURCHASE_HOURS], {hour_from: '09:00', hour_to: '14:00'}), {});
    assert.deepEqual(invalidRangesOf([{...PURCHASE_HOURS, isBackwards: undefined}], {hour_from: '14:00', hour_to: '09:00'}), {});
    assert.deepEqual(drawerProblemsOf([PURCHASE_HOURS], {hour_from: '14:00', hour_to: '09:00'}), {hour_to: {problem: FILTER_FIELD_PROBLEM.rangeBackwards}});
});

test('los topes de un rango de fechas: los del campo, hoy, y el más estrecho gana', () => {
    const today = '2026-11-06';
    assert.deepEqual(dateLimitsOf({}, today), {minDate: undefined, maxDate: undefined});
    assert.deepEqual(dateLimitsOf({disableFuture: true}, today), {minDate: undefined, maxDate: today});
    assert.deepEqual(dateLimitsOf({minDate: '2026-01-01', disablePast: true}, today), {minDate: today, maxDate: undefined});
    assert.deepEqual(dateLimitsOf({maxDate: '2026-10-31', disableFuture: true}, today), {minDate: undefined, maxDate: '2026-10-31'});
    // cada extremo acota al otro en su calendario
    const field = {name: 'paid', kind: FILTER_FIELD_KIND.dateRange, minDate: '2026-01-01', disableFuture: true};
    assert.deepEqual(dateRangeBoundsOf(field, {paid_from: '2026-03-10', paid_to: '2026-04-20'}, today),
        {from: {minDate: '2026-01-01', maxDate: '2026-04-20'}, to: {minDate: '2026-03-10', maxDate: today}});
    assert.deepEqual(dateRangeBoundsOf(field, {paid_from: '', paid_to: ''}, today),
        {from: {minDate: '2026-01-01', maxDate: today}, to: {minDate: '2026-01-01', maxDate: today}});
});

test('una fecha tecleada fuera de los topes se dice en su campo y con el tope que se pasó; nada se borra', () => {
    const field = {name: 'paid', label: 'Pago', kind: FILTER_FIELD_KIND.dateRange, minDate: '2026-01-01', disableFuture: true};
    const today = '2026-11-06';
    assert.deepEqual(drawerProblemsOf([field], {paid_from: '2025-12-31', paid_to: '2098-01-01'}, {today}), {
        paid_from: {problem: FILTER_FIELD_PROBLEM.beforeMinDate, date: '2026-01-01'},
        paid_to: {problem: FILTER_FIELD_PROBLEM.afterMaxDate, date: today},
    });
    assert.deepEqual(drawerProblemsOf([field], {paid_from: '2026-05-01', paid_to: '2026-04-01'}, {today}), {paid_to: {problem: FILTER_FIELD_PROBLEM.rangeBackwards}});
    assert.deepEqual(drawerProblemsOf([field], {paid_from: '2026-01-01', paid_to: today}, {today}), {});
    // sin topes, como antes: solo el rango al revés
    assert.deepEqual(drawerProblemsOf(FIELDS, {created_from: '2098-01-01', created_to: ''}), {});
});

test('lo que dice la pantalla: su esquema de yup y su función, juntos; en la misma llave gana la función', () => {
    // obligatorio el comprador y la divisa; la pareja monto y operador se exige una a la otra (las parejas van en .shape)
    const schema = Yup.object().shape({
        buyer: Yup.string().required('Escoja el comprador'),
        currency: Yup.string().required(),
        amount: Yup.string().when('operator', {is: Boolean, then: (rule) => rule.required('Falta el monto')}),
        operator: Yup.string().when('amount', {is: Boolean, then: (rule) => rule.required('Falta el operador')}),
    }, [['amount', 'operator']]);
    const empty = {buyer: '', currency: '', amount: '', operator: ''};
    const problems = screenProblemsOf(empty, {schema});
    assert.deepEqual(Object.keys(problems).sort(), ['buyer', 'currency']);
    assert.equal(problems.buyer, 'Escoja el comprador');
    // la pareja: con solo uno, el otro avisa
    assert.deepEqual(screenProblemsOf({...empty, buyer: 'B-1', currency: 'MXN', amount: '500'}, {schema}), {operator: 'Falta el operador'});
    // la función se suma y en la misma llave gana
    const validate = (values) => ({buyer: values.buyer === 'B-9' ? 'Ese comprador ya no opera' : undefined, currency: 'Solo pesos', amount: ''});
    assert.deepEqual(screenProblemsOf({...empty, buyer: 'B-9'}, {schema, validate}), {buyer: 'Ese comprador ya no opera', currency: 'Solo pesos'});
    // todo bien: nada
    assert.deepEqual(screenProblemsOf({...empty, buyer: 'B-1', currency: 'MXN'}, {schema, validate: () => ({})}), {});
    assert.deepEqual(screenProblemsOf(empty), {});
});

test('un esquema mal armado truena y no se esconde como aviso', () => {
    const broken = {validateSync: () => { throw new TypeError('schema.validateSync is broken'); }};
    assert.throws(() => screenProblemsOf({}, {schema: broken}), TypeError);
});
