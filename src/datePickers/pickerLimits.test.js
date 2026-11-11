// Pruebas de los topes de las fechas tecleadas (pickerLimits.js).
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {PICKER_KIND, fixedPickerText, pickerBoundsOf, pickerLimitProblemOf} from '@/datePickers/pickerLimits.js';

// mediodía del 11/11/2026 en UTC: el mismo día en México y en UTC
const NOON = Date.UTC(2026, 10, 11, 12, 0, 0);
const asShown = (bound) => `«${bound}»`;

test('fecha: el tope de la pantalla y el de hoy, el más estrecho', () => {
    assert.deepEqual(pickerBoundsOf({min: '2026-01-01', max: '2026-12-31'}, PICKER_KIND.date, NOON), {min: '2026-01-01', max: '2026-12-31'});
    assert.deepEqual(pickerBoundsOf({min: '2026-01-01', disablePast: true}, PICKER_KIND.date, NOON), {min: '2026-11-11', max: undefined});
    assert.deepEqual(pickerBoundsOf({max: '2026-12-31', disableFuture: true}, PICKER_KIND.date, NOON), {min: undefined, max: '2026-11-11'});
    assert.deepEqual(pickerBoundsOf({}, PICKER_KIND.month, NOON), {min: undefined, max: undefined});
    assert.deepEqual(pickerBoundsOf({disablePast: true}, PICKER_KIND.month, NOON), {min: '2026-11', max: undefined});
    assert.deepEqual(pickerBoundsOf({disablePast: true}, PICKER_KIND.dateTime, NOON), {min: '2026-11-11T12:00:00Z', max: undefined});
    // la hora del día no tiene pasado ni futuro
    assert.deepEqual(pickerBoundsOf({min: '09:00', disablePast: true}, PICKER_KIND.time, NOON), {min: '09:00', max: undefined});
});

test('lo tecleado fuera del tope trae su mensaje, con el tope como se ve en pantalla', () => {
    const bounds = {min: '2026-01-01', max: '2026-12-31'};
    assert.deepEqual(pickerLimitProblemOf('2025-12-31', bounds, PICKER_KIND.date, asShown), {key: 'validation:dateMin', values: {min: '«2026-01-01»'}, rule: 'min'});
    assert.deepEqual(pickerLimitProblemOf('2027-01-01', bounds, PICKER_KIND.date, asShown), {key: 'validation:dateMax', values: {max: '«2026-12-31»'}, rule: 'max'});
    assert.equal(pickerLimitProblemOf('2026-06-15', bounds, PICKER_KIND.date, asShown), null);
    assert.equal(pickerLimitProblemOf('', bounds, PICKER_KIND.date, asShown), null);
    assert.equal(pickerLimitProblemOf('08:30', {min: '09:00'}, PICKER_KIND.time, asShown).key, 'validation:timeMin');
    assert.equal(pickerLimitProblemOf('2027-02', {max: '2026-12'}, PICKER_KIND.month, asShown).key, 'validation:monthMax');
    assert.equal(pickerLimitProblemOf('2026-11-11T11:00:00Z', {min: '2026-11-11T12:00:00Z'}, PICKER_KIND.dateTime, asShown).key, 'validation:dateMin');
});

test('corregir lleva al tope que se rompió; dentro o vacío, igual', () => {
    const bounds = {min: '09:00', max: '18:00'};
    assert.equal(fixedPickerText('07:45', bounds), '09:00');
    assert.equal(fixedPickerText('19:00', bounds), '18:00');
    assert.equal(fixedPickerText('12:00', bounds), '12:00');
    assert.equal(fixedPickerText('', bounds), '');
});
