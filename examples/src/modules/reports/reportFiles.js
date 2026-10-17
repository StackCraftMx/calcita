// Los archivos del reporte, armados en el navegador con la misma hoja que se ve en pantalla: el libro de Excel (Resumen y
// Datos) y el CSV. Regresan lo que espera el panel de descargas: {blob, fileName}.
//
// OJO: ExcelJS pesa casi 1 MB y el paquete no lo importa. Se carga aquí, con import(), solo cuando alguien pide el
// Excel: la pantalla abre sin esperarlo.
//
// Funciones puras, sin React: function (regla de la casa).
import {XLSX_CONTENT_TYPE} from '@stackcraftmx/calcita';
import {fileNameSlugOf, reportCsvOf, reportWorkbookOf} from '@stackcraftmx/calcita/excel';

/** Los formatos en que se baja el reporte, en el orden del menú. */
export const REPORT_FORMATS = Object.freeze({xlsx: 'xlsx', csv: 'csv'});

const CSV_CONTENT_TYPE = 'text/csv;charset=utf-8';

/**
 * @param {object} sheet la hoja de monthlyReportSheetOf
 * @param {string} format uno de REPORT_FORMATS
 * @param {{title: string, subtitle: string, summarySheetName: string, dataSheetName: string}} texts ya traducidos
 * @returns {Promise<{blob: Blob, fileName: string}>}
 */
export async function reportFileOf(sheet, format, texts) {
    const fileName = `${fileNameSlugOf(texts.title)}.${format}`;

    if (format === REPORT_FORMATS.csv) {
        return {blob: new Blob([reportCsvOf(sheet)], {type: CSV_CONTENT_TYPE}), fileName};
    }

    const {default: ExcelJS} = await import('exceljs');
    const workbook = reportWorkbookOf(ExcelJS, sheet, texts);
    const buffer = await workbook.xlsx.writeBuffer();
    return {blob: new Blob([buffer], {type: XLSX_CONTENT_TYPE}), fileName};
}
