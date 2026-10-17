// Pruebas de la etiqueta de BarList contra el cálculo real de barras de Recharts (sin navegador): npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {computeBarRectangles} from 'recharts/lib/cartesian/Bar.js';

import {BAR_MIN_POINT_SIZE, barLabelValueOf} from '@/ui/metrics/barListLabels.js';

const ROW_HEIGHT_PIXELS = 36;
const PLOT_WIDTH_PIXELS = 300;

/**
 * Rectángulos que Recharts 3 dibuja para BarList (layout vertical: eje numérico X, eje de categorías Y).
 *
 * @param {Array<{value: number}>} items renglones de BarList
 * @param {number} minPointSize minPointSize de la barra
 * @returns {Array<object>} lo que LabelList recibe como data
 */
function barRectanglesOf(items, minPointSize) {
    const maximumValue = Math.max(...items.map((item) => item.value));
    return computeBarRectangles({
        layout: 'vertical',
        barSettings: {dataKey: 'value', minPointSize, hasCustomShape: false},
        pos: {offset: 0, size: 16},
        bandSize: ROW_HEIGHT_PIXELS,
        // escala lineal de d3 con dominio [0, dataMax]: con dominio [0, 0] todo cae a la mitad del rango (ancho 0)
        xAxis: {type: 'number', scale: {domain: () => [0, maximumValue], map: (value) => (maximumValue === 0 ? PLOT_WIDTH_PIXELS / 2 : (value / maximumValue) * PLOT_WIDTH_PIXELS)}},
        yAxis: {type: 'category', scale: {domain: () => items.map((item) => item.label), map: () => 0}},
        xAxisTicks: [],
        yAxisTicks: items.map((item, position) => ({coordinate: position * ROW_HEIGHT_PIXELS})),
        stackedData: null,
        displayedData: items,
        offset: {left: 0, top: 0, width: PLOT_WIDTH_PIXELS, height: items.length * ROW_HEIGHT_PIXELS},
        cells: undefined,
        parentViewBox: undefined,
        dataStartIndex: 0,
    });
}

/** Lo que pinta LabelList: data.map((entry, index) => valueAccessor(entry, index)). */
function paintedLabelsOf(items, minPointSize) {
    return barRectanglesOf(items, minPointSize).map((barEntry) => barLabelValueOf(barEntry));
}

test('una barra en 0 en medio no corre el detalle de las de abajo (rechazos de enero)', () => {
    // Producto A 13 rechazados · 120 conformes; Producto B 0 · 0; Producto C 300 · 120; Producto D 0 · 420
    const items = [
        {key: 'PRODUCT_A', label: 'Producto A', value: 13, detail: '120 conformes'},
        {key: 'PRODUCT_B', label: 'Producto B', value: 0, detail: '0 conformes · 240 sin validar'},
        {key: 'PRODUCT_C', label: 'Producto C', value: 300, detail: '120 conformes'},
        {key: 'PRODUCT_D', label: 'Producto D', value: 0, detail: '420 conformes'},
    ];

    // así lo hacía Recharts con minPointSize 0: solo 2 barras y la 2.ª con index 1, que en items es el Producto B
    const rectanglesWithoutMinimum = barRectanglesOf(items, 0);
    assert.equal(rectanglesWithoutMinimum.length, 2);
    assert.equal(items[1].detail, '0 conformes · 240 sin validar');
    // aun sin ancho mínimo, leer del renglón da el detalle correcto
    assert.deepEqual(rectanglesWithoutMinimum.map((barEntry) => barLabelValueOf(barEntry).detail), ['120 conformes', '120 conformes']);

    // con el ancho mínimo de BarList las 4 barras llevan su propio número y detalle
    assert.deepEqual(paintedLabelsOf(items, BAR_MIN_POINT_SIZE), items.map((item) => ({value: item.value, detail: item.detail})));
});

test('con todas las barras en 0 cada producto sigue diciendo «0 de 2»', () => {
    // a principio de mes: ningún periodo procesado todavía
    const items = ['PRODUCT_A', 'PRODUCT_B', 'PRODUCT_C', 'PRODUCT_D'].map((key) => ({key, label: key, value: 0, detail: 'de 2'}));

    assert.equal(barRectanglesOf(items, 0).length, 0);
    assert.deepEqual(paintedLabelsOf(items, BAR_MIN_POINT_SIZE), items.map(() => ({value: 0, detail: 'de 2'})));
});
