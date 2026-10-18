// Pruebas de cuándo se encoge la barra de pestañas del teléfono: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {TAB_BAR_SCROLL_START, tabBarStateAfterScroll} from '@/appShell/tabBarScroll.js';

// desliza la página por varias posiciones seguidas, como llegan los eventos del navegador
const scrollThrough = (positions, state = TAB_BAR_SCROLL_START) => positions.reduce(tabBarStateAfterScroll, state);
const steps = (from, to, step) => Array.from({length: Math.floor(Math.abs(to - from) / step) + 1}, (_, index) => from + Math.sign(to - from) * step * index);

test('al leer hacia abajo se encoge, aunque el navegador avise de 2 en 2 px', () => {
    assert.equal(scrollThrough(steps(0, 200, 2)).isMinimized, true);
});

test('cerca de arriba sigue completa: todavía no hay nada que leer debajo', () => {
    assert.equal(scrollThrough(steps(0, 50, 2)).isMinimized, false);
});

test('un temblor del dedo no la encoge ni la regresa', () => {
    const minimized = scrollThrough(steps(0, 300, 2));
    assert.equal(scrollThrough([298, 300, 297, 301], minimized).isMinimized, true);
    const expanded = scrollThrough([400, 380, 360], minimized);
    assert.equal(expanded.isMinimized, false);
    assert.equal(scrollThrough([365, 362, 368], expanded).isMinimized, false);
});

test('al subir un poco regresa completa', () => {
    const minimized = scrollThrough(steps(0, 300, 2));
    assert.equal(scrollThrough(steps(300, 286, 2), minimized).isMinimized, false);
});

test('al volver hasta arriba de un salto (tocar la barra del reloj) regresa completa', () => {
    const minimized = scrollThrough(steps(0, 300, 2));
    assert.equal(tabBarStateAfterScroll(minimized, 0).isMinimized, false);
});
