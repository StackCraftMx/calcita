// Pruebas de cuánto falta y cómo se escribe. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {countdownClockOf, countdownPartsOf} from '@/ui/countdown/countdownParts.js';

const NOW = Date.parse('2026-11-01T12:00:00Z');

test('lo que falta se parte en días, horas, minutos y segundos', () => {
    const parts = countdownPartsOf('2026-11-03T14:14:30Z', NOW);
    assert.deepEqual(parts, {days: 2, hours: 2, minutes: 14, seconds: 30, totalSeconds: 2 * 86_400 + 2 * 3600 + 14 * 60 + 30, isOver: false});
    assert.equal(countdownClockOf(parts), '2 d 02:14:30');
    assert.equal(countdownClockOf({...parts, days: 0}, {showSeconds: false}), '02:14');
});

test('medio segundo por delante todavía cuenta como un segundo', () => {
    assert.equal(countdownPartsOf(NOW + 400, NOW).seconds, 1);
    assert.equal(countdownPartsOf(NOW + 400, NOW).isOver, false);
});

test('ya pasado, o un momento que no se entiende, es todo en cero con isOver', () => {
    assert.equal(countdownPartsOf('2026-11-01T11:59:00Z', NOW).isOver, true);
    assert.equal(countdownPartsOf('mañana', NOW).isOver, true);
    assert.equal(countdownClockOf(countdownPartsOf(NOW, NOW)), '00:00:00');
    assert.equal(countdownPartsOf(new Date(NOW + 61_000), NOW).minutes, 1);
});
