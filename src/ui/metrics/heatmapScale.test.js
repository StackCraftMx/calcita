// Pruebas de las cuentas del calendario de actividad. Sin navegador: npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {calendarWeeksOf, levelOf, quantileThresholds} from '@/ui/metrics/heatmapScale.js';

test('los niveles se cortan por cuartiles de los días con actividad y el cero es su propio nivel', () => {
    // ocho días con lecturas de 120 a 960 y un día sin nada
    const thresholds = quantileThresholds([0, 120, 240, 360, 480, 600, 720, 840, 960]);
    assert.deepEqual(thresholds, [360, 600, 840]);
    assert.deepEqual([0, 120, 360, 480, 700, 960].map((value) => levelOf(value, thresholds)), [0, 1, 2, 2, 3, 4]);
});

test('si casi todos los días leen lo mismo, esos días van en el tono lleno y los de menos en claro', () => {
    // 20 cortes completos de 480 registros y 2 con un archivo rechazado (360)
    const thresholds = quantileThresholds([...Array(20).fill(480), 360, 360]);
    assert.deepEqual([levelOf(480, thresholds), levelOf(360, thresholds)], [4, 1]);
});

test('sin actividad no truena y todo queda en el nivel cero', () => {
    assert.deepEqual(quantileThresholds([0, 0]), [1, 1, 1]);
    assert.equal(levelOf(0, [1, 1, 1]), 0);
});

test('las semanas empiezan en lunes y los días fuera del rango quedan en null', () => {
    // 2026-09-02 es miércoles; 2026-09-15 es martes: tres semanas (31 ago, 7 sep, 14 sep)
    const {weeks, monthMarks} = calendarWeeksOf({
        startsOn: '2026-09-02', endsOn: '2026-09-15', days: [{date: '2026-09-15', value: 120, detail: '1 carga'}],
    });
    assert.equal(weeks.length, 3);
    assert.deepEqual(weeks[0].slice(0, 3), [null, null, {date: '2026-09-02', value: 0, detail: undefined}]);
    assert.deepEqual(weeks[2][1], {date: '2026-09-15', value: 120, detail: '1 carga'});
    assert.deepEqual(weeks[2].slice(2), [null, null, null, null, null]);
    // el 1 de septiembre queda fuera del rango: ninguna semana rotula mes
    assert.deepEqual(monthMarks, [null, null, null]);
});

test('el mes se rotula en la semana donde cae su día 1 y un año completo son 53 semanas o menos', () => {
    const {weeks, monthMarks} = calendarWeeksOf({startsOn: '2025-09-16', endsOn: '2026-09-15', days: []});
    assert.ok(weeks.length >= 52 && weeks.length <= 53);
    assert.equal(monthMarks.filter((month) => month !== null).length, 12);
    // 2025-10-01 cae en la semana del lunes 29 de septiembre, la tercera del calendario
    assert.equal(monthMarks[2], 10);
});
