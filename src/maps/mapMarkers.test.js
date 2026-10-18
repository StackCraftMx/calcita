// Pruebas de lo puro de los marcadores del mapa: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {MAP_PIN_SIZE, boundsOfMarkers, mapPinHtmlOf} from '@/maps/mapMarkers.js';

test('el recuadro encierra a todos los marcadores; sin marcadores no hay recuadro', () => {
    const markers = [{position: [20.67, -103.35]}, {position: [25.68, -100.31]}, {position: [19.43, -99.13]}];
    assert.deepEqual(boundsOfMarkers(markers), [[19.43, -103.35], [25.68, -99.13]]);
    assert.equal(boundsOfMarkers([]), null);
});

test('el alfiler lleva el color pedido y el elegido es más grande', () => {
    const pin = mapPinHtmlOf('var(--mui-palette-primary-main)');
    assert.match(pin, /style="fill:var\(--mui-palette-primary-main\)"/);
    assert.match(pin, new RegExp(`width="${MAP_PIN_SIZE.normal}"`));
    assert.match(mapPinHtmlOf('red', true), new RegExp(`width="${MAP_PIN_SIZE.selected}"`));
});
