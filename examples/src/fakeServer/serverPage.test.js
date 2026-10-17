// Pruebas de lo que el servidor de mentira hace con la consulta de ServerTable. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Money} from '@stackcraftmx/calcita/money';

import {containsText, serverPageOf} from '@/fakeServer/serverPage.js';

// cinco pedidos inventados, suficientes para ver filtro, faceta, orden y página
const ROWS = [
    {id: 1, customer_name: 'Ana López', status: 'pending', total: 300},
    {id: 2, customer_name: 'Bruno Díaz', status: 'paid', total: 100},
    {id: 3, customer_name: 'Ana Ruiz', status: 'paid', total: 500},
    {id: 4, customer_name: 'Carla Peña', status: 'delivered', total: 200},
    {id: 5, customer_name: 'Ana Gómez', status: 'delivered', total: 400},
];

const RULES = {
    filterRules: {
        customer_name: (row, value) => containsText(row.customer_name, value),
        status: (row, values) => values.includes(row.status),
    },
    facetFields: ['status'],
    defaultSort: {column: 'id', direction: 'asc'},
};

test('«contiene» no distingue mayúsculas ni acentos', () => {
    assert.equal(containsText('Ana López', 'LOPEZ'), true);
    assert.equal(containsText('Bruno Díaz', 'diaz '), true);
    assert.equal(containsText('Bruno Díaz', 'ana'), false);
});

test('filtra, regresa el total de todo lo filtrado y corta la página', () => {
    const page = serverPageOf(ROWS, {filters: {customer_name: 'ana'}, page: 1, pageSize: 2}, RULES);

    assert.equal(page.total, 3);
    assert.deepEqual(page.rows.map((row) => row.id), [5]);
});

test('la faceta de un campo se cuenta sin su propio filtro, para poder elegir varios valores', () => {
    const page = serverPageOf(ROWS, {filters: {customer_name: 'ana', status: ['paid']}}, RULES);

    assert.equal(page.total, 1);
    // con «ana» hay un pendiente, un pagado y un entregado, aunque el filtro de estado deje solo el pagado
    assert.deepEqual(page.facets.status, [
        {value: 'delivered', total: 1},
        {value: 'paid', total: 1},
        {value: 'pending', total: 1},
    ]);
});

test('ordena por la columna que se pidió y, sin orden, por el del servidor', () => {
    const byTotal = serverPageOf(ROWS, {sortOrders: [{column: 'total', direction: 'desc'}]}, RULES);
    const byDefault = serverPageOf(ROWS, {}, RULES);

    assert.deepEqual(byTotal.rows.map((row) => row.total), [500, 400, 300, 200, 100]);
    assert.deepEqual(byDefault.rows.map((row) => row.id), [1, 2, 3, 4, 5]);
});

test('un importe en texto se ordena por su valor y no como texto', () => {
    const rows = [{id: 1, total: '2450.00'}, {id: 2, total: '10000.00'}, {id: 3, total: '899.45'}];
    const centsOf = (row) => Money.fromString(row.total, {currency: 'MXN'}).minorUnits;
    const rules = {filterRules: {}, sortValues: {total: centsOf}, defaultSort: {column: 'id', direction: 'asc'}};

    const page = serverPageOf(rows, {sortOrders: [{column: 'total', direction: 'asc'}]}, rules);

    assert.deepEqual(page.rows.map((row) => row.id), [3, 1, 2]);
});

test('un filtro vacío no filtra y uno sin regla truena en vez de ignorarse', () => {
    assert.equal(serverPageOf(ROWS, {filters: {customer_name: '', status: []}}, RULES).total, 5);
    assert.throws(() => serverPageOf(ROWS, {filters: {product_name: 'silla'}}, RULES), /product_name/);
});
