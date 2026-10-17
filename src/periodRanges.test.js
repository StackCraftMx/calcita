// Las reglas de un rango de periodos (periodRanges.js): sin React y sin API.
import {test} from 'node:test';
import assert from 'node:assert/strict';

import {periodRangeIsValid, rangeEndAfterStartChange, rangeEndOptionsOf} from '@/periodRanges.js';

// agosto y septiembre validados, octubre todavía no, noviembre validado (inventado para el hueco)
const OPTIONS = [
    {value: '2026-08-1', disabled: false},
    {value: '2026-08-2', disabled: false},
    {value: '2026-09-1', disabled: false},
    {value: '2026-09-2', disabled: false},
    {value: '2026-10-1', disabled: true},
    {value: '2026-10-2', disabled: true},
    {value: '2026-11-1', disabled: false},
];

test('«hasta» no ofrece lo de antes de «desde» ni salta un periodo roto', () => {
    // Escenario: «desde» es la Q2 de agosto y octubre está sin validar.
    // Esperado: se puede terminar de la Q2 de agosto a la Q2 de septiembre; antes y después del hueco, apagado
    const enabledValues = rangeEndOptionsOf(OPTIONS, '2026-08-2').filter((option) => !option.disabled).map((option) => option.value);

    assert.deepEqual(enabledValues, ['2026-08-2', '2026-09-1', '2026-09-2']);
});

test('un rango vale solo en orden y sin nada apagado en medio', () => {
    assert.equal(periodRangeIsValid(OPTIONS, '2026-08-1', '2026-09-2'), true);
    assert.equal(periodRangeIsValid(OPTIONS, '2026-09-1', '2026-09-1'), true);
    // al revés, con el hueco de octubre en medio y con un extremo que no existe
    assert.equal(periodRangeIsValid(OPTIONS, '2026-09-2', '2026-08-1'), false);
    assert.equal(periodRangeIsValid(OPTIONS, '2026-09-2', '2026-11-1'), false);
    assert.equal(periodRangeIsValid(OPTIONS, '2026-08-1', '2027-01-1'), false);
});

test('al cambiar «desde», «hasta» se queda si el rango sigue valiendo y si no, se iguala a «desde»', () => {
    assert.equal(rangeEndAfterStartChange(OPTIONS, '2026-08-2', '2026-09-2'), '2026-09-2');
    assert.equal(rangeEndAfterStartChange(OPTIONS, '2026-11-1', '2026-09-2'), '2026-11-1');
});
