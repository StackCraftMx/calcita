// Pruebas de las movidas del tablero kanban: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {cardsOfColumn, isOverLimit, moveCard} from '@/kanban/kanbanMoves.js';

const CARDS = [
    {id: 'a', columnId: 'todo'}, {id: 'b', columnId: 'todo'}, {id: 'c', columnId: 'doing'}, {id: 'd', columnId: 'done'},
];
const idsOf = (cards, columnId) => cardsOfColumn(cards, columnId).map((card) => card.id);

test('a otra columna, en medio: queda antes de la que ocupaba ese lugar', () => {
    const moved = moveCard(CARDS, {cardId: 'a', toColumnId: 'doing', toIndex: 0});
    assert.deepEqual(idsOf(moved, 'doing'), ['a', 'c']);
    assert.deepEqual(idsOf(moved, 'todo'), ['b']);
});

test('a otra columna, al final', () => {
    const moved = moveCard(CARDS, {cardId: 'b', toColumnId: 'done', toIndex: 1});
    assert.deepEqual(idsOf(moved, 'done'), ['d', 'b']);
});

test('dentro de su columna, a otro lugar', () => {
    const moved = moveCard(CARDS, {cardId: 'a', toColumnId: 'todo', toIndex: 1});
    assert.deepEqual(idsOf(moved, 'todo'), ['b', 'a']);
});

test('a una columna vacía', () => {
    const moved = moveCard(CARDS, {cardId: 'c', toColumnId: 'review', toIndex: 0});
    assert.deepEqual(idsOf(moved, 'review'), ['c']);
    assert.deepEqual(idsOf(moved, 'doing'), []);
});

test('el arreglo de entrada no se toca y una tarjeta que no existe no mueve nada', () => {
    moveCard(CARDS, {cardId: 'a', toColumnId: 'done', toIndex: 0});
    assert.equal(CARDS[0].columnId, 'todo');
    assert.equal(moveCard(CARDS, {cardId: 'z', toColumnId: 'done', toIndex: 0}), CARDS);
});

test('el tope de la columna: pasarlo cuenta; sin tope, nunca', () => {
    assert.equal(isOverLimit({limit: 2}, 3), true);
    assert.equal(isOverLimit({limit: 2}, 2), false);
    assert.equal(isOverLimit({}, 50), false);
});
