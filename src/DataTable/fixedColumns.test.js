// Pruebas de dónde se pega cada columna fija. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {fixedColumnOffsetsOf, fixedFieldsOf} from '@/DataTable/fixedColumns.js';

test('una columna fija sola o una lista quedan como lista; sin nada, vacía', () => {
    assert.deepEqual(fixedFieldsOf('number'), ['number']);
    assert.deepEqual(fixedFieldsOf(['actions', 'company']), ['actions', 'company']);
    assert.deepEqual(fixedFieldsOf(null), []);
    assert.deepEqual(fixedFieldsOf(undefined), []);
});

test('cada columna fija se corre lo que miden las de antes, después de la casilla de elegir', () => {
    const columns = [{field: 'actions', width: 56}, {field: 'company', flex: 1.5, minWidth: 205}, {field: 'rfc', width: 168}];
    assert.deepEqual(fixedColumnOffsetsOf(['actions', 'company'], columns), [
        {field: 'actions', left: 0, isLast: false, hasUnknownWidth: false},
        {field: 'company', left: 56, isLast: true, hasUnknownWidth: false},
    ]);
    assert.deepEqual(fixedColumnOffsetsOf(['actions', 'company'], columns, {startLeft: 50}).map(({left}) => left), [50, 106]);
});

test('una fija que no es la última y no trae ancho fijo se marca: la siguiente podría encimarse', () => {
    const columns = [{field: 'company', flex: 1, minWidth: 180}, {field: 'rfc', width: 168}];
    const [company, rfc] = fixedColumnOffsetsOf(['company', 'rfc'], columns);
    assert.equal(company.hasUnknownWidth, true);
    // se corre lo que diga su minWidth
    assert.equal(rfc.left, 180);
    // sin minWidth, el ancho de siempre del DataGrid
    assert.equal(fixedColumnOffsetsOf(['a', 'b'], [{field: 'a'}, {field: 'b'}])[1].left, 100);
});
