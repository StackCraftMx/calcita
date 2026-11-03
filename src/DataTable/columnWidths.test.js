// Pruebas del ancho de una columna de estatus. Sin navegador (por letras): pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {statusColumnWidthOf, textWidthOf} from '@/DataTable/columnWidths.js';

test('sin navegador el texto se mide por letras', () => {
    assert.equal(Math.round(textWidthOf('Pagado')), Math.round(6 * 7.4));
});

test('la columna alcanza para la etiqueta más larga y su punto; con chip, un poco más', () => {
    const labels = ['Estado', 'Pagado', 'Registrado pendiente de documentar'];
    const dot = statusColumnWidthOf(labels);
    const chip = statusColumnWidthOf(labels, {variant: 'chip'});
    assert.ok(dot >= Math.ceil(textWidthOf('Registrado pendiente de documentar') + 40));
    assert.ok(chip > dot);
});

test('con etiquetas cortas manda el encabezado con sus íconos', () => {
    assert.equal(statusColumnWidthOf(['Estado del registro', 'Sí', 'No']), Math.ceil(textWidthOf('Estado del registro', {fontWeight: 600}) + 56));
});
