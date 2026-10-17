// Pruebas de cómo se juntan los textos de los módulos. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {combineTexts} from '@/app/combineTexts.js';

test('junta los textos por idioma y suma las llaves de un namespace compartido', () => {
    const ordersTexts = {es: {orders: {title: 'Pedidos'}, dictionaries: {orderStatus: {}}}, en: {orders: {title: 'Orders'}}};
    const customersTexts = {es: {customers: {title: 'Clientes'}, dictionaries: {customerType: {}}}};

    const combined = combineTexts([ordersTexts, customersTexts]);

    assert.deepEqual(Object.keys(combined.es).sort(), ['customers', 'dictionaries', 'orders']);
    assert.deepEqual(Object.keys(combined.es.dictionaries).sort(), ['customerType', 'orderStatus']);
    assert.equal(combined.en.orders.title, 'Orders');
});

test('una llave repetida entre módulos truena en vez de pisarse', () => {
    const first = {es: {dictionaries: {orderStatus: {}}}};
    const second = {es: {dictionaries: {orderStatus: {}}}};

    assert.throws(() => combineTexts([first, second]), /dictionaries:orderStatus/);
});
