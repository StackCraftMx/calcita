import assert from 'node:assert/strict';
import {test} from 'node:test';

import {REMINDER_UNIT, isOpenableMeetingUrl, reminderOf} from '@/calendar/calendarEvents.js';

test('el recordatorio en la unidad más grande que lo dice exacto', () => {
    assert.deepEqual(reminderOf(null), {unit: REMINDER_UNIT.none, count: 0});
    assert.deepEqual(reminderOf(0), {unit: REMINDER_UNIT.atStart, count: 0});
    assert.deepEqual(reminderOf(15), {unit: REMINDER_UNIT.minutes, count: 15});
    assert.deepEqual(reminderOf(90), {unit: REMINDER_UNIT.minutes, count: 90});
    assert.deepEqual(reminderOf(120), {unit: REMINDER_UNIT.hours, count: 2});
    assert.deepEqual(reminderOf(1440), {unit: REMINDER_UNIT.days, count: 1});
});

test('solo se ofrece abrir una liga http o https', () => {
    assert.equal(isOpenableMeetingUrl('https://meet.example.com/abc'), true);
    assert.equal(isOpenableMeetingUrl('javascript:alert(1)'), false);
    assert.equal(isOpenableMeetingUrl('sala 3'), false);
    assert.equal(isOpenableMeetingUrl(''), false);
});
