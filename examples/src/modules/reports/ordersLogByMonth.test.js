// Pruebas de la bitácora por mes: el lote que cuenta como una sola descarga del panel. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {downloadOrdersLogByMonth, joinedCsvOf} from '@/modules/reports/ordersLogByMonth.js';

const BYTE_ORDER_MARK = '﻿';

/** La petición de un mes, como la del servidor: un CSV con sus encabezados que avisa su avance en dos pedazos. */
async function downloadMonthLikeServer(month, {onDownloadProgress}) {
    const blob = new Blob([`${BYTE_ORDER_MARK}Pedido,Mes\r\nP-${month},${month}\r\n`]);
    onDownloadProgress({loaded: Math.round(blob.size / 2), total: blob.size});
    onDownloadProgress({loaded: blob.size, total: blob.size});
    return {blob};
}

test('los CSV se juntan con un solo renglón de encabezados', () => {
    const joined = joinedCsvOf([
        `${BYTE_ORDER_MARK}Pedido,Cliente\r\nP-1,Ana\r\n`,
        `${BYTE_ORDER_MARK}Pedido,Cliente\r\nP-2,Luis\r\nP-3,Irene\r\n`,
    ]);
    assert.equal(joined, `${BYTE_ORDER_MARK}Pedido,Cliente\r\nP-1,Ana\r\nP-2,Luis\r\nP-3,Irene\r\n`);
});

test('el archivo junto lleva la marca de UTF-8 aunque al leerlos se haya perdido', () => {
    // blob.text() la quita: así llegan los textos de la bitácora de cada mes
    const joined = joinedCsvOf(['Pedido,Cliente\r\nP-1,Peña\r\n', 'Pedido,Cliente\r\nP-2,Ángel\r\n']);
    assert.equal(joined, `${BYTE_ORDER_MARK}Pedido,Cliente\r\nP-1,Peña\r\nP-2,Ángel\r\n`);
});

test('el lote dice en qué mes va, suma el avance y entrega un solo archivo', async () => {
    // Escenario: dos meses de la bitácora, como los pediría la pantalla de Reportes.
    // Esperado: un rótulo por mes en orden, el avance nunca regresa y el archivo trae los encabezados una vez.
    const labels = [];
    const loadedBytes = [];
    const {blob, fileName} = await downloadOrdersLogByMonth(
        {
            months: ['2026-02', '2026-03'], downloadMonth: downloadMonthLikeServer,
            labelOf: (month, position, total) => `${position} de ${total}: ${month}`, fileName: 'bitacora.csv',
        },
        {
            signal: new AbortController().signal,
            onDownloadProgress: ({loaded, total}) => {
                loadedBytes.push(loaded);
                assert.equal(total, null);
            },
            onLabelChange: (label) => labels.push(label),
        },
    );

    assert.deepEqual(labels, ['1 de 2: 2026-02', '2 de 2: 2026-03']);
    assert.ok(loadedBytes.every((loaded, index) => index === 0 || loaded >= loadedBytes[index - 1]));
    assert.equal(fileName, 'bitacora.csv');
    // blob.text() no enseña la marca de UTF-8: se revisa en los bytes (EF BB BF) y el texto aparte
    assert.equal(await blob.text(), 'Pedido,Mes\r\nP-2026-02,2026-02\r\nP-2026-03,2026-03\r\n');
    assert.deepEqual([...new Uint8Array(await blob.arrayBuffer()).slice(0, 3)], [0xEF, 0xBB, 0xBF]);
    // lo último que avisa es la suma de los dos meses, en bytes de lo que bajó (no del archivo ya junto)
    assert.equal(loadedBytes.at(-1), 2 * new Blob([`${BYTE_ORDER_MARK}Pedido,Mes\r\nP-2026-02,2026-02\r\n`]).size);
});
