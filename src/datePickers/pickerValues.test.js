// Pruebas de cómo viajan la fecha con hora, la hora y el mes, y de cómo se nombra la zona. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
    displayFormatsOf, earliestInstantFromNow, instantPlusMinutes, instantTextOf, latestInstantOf, monthTextOf, pickerInstantOf, pickerMonthOf, pickerTimeOf, timeTextOf, timeZoneNameOf,
} from '@/datePickers/pickerValues.js';
import {minutesAfterRule, minutesFromNowRule} from '@/datePickers/dateTimeRules.js';

test('un instante se pinta en la zona del proveedor y regresa en UTC', () => {
    const shown = pickerInstantOf('2026-11-01T18:30:00Z', 'America/Mexico_City');
    // en México no hay horario de verano desde 2022: siempre 6 horas menos
    assert.equal(shown.format('YYYY-MM-DD HH:mm'), '2026-11-01 12:30');
    assert.equal(instantTextOf(shown), '2026-11-01T18:30:00Z');
});

test('un instante con desfase (como lo manda un backend) se lee igual', () => {
    const shown = pickerInstantOf('2026-11-01T12:30:00-06:00', 'America/Tijuana');
    assert.equal(instantTextOf(shown), '2026-11-01T18:30:00Z');
    // Tijuana sí cambia de horario: el 1 de noviembre de 2026 ya regresó a UTC-8
    assert.equal(shown.format('HH:mm'), '10:30');
});

test('vacío, a medias o basura en la fecha con hora viaja como vacío', () => {
    assert.equal(pickerInstantOf('', 'America/Mexico_City'), null);
    assert.equal(pickerInstantOf(null, 'America/Mexico_City'), null);
    assert.equal(pickerInstantOf('mañana', 'America/Mexico_City'), null);
    assert.equal(instantTextOf(null), '');
});

test('la hora del día va y viene como HH:mm, sin zona', () => {
    assert.equal(timeTextOf(pickerTimeOf('09:05')), '09:05');
    assert.equal(timeTextOf(pickerTimeOf('23:30')), '23:30');
    assert.equal(pickerTimeOf('9:05'), null);
    assert.equal(pickerTimeOf(''), null);
    assert.equal(timeTextOf(null), '');
});

test('el mes va y viene como AAAA-MM', () => {
    assert.equal(monthTextOf(pickerMonthOf('2026-02')), '2026-02');
    assert.equal(pickerMonthOf('2026-2'), null);
    assert.equal(pickerMonthOf(undefined), null);
    assert.equal(monthTextOf(null), '');
});

test('la hora en pantalla sigue el hourCycle del proveedor y el idioma', () => {
    assert.deepEqual(displayFormatsOf('es'), {date: 'DD/MM/YYYY', month: 'MMMM YYYY', time: 'HH:mm', dateTime: 'DD/MM/YYYY HH:mm', ampm: false});
    assert.equal(displayFormatsOf('en', 'h12').dateTime, 'MM/DD/YYYY hh:mm a');
    assert.equal(displayFormatsOf('en', 'h12').ampm, true);
    // un idioma que no conoce sale como el español
    assert.equal(displayFormatsOf('pt').date, 'DD/MM/YYYY');
});

test('la zona se nombra en palabras y, si no se puede, tal cual', () => {
    const name = timeZoneNameOf('America/Mexico_City', 'es-MX', new Date('2026-11-01T18:30:00Z'));
    assert.match(name, /^Hora /);
    assert.equal(timeZoneNameOf('Zona/Inventada', 'es-MX'), 'Zona/Inventada');
});

test('«al menos N minutos después de ahora» cuenta desde el minuto en punto, sin segundos', () => {
    // 18:32:47 UTC + 5 minutos = 18:37:00 (los segundos de ahora no cuentan)
    assert.equal(earliestInstantFromNow(5, Date.parse('2026-11-02T18:32:47.512Z')), '2026-11-02T18:37:00Z');
    assert.equal(earliestInstantFromNow(0, new Date('2026-11-02T18:32:00Z')), '2026-11-02T18:32:00Z');
});

test('sumar minutos a un instante, y el más tarde de varios mínimos', () => {
    assert.equal(instantPlusMinutes('2026-11-02T23:45:00Z', 30), '2026-11-03T00:15:00Z');
    assert.equal(instantPlusMinutes('2026-11-02T12:00:00-06:00', 5), '2026-11-02T18:05:00Z');
    assert.equal(instantPlusMinutes('', 30), '');
    assert.equal(instantPlusMinutes('no es fecha', 30), '');
    assert.equal(latestInstantOf('2026-11-02T18:00:00Z', '', '2026-11-02T18:05:00Z', undefined), '2026-11-02T18:05:00Z');
    assert.equal(latestInstantOf('', null), '');
});

test('las reglas de yup: con anticipación desde ahora y con duración desde el inicio', () => {
    const fromNow = minutesFromNowRule(5);
    assert.deepEqual(fromNow.message, {key: 'validation:minutesFromNow', values: {count: 5}});
    assert.equal(fromNow.test(''), true);
    assert.equal(fromNow.test(new Date(Date.now() + 60 * 60_000).toISOString()), true);
    assert.equal(fromNow.test(new Date(Date.now() + 60_000).toISOString()), false);

    const afterStart = minutesAfterRule('startsAt', 30);
    const parent = {startsAt: '2026-11-02T18:00:00Z'};
    assert.equal(afterStart.test('2026-11-02T18:30:00Z', {parent}), true);
    assert.equal(afterStart.test('2026-11-02T18:29:00Z', {parent}), false);
    // sin inicio no hay contra qué comparar: lo dice la regla del inicio
    assert.equal(afterStart.test('2026-11-02T18:29:00Z', {parent: {startsAt: ''}}), true);
});

