// Pruebas de cómo viajan la fecha con hora, la hora y el mes, y de cómo se nombra la zona. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
    displayFormatsOf, instantTextOf, monthTextOf, pickerInstantOf, pickerMonthOf, pickerTimeOf, timeTextOf, timeZoneNameOf,
} from '@/datePickers/pickerValues.js';

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
