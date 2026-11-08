// Pruebas de hacia dónde abre un menú de la barra (la cuenta, los ajustes): pnpm test.
import assert from 'node:assert/strict';
import {afterEach, beforeEach, test} from 'node:test';

import {barMenuPlacementOf} from '@/appShell/barMenuPlacement.js';

// una tableta de pie (834 x 1194): sin navegador, la ventana y el botón son de mentira con las medidas del iPad
const TABLET = Object.freeze({innerWidth: 834, innerHeight: 1194});
// un botón con su caja en pantalla y, si va dentro de una barra, la caja de la barra
const buttonAt = (box, barBox = box) => ({
    getBoundingClientRect: () => box,
    closest: () => ({getBoundingClientRect: () => barBox}),
});

let savedWindow;
beforeEach(() => {
    savedWindow = globalThis.window;
    globalThis.window = TABLET;
});
afterEach(() => {
    globalThis.window = savedWindow;
});

test('abajo, el menú se centra sobre su botón y abre hacia arriba (no se alinea con la orilla del botón)', () => {
    // el avatar de la tableta: flota hacia adentro, junto a la barra de pestañas centrada
    const placement = barMenuPlacementOf(buttonAt({top: 1136, bottom: 1176, left: 680, right: 720}));
    assert.deepEqual(placement.anchorOrigin, {vertical: 'top', horizontal: 'center'});
    assert.deepEqual(placement.transformOrigin, {vertical: 'bottom', horizontal: 'center'});
});

test('abajo, la separación se cuenta desde la orilla de la barra, no desde el botón', () => {
    const placement = barMenuPlacementOf(buttonAt({top: 1136, bottom: 1176, left: 680, right: 720}, {top: 1126}));
    assert.deepEqual(placement.gapSx, {mt: '-18px'});
});

test('arriba, el menú baja alineado con la orilla derecha de su botón, como antes', () => {
    const placement = barMenuPlacementOf(buttonAt({top: 16, bottom: 56, left: 770, right: 810}));
    assert.deepEqual(placement.anchorOrigin, {vertical: 'bottom', horizontal: 'right'});
    assert.deepEqual(placement.transformOrigin, {vertical: 'top', horizontal: 'right'});
});

test('en la orilla izquierda (el menú lateral encogido) abre hacia la derecha', () => {
    const placement = barMenuPlacementOf(buttonAt({top: 1100, bottom: 1140, left: 12, right: 52}));
    assert.deepEqual(placement.anchorOrigin, {vertical: 'bottom', horizontal: 'right'});
    assert.deepEqual(placement.transformOrigin, {vertical: 'bottom', horizontal: 'left'});
});

test('sin botón (el menú cerrado) no truena y queda hacia abajo', () => {
    assert.deepEqual(barMenuPlacementOf(null).anchorOrigin, {vertical: 'bottom', horizontal: 'right'});
});
