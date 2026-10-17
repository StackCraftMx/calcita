// Un reporte de cifras por periodo como archivo: libro de Excel o CSV, armado en el navegador con lo que ya se ve en
// pantalla (no se vuelve a contar nada).
//
// Primero se arma la «hoja» (reportSheetOf: encabezado y renglones ya con sus textos) y de ahí salen las dos hojas del
// libro, así siempre dicen lo mismo. Van en dos formas, con los mismos números:
//   A lo ancho (Resumen)  como una pantalla: un renglón por concepto y una columna por periodo, con los Totales al final
//                         si el reporte los lleva. Para leer e imprimir.
//   Hacia abajo (Datos)   la misma tabla volteada: un renglón por periodo y una columna por concepto. Lo que es fijo de
//                         cada concepto (su sección, su nombre y cómo sale su total) va UNA vez arriba y no se repite en
//                         cada renglón. Los filtros de Excel van en el último renglón del encabezado. El CSV va así.
//
// El Excel se arma con ExcelJS (MIT), el mismo que usa por dentro el DataGrid Premium de MUI. Pesa casi 1 MB: el paquete
// no lo importa; quien llama lo carga solo al pedir el archivo (import dinámico) y se lo pasa a reportWorkbookOf.
//
// Los colores por omisión son los del tema por omisión de MUI (azul primary); cada proyecto pasa los de su tema en
// `style` (excelColorOf convierte un color CSS #rrggbb al ARGB que pide Excel).
//
// Funciones puras, sin React: function (regla de la casa).

/** Cómo se escribe cada cifra: conteo con miles, dinero con dos decimales o porcentaje. */
export const VALUE_FORMAT = Object.freeze({count: 'count', money: 'money', percent: 'percent'});

/** Los dos tipos de renglón de la hoja: el título de una sección y un concepto con sus cifras. */
export const SHEET_ROW_KIND = Object.freeze({section: 'section', figures: 'figures'});

// lo que se escribe cuando una celda no aplica: nunca un 0, que diría «no hubo»
const NOT_APPLICABLE_TEXT = '—';

// el porcentaje llega como porcentaje (13 = 13 %); Excel lo guarda como fracción (0.13)
const PERCENT_PER_UNIT = 100;
// Excel guarda 15 cifras significativas: se redondea a ellas para que no se cuele el ruido de los decimales de
// JavaScript (5.2 / 100 = 0.052000000000000005)
const EXCEL_SIGNIFICANT_DIGITS = 15;

// la marca que avisa a Excel que el CSV va en UTF-8: sin ella rompe los acentos y la ñ
const UTF8_BYTE_ORDER_MARK = '﻿';
const CSV_SEPARATOR = ',';
const CSV_LINE_END = '\r\n';

// Excel no acepta hojas con más de 31 letras en el nombre ni con estos signos
const EXCEL_SHEET_NAME_MAX_LENGTH = 31;
const EXCEL_SHEET_NAME_FORBIDDEN_CHARACTERS = /[\\/?*[\]:]/g;

// un color CSS de seis cifras (#1976d2) y la opacidad completa que Excel pone adelante (FF)
const CSS_HEX_COLOR = /^#?([0-9a-f]{6})$/i;
const EXCEL_OPAQUE_ALPHA = 'FF';

/**
 * Cómo se ve el Excel, como un reporte: título arriba, encabezado del color principal con letra blanca, secciones con su
 * fondo, bordes delgados en toda la tabla y los Totales con su fondo. Los colores van en ARGB, como los pide Excel; por
 * omisión, los del tema por omisión de MUI (primary #1976d2, blue[50], grey).
 */
export const DEFAULT_REPORT_STYLE = Object.freeze({
    brandColor: 'FF1976D2',
    headerFontColor: 'FFFFFFFF',
    sectionFill: 'FFF5F5F5',
    totalsFill: 'FFE3F2FD',
    borderColor: 'FFE0E0E0',
    // en Datos cada sección empieza con una raya más marcada a su izquierda
    sectionBorderColor: 'FF9E9E9E',
    secondaryFontColor: 'FF757575',
    titleFontSize: 14,
    secondaryFontSize: 9,
    // el encabezado alcanza para dos líneas: una columna de cifras se ensancha si su título no cabe en ellas (las letras en
    // negritas ocupan más que la unidad de ancho de Excel, por eso el margen)
    headerRowHeight: 30,
    headerLineCount: 2,
    headerWidthMargin: 4,
    conceptColumnWidth: 36,
    howColumnWidth: 22,
    figureColumnWidth: 20,
    // los conceptos van con sangría bajo el título de su sección
    conceptIndent: 1,
    // el concepto largo se dobla en su celda y su renglón crece: cuántas letras caben por línea en la columna (su ancho
    // menos la sangría) y cuánto mide una línea. El alto va escrito porque no todos los programas lo calculan al abrir
    conceptCharactersPerLine: 33,
    lineHeightPoints: 15,
    // el formato de Excel de cada VALUE_FORMAT; el del dinero lleva el signo de la moneda del proyecto
    numberFormats: Object.freeze({
        [VALUE_FORMAT.count]: '#,##0',
        [VALUE_FORMAT.money]: '"$"#,##0.00',
        [VALUE_FORMAT.percent]: '0%',
    }),
});

// la hoja de Datos (hacia abajo): sin título; los renglones de encabezado (sección, concepto y, si el reporte la lleva,
// cómo sale) y luego un renglón por periodo. La primera columna dice el periodo; las demás, un concepto cada una
const EXCEL_DATA_SECTION_ROW = 1;
const EXCEL_DATA_CONCEPT_ROW = 2;
const EXCEL_DATA_HOW_ROW = 3;
const EXCEL_DATA_PERIOD_COLUMN_WIDTH = 24;
const EXCEL_DATA_CONCEPT_COLUMN_WIDTH = 20;
// el nombre del concepto se dobla en su celda: el renglón alcanza para tres líneas
const EXCEL_DATA_CONCEPT_ROW_HEIGHT = 45;

// dónde va cada cosa en Resumen: el título y el subtítulo arriba, un renglón en blanco y luego la tabla
const EXCEL_TITLE_ROW = 1;
const EXCEL_SUBTITLE_ROW = 2;
const EXCEL_HEADER_ROW = 4;

/**
 * Un color CSS de seis cifras (#017f31) como lo pide Excel (FF017F31). Sirve para pasar el color del tema de MUI a `style`.
 *
 * @param {string} cssColor #rrggbb
 * @returns {string} ARGB
 */
export function excelColorOf(cssColor) {
    const match = CSS_HEX_COLOR.exec(cssColor.trim());
    if (!match) {
        throw new Error(`excelColorOf espera un color #rrggbb y recibió «${cssColor}»`);
    }

    return `${EXCEL_OPAQUE_ALPHA}${match[1].toUpperCase()}`;
}

/**
 * Un nombre como pedazo del nombre de un archivo: sin acentos, en minúsculas y con guiones («Plan Básico» →
 * plan-basico).
 *
 * @param {string} name
 * @returns {string}
 */
export function fileNameSlugOf(name) {
    return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * La hoja del reporte: el encabezado y los renglones con sus textos, en el orden de la pantalla.
 *
 * @param {object} report
 * @param {string} report.conceptLabel título de la primera columna («Concepto»)
 * @param {string} [report.howColumnLabel] título de la columna que explica cómo sale cada total («Cómo salen los
 *     totales»); sin él no va esa columna
 * @param {string[]} report.periodLabels un título por periodo, en orden
 * @param {string} [report.totalsLabel] título de la columna de los Totales; sin él no va (y los renglones no traen su
 *     total)
 * @param {Object[]} report.sections las secciones en orden, cada una con sus renglones
 * @param {string} report.sections[].label
 * @param {Array<{label: string, howLabel?: string, format: string, isTotal?: boolean, values: Array<number|string|null>}>} report.sections[].rows
 *     values: una cifra por periodo y, si hay totalsLabel, al final la del total
 * @param {{section: string, period: string}} report.dataLabels lo que dice la primera columna de los Datos
 * @returns {{header: string[], dataHeaderLabels: {section: string, concept: string, period: string}, periods: string[], rows: Array<object>, hasHowColumn: boolean, hasTotals: boolean}}
 */
export function reportSheetOf({conceptLabel, howColumnLabel, periodLabels, totalsLabel, sections, dataLabels}) {
    const hasHowColumn = Boolean(howColumnLabel);
    const hasTotals = Boolean(totalsLabel);
    // los periodos de cada concepto: cada periodo y al final los Totales
    const periods = [...periodLabels, ...(hasTotals ? [totalsLabel] : [])];
    const header = [conceptLabel, ...(hasHowColumn ? [howColumnLabel] : []), ...periods];
    const dataHeaderLabels = {section: dataLabels.section, concept: conceptLabel, period: dataLabels.period};
    const rows = [];

    for (const section of sections) {
        rows.push({kind: SHEET_ROW_KIND.section, label: section.label});

        for (const row of section.rows) {
            rows.push({
                kind: SHEET_ROW_KIND.figures,
                sectionLabel: section.label,
                label: row.label,
                howLabel: row.howLabel ?? '',
                format: row.format,
                isTotal: Boolean(row.isTotal),
                values: row.values,
            });
        }
    }

    return {header, dataHeaderLabels, periods, rows, hasHowColumn, hasTotals};
}

/**
 * La tabla volteada de los Datos: un renglón por periodo y una columna por concepto.
 *
 * @param {{periods: string[], rows: Array<object>, hasTotals: boolean}} sheet de reportSheetOf
 * @returns {{concepts: Array<object>, periodRows: Array<{period: string, isTotals: boolean, values: Array<number|string|null>}>}}
 *          concepts: los renglones de cifras de la hoja, uno por columna (con su sección, nombre, cómo sale y formato)
 */
export function reportDataTableOf(sheet) {
    const concepts = sheet.rows.filter((row) => row.kind === SHEET_ROW_KIND.figures);
    const periodRows = sheet.periods.map((period, position) => ({
        period,
        // el último periodo son los Totales, si el reporte los lleva
        isTotals: sheet.hasTotals && position === sheet.periods.length - 1,
        values: concepts.map((concept) => concept.values[position]),
    }));

    return {concepts, periodRows};
}

/**
 * Una cifra como texto del CSV: sin separador de miles, para que Excel la lea como número.
 *
 * @param {number|string|null} value
 * @param {string} format VALUE_FORMAT
 * @returns {string}
 */
function csvValueOf(value, format) {
    if (value === null || value === undefined) {
        return NOT_APPLICABLE_TEXT;
    }

    return format === VALUE_FORMAT.percent ? `${value}%` : String(value);
}

/**
 * Un campo del CSV entre comillas cuando lo necesita (una coma, unas comillas o un salto de renglón adentro).
 *
 * @param {string} field
 * @returns {string}
 */
function csvFieldOf(field) {
    return /[",\r\n]/.test(field) ? `"${field.replaceAll('"', '""')}"` : field;
}

/**
 * Los renglones de encabezado de los Datos y del CSV: la sección y el concepto de cada columna y, si el reporte la
 * lleva, cómo sale. El primer campo dice qué es cada renglón; el del último encabeza la columna de los periodos (ahí van
 * los filtros de Excel), por eso dice «Periodo».
 *
 * @param {object} sheet de reportSheetOf
 * @param {Array<object>} concepts los conceptos de reportDataTableOf
 * @returns {string[][]}
 */
function dataHeaderLinesOf(sheet, concepts) {
    const sectionLine = [sheet.dataHeaderLabels.section, ...concepts.map((concept) => concept.sectionLabel)];
    const conceptNames = concepts.map((concept) => concept.label);

    // sin la columna de cómo sale, el renglón del concepto es el último del encabezado
    if (!sheet.hasHowColumn) {
        return [sectionLine, [sheet.dataHeaderLabels.period, ...conceptNames]];
    }

    return [
        sectionLine,
        [sheet.dataHeaderLabels.concept, ...conceptNames],
        [sheet.dataHeaderLabels.period, ...concepts.map((concept) => concept.howLabel)],
    ];
}

/**
 * El CSV de la hoja, igual que los Datos: sus renglones de encabezado y un renglón por periodo, con la marca de UTF-8 al
 * principio. La sección va en cada columna de su concepto: el CSV no une celdas.
 *
 * @param {object} sheet de reportSheetOf
 * @returns {string}
 */
export function reportCsvOf(sheet) {
    const {concepts, periodRows} = reportDataTableOf(sheet);
    const lines = dataHeaderLinesOf(sheet, concepts);

    for (const periodRow of periodRows) {
        lines.push([periodRow.period, ...periodRow.values.map((value, position) => csvValueOf(value, concepts[position].format))]);
    }

    return UTF8_BYTE_ORDER_MARK + lines.map((fields) => fields.map(csvFieldOf).join(CSV_SEPARATOR)).join(CSV_LINE_END) + CSV_LINE_END;
}

/**
 * Una cifra como la guarda Excel: número (el porcentaje como fracción) o el texto de «no aplica».
 *
 * @param {number|string|null} value
 * @param {string} format VALUE_FORMAT
 * @returns {number|string}
 */
function excelValueOf(value, format) {
    if (value === null || value === undefined) {
        return NOT_APPLICABLE_TEXT;
    }

    if (format === VALUE_FORMAT.percent) {
        return Number((Number(value) / PERCENT_PER_UNIT).toPrecision(EXCEL_SIGNIFICANT_DIGITS));
    }

    return Number(value);
}

/**
 * El nombre de la hoja de Excel: sin los signos que Excel no acepta y de 31 letras a lo más.
 *
 * @param {string} name
 * @returns {string}
 */
function excelSheetNameOf(name) {
    return name.replace(EXCEL_SHEET_NAME_FORBIDDEN_CHARACTERS, ' ').slice(0, EXCEL_SHEET_NAME_MAX_LENGTH);
}

/**
 * Dobla el concepto en su celda y le da a su renglón el alto de las líneas que ocupa.
 *
 * @param {object} row el renglón de ExcelJS
 * @param {string} label el concepto o el título de la sección
 * @param {object} alignment lo demás de su alineación (la sangría del concepto)
 * @param {object} style el estilo del reporte
 * @returns {void}
 */
function wrapConceptOf(row, label, alignment, style) {
    const lineCount = Math.ceil(label.length / style.conceptCharactersPerLine);
    row.getCell(1).alignment = {...alignment, wrapText: true, vertical: 'middle'};

    // con una sola línea se queda el alto de siempre
    if (lineCount > 1) {
        row.height = lineCount * style.lineHeightPoints;
    }
}

/**
 * El ancho de una columna de cifras: el de siempre, o más si su título no cabe en las líneas del encabezado.
 *
 * @param {string} headerTitle el título de la columna
 * @param {object} style el estilo del reporte
 * @returns {number}
 */
function figureColumnWidthOf(headerTitle, style) {
    return Math.max(style.figureColumnWidth, Math.ceil(headerTitle.length / style.headerLineCount) + style.headerWidthMargin);
}

/**
 * El libro de Excel con sus dos hojas:
 *   Resumen  a lo ancho, con formato de reporte: el título, el encabezado del color principal, las secciones con su
 *            fondo, cada cifra con su formato (conteo, dinero, porcentaje), bordes, los Totales con su fondo y Concepto
 *            (y Cómo sale, si va) y el encabezado fijos. Se imprime acostado y ajustado al ancho, con el encabezado en
 *            cada hoja.
 *   Datos    hacia abajo, con los filtros de Excel en el encabezado (ahí sí sirven: por sección, concepto o periodo).
 *
 * @param {object} ExcelJS el paquete exceljs ya cargado
 * @param {object} sheet de reportSheetOf
 * @param {{summarySheetName: string, dataSheetName: string, title: string, subtitle?: string, style?: object}} texts
 *        los nombres de las dos hojas, lo que va arriba del Resumen y, si se quiere, lo que cambia de DEFAULT_REPORT_STYLE
 * @returns {object} el libro (ExcelJS.Workbook); se escribe con workbook.xlsx.writeBuffer()
 */
export function reportWorkbookOf(ExcelJS, sheet, {summarySheetName, dataSheetName, title, subtitle = '', style: customStyle = {}}) {
    const style = {
        ...DEFAULT_REPORT_STYLE,
        ...customStyle,
        numberFormats: {...DEFAULT_REPORT_STYLE.numberFormats, ...customStyle.numberFormats},
    };
    const workbook = new ExcelJS.Workbook();
    // las columnas antes de las cifras, que se quedan fijas al deslizar: Concepto y, si el reporte la lleva, cómo sale
    const leadingColumnWidths = sheet.hasHowColumn ? [style.conceptColumnWidth, style.howColumnWidth] : [style.conceptColumnWidth];
    const worksheet = workbook.addWorksheet(excelSheetNameOf(summarySheetName), {
        views: [{state: 'frozen', xSplit: leadingColumnWidths.length, ySplit: EXCEL_HEADER_ROW}],
        pageSetup: {orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: `${EXCEL_HEADER_ROW}:${EXCEL_HEADER_ROW}`},
    });
    const columnCount = sheet.header.length;
    const totalsColumnNumber = columnCount;
    const firstFigureColumnNumber = leadingColumnWidths.length + 1;
    const fillOf = (color) => ({type: 'pattern', pattern: 'solid', fgColor: {argb: color}});
    const thinBorder = {style: 'thin', color: {argb: style.borderColor}};
    const cellBorder = {top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder};

    worksheet.columns = sheet.header.map((headerTitle, position) => ({
        width: leadingColumnWidths[position] ?? figureColumnWidthOf(headerTitle, style),
    }));

    // arriba: el título y el subtítulo
    worksheet.getCell(EXCEL_TITLE_ROW, 1).value = title;
    worksheet.getCell(EXCEL_TITLE_ROW, 1).font = {bold: true, size: style.titleFontSize, color: {argb: style.brandColor}};
    worksheet.getCell(EXCEL_SUBTITLE_ROW, 1).value = subtitle;
    worksheet.getCell(EXCEL_SUBTITLE_ROW, 1).font = {color: {argb: style.secondaryFontColor}};

    // el encabezado: el color principal con letra blanca; las cifras alineadas a la derecha
    const headerRow = worksheet.getRow(EXCEL_HEADER_ROW);
    headerRow.values = sheet.header;
    headerRow.height = style.headerRowHeight;
    headerRow.eachCell((cell, columnNumber) => {
        cell.font = {bold: true, color: {argb: style.headerFontColor}};
        cell.fill = fillOf(style.brandColor);
        cell.border = cellBorder;
        cell.alignment = {vertical: 'middle', wrapText: true, horizontal: columnNumber >= firstFigureColumnNumber ? 'right' : 'left'};
    });

    for (const row of sheet.rows) {
        // el título de la sección, con su fondo a todo lo ancho
        if (row.kind === SHEET_ROW_KIND.section) {
            const sectionRow = worksheet.addRow([row.label]);
            for (let columnNumber = 1; columnNumber <= columnCount; columnNumber += 1) {
                const cell = sectionRow.getCell(columnNumber);
                cell.font = {bold: true};
                cell.fill = fillOf(style.sectionFill);
                cell.border = cellBorder;
            }
            wrapConceptOf(sectionRow, row.label, {}, style);
            continue;
        }

        const figuresRow = worksheet.addRow([
            row.label,
            ...(sheet.hasHowColumn ? [row.howLabel] : []),
            ...row.values.map((value) => excelValueOf(value, row.format)),
        ]);
        for (let columnNumber = 1; columnNumber <= columnCount; columnNumber += 1) {
            figuresRow.getCell(columnNumber).border = cellBorder;
        }

        figuresRow.getCell(1).font = {bold: row.isTotal};
        wrapConceptOf(figuresRow, row.label, {indent: style.conceptIndent}, style);
        // cómo sale el total: más chico y en gris, para que no compita con las cifras
        if (sheet.hasHowColumn) {
            figuresRow.getCell(2).font = {italic: true, size: style.secondaryFontSize, color: {argb: style.secondaryFontColor}};
        }

        row.values.forEach((value, position) => {
            const cell = figuresRow.getCell(firstFigureColumnNumber + position);
            cell.numFmt = style.numberFormats[row.format];
            cell.alignment = {horizontal: 'right'};
            cell.font = {bold: row.isTotal};
        });

        // la columna de los Totales, con su fondo y en negritas (si el reporte la lleva)
        if (sheet.hasTotals) {
            const totalsCell = figuresRow.getCell(totalsColumnNumber);
            totalsCell.font = {bold: true};
            totalsCell.fill = fillOf(style.totalsFill);
        }
    }

    addDataWorksheet(workbook, sheet, dataSheetName, {style, fillOf, cellBorder});

    return workbook;
}

/**
 * La hoja de Datos: la tabla volteada, un renglón por periodo y una columna por concepto. Arriba, lo fijo de cada
 * concepto: su sección (una sola celda a lo ancho de sus conceptos, del color principal), su nombre y, si el reporte la
 * lleva, cómo sale; abajo, cada periodo con su valor en el formato de su concepto, y el renglón de los Totales con su
 * fondo y en negritas como en el Resumen. Cada sección empieza con una raya más marcada; la columna del periodo y el
 * encabezado quedan fijos, y los filtros de Excel van en el último renglón del encabezado.
 *
 * @param {object} workbook el libro de ExcelJS
 * @param {object} sheet de reportSheetOf
 * @param {string} dataSheetName el nombre de la hoja
 * @param {{style: object, fillOf: Function, cellBorder: object}} look el estilo, el relleno y el borde del Resumen
 * @returns {void}
 */
function addDataWorksheet(workbook, sheet, dataSheetName, {style, fillOf, cellBorder}) {
    const {concepts, periodRows} = reportDataTableOf(sheet);
    const headerLines = dataHeaderLinesOf(sheet, concepts);
    const lastHeaderRow = headerLines.length;
    const worksheet = workbook.addWorksheet(excelSheetNameOf(dataSheetName), {views: [{state: 'frozen', xSplit: 1, ySplit: lastHeaderRow}]});
    const columnCount = concepts.length + 1;
    const sectionBorder = {style: 'medium', color: {argb: style.sectionBorderColor}};
    // por concepto, si con él empieza una sección (su columna en la hoja es su lugar + 2: la 1 es el periodo)
    const startsSectionAt = concepts.map((concept, position) => position === 0 || concept.sectionLabel !== concepts[position - 1].sectionLabel);
    // la columna del periodo se ensancha si un periodo no cabe
    const periodColumnWidth = Math.max(
        EXCEL_DATA_PERIOD_COLUMN_WIDTH,
        ...periodRows.map((periodRow) => periodRow.period.length + style.headerWidthMargin),
    );

    worksheet.columns = [{width: periodColumnWidth}, ...concepts.map(() => ({width: EXCEL_DATA_CONCEPT_COLUMN_WIDTH}))];

    headerLines.forEach((headerLine, position) => {
        worksheet.getRow(EXCEL_DATA_SECTION_ROW + position).values = headerLine;
    });
    worksheet.getRow(EXCEL_DATA_CONCEPT_ROW).height = EXCEL_DATA_CONCEPT_ROW_HEIGHT;

    for (let columnNumber = 1; columnNumber <= columnCount; columnNumber += 1) {
        const sectionCell = worksheet.getCell(EXCEL_DATA_SECTION_ROW, columnNumber);
        sectionCell.font = {bold: true, color: {argb: style.headerFontColor}};
        sectionCell.fill = fillOf(style.brandColor);
        sectionCell.alignment = {vertical: 'middle', horizontal: columnNumber === 1 ? 'left' : 'center'};

        const conceptCell = worksheet.getCell(EXCEL_DATA_CONCEPT_ROW, columnNumber);
        conceptCell.font = {bold: true};
        conceptCell.fill = fillOf(style.sectionFill);
        conceptCell.alignment = {vertical: 'middle', wrapText: true, horizontal: columnNumber === 1 ? 'left' : 'right'};

        // sin la columna de cómo sale no hay su renglón
        if (!sheet.hasHowColumn) {
            continue;
        }

        const howCell = worksheet.getCell(EXCEL_DATA_HOW_ROW, columnNumber);
        howCell.font = columnNumber === 1
            ? {bold: true}
            : {italic: true, size: style.secondaryFontSize, color: {argb: style.secondaryFontColor}};
        howCell.alignment = {horizontal: columnNumber === 1 ? 'left' : 'right'};
    }

    // un renglón por periodo, cada valor con el formato de su concepto; el de los Totales con su fondo y en negritas
    for (const periodRow of periodRows) {
        const dataRow = worksheet.addRow([periodRow.period, ...periodRow.values.map((value, position) => excelValueOf(value, concepts[position].format))]);
        dataRow.font = {bold: periodRow.isTotals};

        concepts.forEach((concept, position) => {
            const cell = dataRow.getCell(position + 2);
            cell.numFmt = style.numberFormats[concept.format];
            cell.alignment = {horizontal: 'right'};
        });

        if (periodRow.isTotals) {
            dataRow.eachCell((cell) => {
                cell.fill = fillOf(style.totalsFill);
            });
        }
    }

    // bordes en toda la tabla, con la raya más marcada donde empieza cada sección (y a la derecha del periodo)
    for (let rowNumber = EXCEL_DATA_SECTION_ROW; rowNumber <= worksheet.rowCount; rowNumber += 1) {
        for (let columnNumber = 1; columnNumber <= columnCount; columnNumber += 1) {
            const startsSection = columnNumber > 1 && startsSectionAt[columnNumber - 2];
            worksheet.getCell(rowNumber, columnNumber).border = startsSection ? {...cellBorder, left: sectionBorder} : cellBorder;
        }
    }

    // la sección va una sola vez a lo ancho de sus conceptos (es encabezado: unirla no estorba a los filtros, que van abajo)
    let sectionStartColumn = 2;
    for (let position = 1; position <= concepts.length; position += 1) {
        const sectionEnds = position === concepts.length || startsSectionAt[position];
        if (sectionEnds) {
            const sectionEndColumn = position + 1;
            if (sectionEndColumn > sectionStartColumn) {
                worksheet.mergeCells(EXCEL_DATA_SECTION_ROW, sectionStartColumn, EXCEL_DATA_SECTION_ROW, sectionEndColumn);
            }
            sectionStartColumn = sectionEndColumn + 1;
        }
    }

    // los filtros de Excel en el último renglón del encabezado (la flechita de cada columna para buscar y filtrar)
    worksheet.autoFilter = {from: {row: lastHeaderRow, column: 1}, to: {row: worksheet.rowCount, column: columnCount}};
}
