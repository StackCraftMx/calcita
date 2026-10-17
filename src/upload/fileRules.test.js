// Pruebas de qué archivo se acepta. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {matchesAccept, parseFileSize, resolveAccept} from '@/upload/fileRules.js';

test('el accept acepta nombres del menú, listas y lo de siempre del input, mezclados', () => {
    assert.equal(resolveAccept('excel'), '.xlsx,.xls');
    assert.equal(resolveAccept(['excel', 'pdf']), '.xlsx,.xls,.pdf');
    assert.equal(resolveAccept(['Excel', '.dat']), '.xlsx,.xls,.dat');
    assert.equal(resolveAccept('image/*'), 'image/*');
    assert.equal(resolveAccept(undefined), undefined);
});

test('un archivo pasa por su extensión, por su tipo exacto o por su familia', () => {
    const excel = resolveAccept('excel');
    assert.equal(matchesAccept({name: 'Pagos Octubre.XLSX', type: ''}, excel), true);
    assert.equal(matchesAccept({name: 'pagos.csv', type: 'text/csv'}, excel), false);
    assert.equal(matchesAccept({name: 'foto.png', type: 'image/png'}, resolveAccept(['pdf', 'image'])), true);
    assert.equal(matchesAccept({name: 'contrato', type: 'application/pdf'}, 'application/pdf'), true);
    // sin accept se acepta todo
    assert.equal(matchesAccept({name: 'cualquiera.bin', type: ''}, undefined), true);
});

test('el peso se escribe con unidades en base 1000, como lo pinta el navegador', () => {
    assert.equal(parseFileSize('10 MB'), 10_000_000);
    assert.equal(parseFileSize('500kb'), 500_000);
    assert.equal(parseFileSize('1.5 GB'), 1_500_000_000);
    assert.equal(parseFileSize(2048), 2048);
    assert.equal(parseFileSize(undefined), null);
    assert.throws(() => parseFileSize('diez megas'), /no es un tamaño/);
});
