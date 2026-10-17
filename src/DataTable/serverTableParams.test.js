// Pruebas del traductor de la tabla de servidor a la query del API. Sin navegador: npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {toServerTableParams} from '@/DataTable/serverTableParams.js';

test('la página viaja desde 1 y el orden como sort y direction', () => {
    // la tabla está en su página 0 ordenada por nombre ascendente
    assert.deepEqual(
        toServerTableParams({filters: {}, sortOrders: [{column: 'name', direction: 'asc'}], page: 0, pageSize: 25}),
        {page: 1, page_size: 25, sort: 'name', direction: 'asc'},
    );
});

test('los filtros vacíos no viajan y los múltiples van como arreglo con su nombre del API', () => {
    // búsqueda vacía, estado con dos valores y organización renombrada al parámetro del API
    assert.deepEqual(
        toServerTableParams(
            {filters: {search: '', status: ['active', 'blocked'], organization: ['3'], profile: []}, sortOrders: [], page: 2, pageSize: 10},
            {parameterNames: {organization: 'organization_id'}},
        ),
        {page: 3, page_size: 10, status: ['active', 'blocked'], organization_id: ['3']},
    );
});
