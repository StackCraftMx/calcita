// Pruebas de qué archivo se acepta. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {FILE_REJECTION, matchesAccept, parseFileSize, resolveAccept, screenFiles} from '@/upload/fileRules.js';

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

test('al elegir varios: pasan los que cumplen y cada rechazo lleva su motivo', () => {
    const rules = {resolvedAccept: resolveAccept(['pdf', 'image']), maxBytes: 1000, maxFiles: 3, maxTotalBytes: 1500};
    const {files, accepted, rejected} = screenFiles([
        {name: 'factura.pdf', type: 'application/pdf', size: 600},
        {name: 'pagos.xlsx', type: '', size: 100},
        {name: 'plano.png', type: 'image/png', size: 1200},
        {name: 'foto.jpg', type: 'image/jpeg', size: 800},
        {name: 'recibo.pdf', type: 'application/pdf', size: 700},
    ], {...rules, keptFiles: [{name: 'contrato.pdf', size: 300}]});

    assert.deepEqual(accepted.map((file) => file.name), ['factura.pdf']);
    assert.deepEqual(files.map((file) => file.name), ['contrato.pdf', 'factura.pdf']);
    assert.deepEqual(rejected.map(({file, reason}) => [file.name, reason]), [
        ['pagos.xlsx', FILE_REJECTION.type],
        ['plano.png', FILE_REJECTION.size],
        // 300 + 600 + 800 pasa de 1500
        ['foto.jpg', FILE_REJECTION.total],
        ['recibo.pdf', FILE_REJECTION.total],
    ]);
});

test('el mismo nombre reemplaza al que ya estaba y no cuenta doble', () => {
    const {files, rejected} = screenFiles([{name: 'contrato.pdf', size: 900}], {maxFiles: 2, maxTotalBytes: 1000, keptFiles: [
        {name: 'contrato.pdf', size: 900}, {name: 'anexo.pdf', size: 100},
    ]});
    assert.deepEqual(rejected, []);
    assert.deepEqual(files.map((file) => [file.name, file.size]), [['anexo.pdf', 100], ['contrato.pdf', 900]]);
});

test('la cantidad se cuenta con los que ya estaban', () => {
    const {accepted, rejected} = screenFiles([{name: 'b.pdf', size: 1}, {name: 'c.pdf', size: 1}], {maxFiles: 2, keptFiles: [{name: 'a.pdf'}]});
    assert.deepEqual(accepted.map((file) => file.name), ['b.pdf']);
    assert.deepEqual(rejected.map(({reason}) => reason), [FILE_REJECTION.count]);
});
