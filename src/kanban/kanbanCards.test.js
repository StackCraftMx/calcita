import assert from 'node:assert/strict';
import {test} from 'node:test';

import {DUE_STATUS, dueStatusOf, tagOf, todayIsoDateOf} from '@/kanban/kanbanCards.js';

test('la fecha límite contra hoy: vencida, hoy o falta; sin fecha, nada', () => {
    assert.equal(dueStatusOf('2026-10-17', '2026-10-18'), DUE_STATUS.overdue);
    assert.equal(dueStatusOf('2026-10-18', '2026-10-18'), DUE_STATUS.today);
    assert.equal(dueStatusOf('2026-11-01', '2026-10-18'), DUE_STATUS.upcoming);
    assert.equal(dueStatusOf('', '2026-10-18'), null);
    assert.equal(todayIsoDateOf(new Date(2026, 0, 5, 23, 30)), '2026-01-05');
});

test('una etiqueta puede ser un texto o llevar su color', () => {
    assert.deepEqual(tagOf('Clientes'), {label: 'Clientes', color: 'default'});
    assert.deepEqual(tagOf({label: 'Urgente', color: 'error'}), {label: 'Urgente', color: 'error'});
});
