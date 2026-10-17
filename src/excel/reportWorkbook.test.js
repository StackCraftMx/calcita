// Pruebas del armador del reporte en Excel y CSV, con un reporte inventado (pedidos de una tienda). Sin navegador: npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import ExcelJS from 'exceljs';

import {
    DEFAULT_REPORT_STYLE, SHEET_ROW_KIND, VALUE_FORMAT, excelColorOf, fileNameSlugOf, reportCsvOf, reportDataTableOf, reportSheetOf,
    reportWorkbookOf,
} from '@/excel/reportWorkbook.js';

const EXCEL_TEXTS = {summarySheetName: 'Resumen', dataSheetName: 'Datos', title: 'Tienda · Pedidos', subtitle: 'Enero y febrero'};

// dos meses con sus Totales; la tasa de devolución se recalcula en el total (no es la suma)
const REPORT = {
    conceptLabel: 'Concepto',
    howColumnLabel: 'Cómo salen los totales',
    periodLabels: ['Enero', 'Febrero'],
    totalsLabel: 'Totales',
    dataLabels: {section: 'Sección', period: 'Periodo'},
    sections: [
        {
            label: 'Pedidos',
            rows: [
                {label: 'Pedidos recibidos', howLabel: 'suma', format: VALUE_FORMAT.count, values: [1200, 1300, 2500]},
                {label: 'Pedidos devueltos', howLabel: 'suma', format: VALUE_FORMAT.count, values: [60, 70, 130]},
                {label: 'Devolución', howLabel: 'se recalcula', format: VALUE_FORMAT.percent, isTotal: true, values: [5, 5.38, 5.2]},
            ],
        },
        {
            label: 'Ventas',
            rows: [{label: 'Importe vendido', howLabel: 'suma', format: VALUE_FORMAT.money, values: ['150000.50', null, '150000.50']}],
        },
    ],
};

test('la hoja trae el encabezado y una sección seguida de sus conceptos con una cifra por periodo y su total', () => {
    const sheet = reportSheetOf(REPORT);

    assert.deepEqual(sheet.header, ['Concepto', 'Cómo salen los totales', 'Enero', 'Febrero', 'Totales']);
    assert.deepEqual(sheet.rows[0], {kind: SHEET_ROW_KIND.section, label: 'Pedidos'});
    assert.deepEqual(sheet.rows[1].values, [1200, 1300, 2500]);
    assert.equal(sheet.rows[1].sectionLabel, 'Pedidos');
});

test('los Datos voltean la tabla: un renglón por periodo, y el último son los Totales', () => {
    const {concepts, periodRows} = reportDataTableOf(reportSheetOf(REPORT));

    assert.equal(concepts.length, 4);
    assert.deepEqual(periodRows.map((periodRow) => [periodRow.period, periodRow.isTotals]), [['Enero', false], ['Febrero', false], ['Totales', true]]);
    assert.deepEqual(periodRows[2].values, [2500, 130, 5.2, '150000.50']);
});

test('el CSV va como los Datos: sección, concepto y cómo sale arriba, con la marca de UTF-8 y las comas entre comillas', () => {
    const csvLines = reportCsvOf(reportSheetOf(REPORT)).split('\r\n');

    assert.equal(csvLines[0], '﻿Sección,Pedidos,Pedidos,Pedidos,Ventas');
    assert.equal(csvLines[1], 'Concepto,Pedidos recibidos,Pedidos devueltos,Devolución,Importe vendido');
    assert.equal(csvLines[2], 'Periodo,suma,suma,se recalcula,suma');
    // la cifra que no aplica sale con la raya, nunca con 0
    assert.equal(csvLines[4], 'Febrero,1300,70,5.38%,—');
    const quoted = reportCsvOf(reportSheetOf({...REPORT, dataLabels: {section: 'Sección, grupo', period: 'Dice "hola"'}})).split('\r\n');
    assert.equal(quoted[0].startsWith('﻿"Sección, grupo",'), true);
    assert.equal(quoted[2].startsWith('"Dice ""hola""",'), true);
});

test('el Resumen lleva el título, el encabezado del color principal, cada cifra con su formato y los Totales con su fondo', () => {
    const worksheet = reportWorkbookOf(ExcelJS, reportSheetOf(REPORT), EXCEL_TEXTS).getWorksheet('Resumen');

    assert.equal(worksheet.getCell('A1').value, 'Tienda · Pedidos');
    assert.equal(worksheet.getCell('A4').fill.fgColor.argb, DEFAULT_REPORT_STYLE.brandColor);
    assert.deepEqual(worksheet.views[0], {state: 'frozen', xSplit: 2, ySplit: 4});
    // renglón 5: la sección; 6 a 8: sus conceptos
    assert.equal(worksheet.getCell('A5').value, 'Pedidos');
    assert.equal(worksheet.getCell('C6').numFmt, '#,##0');
    assert.equal(worksheet.getCell('E8').value, 0.052);
    assert.equal(worksheet.getCell('E8').numFmt, '0%');
    assert.equal(worksheet.getCell('E6').fill.fgColor.argb, DEFAULT_REPORT_STYLE.totalsFill);
    assert.equal(worksheet.getCell('D10').value, '—');
});

test('cada proyecto pasa sus colores y el formato de su moneda', () => {
    const style = {brandColor: excelColorOf('#017f31'), numberFormats: {[VALUE_FORMAT.money]: '"€"#,##0.00'}};
    const worksheet = reportWorkbookOf(ExcelJS, reportSheetOf(REPORT), {...EXCEL_TEXTS, style}).getWorksheet('Resumen');

    assert.equal(worksheet.getCell('A4').fill.fgColor.argb, 'FF017F31');
    assert.equal(worksheet.getCell('C10').numFmt, '"€"#,##0.00');
    // lo que no se pasó se queda como estaba
    assert.equal(worksheet.getCell('C6').numFmt, '#,##0');
    assert.throws(() => excelColorOf('verde'), /#rrggbb/);
});

test('los Datos llevan la sección una sola vez a lo ancho de sus conceptos y los filtros en el último renglón del encabezado', () => {
    const worksheet = reportWorkbookOf(ExcelJS, reportSheetOf(REPORT), EXCEL_TEXTS).getWorksheet('Datos');

    assert.equal(worksheet.getCell('B1').isMerged, true);
    assert.equal(worksheet.getCell('D1').master.address, 'B1');
    assert.deepEqual(worksheet.autoFilter, {from: {row: 3, column: 1}, to: {row: 6, column: 5}});
    const totalsRow = worksheet.getRow(6);
    assert.equal(totalsRow.getCell(1).value, 'Totales');
    assert.equal(totalsRow.getCell(2).fill.fgColor.argb, DEFAULT_REPORT_STYLE.totalsFill);
    assert.equal(totalsRow.font.bold, true);
});

test('un reporte sin Totales ni cómo sale: solo Concepto y los periodos, y los Datos con dos renglones de encabezado', () => {
    const singlePeriod = {
        ...REPORT, howColumnLabel: undefined, totalsLabel: undefined, periodLabels: ['Total de la semana (semana 3 · enero 2027)'],
        sections: [{label: 'Pedidos', rows: [{label: 'Pedidos recibidos', format: VALUE_FORMAT.count, values: [300]}]}],
    };
    const sheet = reportSheetOf(singlePeriod);
    const workbook = reportWorkbookOf(ExcelJS, sheet, EXCEL_TEXTS);
    const summaryWorksheet = workbook.getWorksheet('Resumen');
    const dataWorksheet = workbook.getWorksheet('Datos');

    assert.deepEqual(sheet.header, ['Concepto', 'Total de la semana (semana 3 · enero 2027)']);
    assert.equal(summaryWorksheet.views[0].xSplit, 1);
    assert.equal(summaryWorksheet.getCell('B6').fill, undefined);
    // la columna se ensancha para que su título quepa en las dos líneas del encabezado
    assert.ok(summaryWorksheet.getColumn(2).width >= sheet.header[1].length / 2);
    assert.equal(dataWorksheet.getCell('A2').value, 'Periodo');
    assert.deepEqual(dataWorksheet.autoFilter.from, {row: 2, column: 1});
    assert.deepEqual(reportDataTableOf(sheet).periodRows.map((periodRow) => periodRow.isTotals), [false]);
});

test('un concepto largo se dobla en su celda y su renglón crece; el nombre de la hoja se limpia de lo que Excel no acepta', () => {
    const longLabel = 'Además: cada pedido con su estado más reciente (no viene en la hoja de ventas del mes)';
    const sheet = reportSheetOf({...REPORT, sections: [{label: longLabel, rows: []}, {label: 'Corta', rows: []}]});
    const workbook = reportWorkbookOf(ExcelJS, sheet, {...EXCEL_TEXTS, summarySheetName: 'Ventas/Pedidos: [prueba] de un nombre muy largo'});
    const worksheet = workbook.worksheets[0];

    assert.equal(worksheet.name, 'Ventas Pedidos   prueba  de un ');
    assert.equal(worksheet.getCell('A5').alignment.wrapText, true);
    assert.equal(worksheet.getRow(5).height, 45);
    assert.equal(worksheet.getRow(6).height, undefined);
});

test('el nombre de un archivo sale sin acentos, en minúsculas y con guiones', () => {
    assert.equal(fileNameSlugOf('Plan Básico'), 'plan-basico');
    assert.equal(fileNameSlugOf('  Básico / Premium  '), 'basico-premium');
});
