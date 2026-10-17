// Pruebas del cambio de conjunto de una tabla (otro producto en una lista). Sin navegador: npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {filtersForDatasetSwitch} from '@/DataTable/useTableState.js';

const LOADS_FILTER_DEFAULTS = {product: '', year: '', status: [], format: []};

test('al cambiar de producto no sobreviven el año, el estado ni el formato del producto anterior', () => {
    // en Playeras se había elegido 2025, pedidos Completos y archivos CSV; se pasa a Zapatos
    const filtersAfterSwitch = filtersForDatasetSwitch(LOADS_FILTER_DEFAULTS, {product: 'SHOES'});

    assert.deepEqual(filtersAfterSwitch, {product: 'SHOES', year: '', status: [], format: []});
});

test('los defaults no se modifican al cambiar de conjunto', () => {
    // el objeto de defaults es constante de módulo y lo comparten la página y ServerTable
    filtersForDatasetSwitch(LOADS_FILTER_DEFAULTS, {product: 'SHIRTS'});

    assert.deepEqual(LOADS_FILTER_DEFAULTS, {product: '', year: '', status: [], format: []});
});
