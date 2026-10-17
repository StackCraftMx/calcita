// El reporte de cifras por periodo en Excel (Resumen y Datos) y CSV. ExcelJS no se importa aquí: quien llama lo carga
// con import() al pedir el archivo y se lo pasa a reportWorkbookOf.
export {
    DEFAULT_REPORT_STYLE, SHEET_ROW_KIND, VALUE_FORMAT, excelColorOf, fileNameSlugOf, reportCsvOf, reportDataTableOf, reportSheetOf,
    reportWorkbookOf,
} from '@/excel/reportWorkbook.js';
