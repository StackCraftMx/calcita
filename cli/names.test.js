import assert from 'node:assert/strict';
import {test} from 'node:test';

import {isValidName, namesOf, withoutSuffixWord, wordsOf} from './names.js';

test('las formas del nombre salen iguales sin importar cómo se escribió', () => {
    const expected = {camel: 'purchaseOrders', pascal: 'PurchaseOrders', kebab: 'purchase-orders', constant: 'PURCHASE_ORDERS', human: 'Purchase orders'};
    assert.deepEqual(namesOf('purchase-orders'), expected);
    assert.deepEqual(namesOf('PurchaseOrders'), expected);
    assert.deepEqual(namesOf('purchase orders'), expected);
    assert.deepEqual(namesOf('purchase_orders'), expected);
});

test('las siglas y los números se quedan en su palabra', () => {
    assert.deepEqual(wordsOf('PDFReports2'), ['pdf', 'reports2']);
    assert.equal(namesOf('contacts').pascal, 'Contacts');
});

test('solo letras sin acentos, números, espacios y guiones, empezando con letra', () => {
    assert.equal(isValidName('contacts'), true);
    assert.equal(isValidName('purchase-orders'), true);
    assert.equal(isValidName('órdenes'), false);
    assert.equal(isValidName('2orders'), false);
    assert.equal(isValidName('../orders'), false);
    assert.equal(isValidName(''), false);
});

test('quita la palabra que el CLI ya agrega al final', () => {
    assert.equal(namesOf(withoutSuffixWord('OrderDetailPage', 'page')).pascal, 'OrderDetail');
    assert.equal(namesOf(withoutSuffixWord('OrderDetail', 'page')).pascal, 'OrderDetail');
    // una sola palabra se queda: «Page» solo sería un nombre vacío
    assert.equal(withoutSuffixWord('Page', 'page'), 'Page');
});
