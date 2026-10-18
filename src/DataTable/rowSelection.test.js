import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
    EMPTY_ROW_SELECTION, canSelectAllMatching, checkedIdsOf, rowSelectionOf, selectionAfterCheck,
} from '@/DataTable/rowSelection.js';

const pageOne = new Map([[1, {id: 1, number: 'P-1'}], [2, {id: 2, number: 'P-2'}]]);
const pageTwo = new Map([[3, {id: 3, number: 'P-3'}], [4, {id: 4, number: 'P-4'}]]);
const filters = {status: ['pending']};

test('al cambiar de página se conservan los elegidos de la anterior, con su renglón', () => {
    const afterPageOne = selectionAfterCheck(EMPTY_ROW_SELECTION, new Set([1]), pageOne, [1, 2]);
    // en la página 2 el DataGrid trae marcado el 1 (keepNonExistentRowsSelected) y el 3 que se acaba de picar
    const afterPageTwo = selectionAfterCheck(afterPageOne, new Set([1, 3]), pageTwo, [3, 4]);

    assert.deepEqual(rowSelectionOf(afterPageTwo, {total: 4, filters}), {
        ids: [1, 3], rows: [{id: 1, number: 'P-1'}, {id: 3, number: 'P-3'}], count: 2, isAllMatching: false, isCapped: false, filters,
    });
});

test('con «todos los que coinciden» la acción recibe los filtros y ninguna lista de ids', () => {
    const allMatching = {rowsById: new Map(), isAllMatching: true};

    assert.deepEqual(rowSelectionOf(allMatching, {total: 1382, filters}), {
        ids: [], rows: [], count: 1382, isAllMatching: true, isCapped: false, filters,
    });
    assert.equal(rowSelectionOf(allMatching, {total: 10000, capped: true, filters}).isCapped, true);
});

test('con «todos los que coinciden» se ven marcados los de la página; desmarcar uno deja los demás de la página', () => {
    const allMatching = {rowsById: new Map(), isAllMatching: true};

    assert.deepEqual([...checkedIdsOf(allMatching, [3, 4])], [3, 4]);
    assert.equal(selectionAfterCheck(allMatching, new Set([3, 4]), pageTwo, [3, 4]), allMatching);
    const afterUncheck = selectionAfterCheck(allMatching, new Set([4]), pageTwo, [3, 4]);
    assert.equal(afterUncheck.isAllMatching, false);
    assert.deepEqual([...afterUncheck.rowsById.keys()], [4]);
});

test('«Elegir los N que coinciden» se ofrece solo con la página completa y más renglones que esos', () => {
    const wholePage = selectionAfterCheck(EMPTY_ROW_SELECTION, new Set([1, 2]), pageOne, [1, 2]);
    const halfPage = selectionAfterCheck(EMPTY_ROW_SELECTION, new Set([1]), pageOne, [1, 2]);

    assert.equal(canSelectAllMatching(wholePage, [1, 2], {total: 57}), true);
    assert.equal(canSelectAllMatching(wholePage, [1, 2], {total: 2}), false);
    assert.equal(canSelectAllMatching(halfPage, [1, 2], {total: 57}), false);
    // con el total topado siempre puede haber más
    assert.equal(canSelectAllMatching(wholePage, [1, 2], {total: 2, capped: true}), true);
    assert.equal(canSelectAllMatching(wholePage, [], {total: 57}), false);
});

test('la casilla de arriba (toda la página de un golpe) elige todos los que coinciden; uno por uno, no', () => {
    const options = {allMatchingOnWholePage: true, total: 57};
    const atOnce = selectionAfterCheck(EMPTY_ROW_SELECTION, new Set([1, 2]), pageOne, [1, 2], options);
    assert.equal(atOnce.isAllMatching, true);

    const firstOne = selectionAfterCheck(EMPTY_ROW_SELECTION, new Set([1]), pageOne, [1, 2], options);
    const oneByOne = selectionAfterCheck(firstOne, new Set([1, 2]), pageOne, [1, 2], options);
    assert.equal(oneByOne.isAllMatching, false);
    assert.equal(canSelectAllMatching(oneByOne, [1, 2], {total: 57}), true);

    // apagado (allowSelectAllMatching={false}) o sin más renglones que los de la página: se quedan los picados
    assert.equal(selectionAfterCheck(EMPTY_ROW_SELECTION, new Set([1, 2]), pageOne, [1, 2], {total: 57}).isAllMatching, false);
    assert.equal(selectionAfterCheck(EMPTY_ROW_SELECTION, new Set([1, 2]), pageOne, [1, 2], {allMatchingOnWholePage: true, total: 2}).isAllMatching, false);
    // con el total topado siempre hay más
    assert.equal(selectionAfterCheck(EMPTY_ROW_SELECTION, new Set([1, 2]), pageOne, [1, 2], {allMatchingOnWholePage: true, total: 2, capped: true}).isAllMatching, true);
});
