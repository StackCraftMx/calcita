// Pruebas de cómo se juntan los textos de los módulos. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {combineTexts} from '@/toolkit/combineTexts.js';

test('junta los textos por idioma y suma las llaves de un namespace compartido', () => {
    const ordersTexts = {es: {orders: {title: 'Pedidos'}, dictionaries: {orderStatus: {}}}, en: {orders: {title: 'Orders'}}};
    const customersTexts = {es: {customers: {title: 'Clientes'}, dictionaries: {customerType: {}}}};

    const combined = combineTexts([ordersTexts, customersTexts]);

    assert.deepEqual(Object.keys(combined.es).sort(), ['customers', 'dictionaries', 'orders']);
    assert.deepEqual(Object.keys(combined.es.dictionaries).sort(), ['customerType', 'orderStatus']);
    assert.equal(combined.en.orders.title, 'Orders');
});

test('los objetos de adentro se suman: los mensajes propios de dos módulos en validation.fields', () => {
    const clients = {es: {validation: {fields: {rfc: {rfc: 'Revise el RFC'}}}}};
    const billing = {es: {validation: {fields: {postal_code: {postalCode: 'Lleva 5 dígitos'}}}}};
    const combined = combineTexts([clients, billing]);
    assert.deepEqual(Object.keys(combined.es.validation.fields).sort(), ['postal_code', 'rfc']);
});

test('un texto repetido entre módulos truena en vez de pisarse, y dice cuál y en qué idioma', () => {
    const first = {es: {dictionaries: {orderStatus: {pending: {label: 'Pendiente'}}}}};
    const second = {es: {dictionaries: {orderStatus: {pending: {label: 'Por pagar'}}}}};
    assert.throws(() => combineTexts([first, second]), /«dictionaries:orderStatus\.pending\.label» en «es»/);
});
