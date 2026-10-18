// Hecho en Calcita · reportes en Excel y CSV: la misma hoja (reportSheetOf de /excel) se pinta en pantalla y se baja
// en Excel (con sus dos hojas, Resumen y Datos) o en CSV, desde DownloadMenu.
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import ReportDownloadDemo from '@/modules/catalog/demos/excel/ReportDownloadDemo.tsx';

const loadDemo = () => import('@/modules/catalog/demos/excel/ReportDownloadDemo.tsx?demo-source');

// «Cómo se extiende»: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (excelReports.demo.extend.<id>)
const REPORT_EXTENSIONS = [
    {id: 'sheet', option: 'reportSheetOf({conceptLabel, periodLabels, totalsLabel})', example: "reportSheetOf({conceptLabel: 'Concepto', periodLabels: ['Agosto', 'Septiembre'], totalsLabel: 'Total', …})"},
    {id: 'sections', option: 'sections[].rows[]', example: "{label: 'Recibidos', format: VALUE_FORMAT.count, values: [1210, 1302]}"},
    {id: 'valueFormat', option: 'VALUE_FORMAT', example: 'format: VALUE_FORMAT.money  // count · money · percent'},
    {id: 'isTotal', option: 'isTotal', example: "{label: 'Vendido', isTotal: true, …}"},
    {id: 'howLabel', option: 'howColumnLabel · rows[].howLabel', example: "howColumnLabel: 'Cómo sale', … howLabel: 'Recibidos − cancelados'"},
    {id: 'dataLabels', option: 'dataLabels', example: "dataLabels: {section: 'Sección', period: 'Mes'}"},
    {id: 'workbook', option: 'reportWorkbookOf(ExcelJS, sheet, texts)', example: "reportWorkbookOf(ExcelJS, sheet, {title, summarySheetName: 'Resumen', dataSheetName: 'Datos'})"},
    {id: 'style', option: 'style', example: "{…, style: {brandColor: excelColorOf('#E8590C')}}"},
    {id: 'csv', option: 'reportCsvOf(sheet)', example: 'new Blob([reportCsvOf(sheet)], {type: "text/csv;charset=utf-8"})'},
    {id: 'fileName', option: 'fileNameSlugOf(title)', example: '`${fileNameSlugOf(TITLE)}.xlsx`'},
    {id: 'screen', option: 'reportDataTableOf(sheet)', example: 'const {concepts, periodRows} = reportDataTableOf(sheet);'},
    {id: 'menu', option: '<DownloadMenu formats download confirmation>', example: "<DownloadMenu formats={['xlsx', 'csv']} download={reportFileOf} confirmation={…} />"},
    {id: 'menuIcon', option: 'variant · ariaLabel · icon', example: '<DownloadMenu variant="icon" ariaLabel="Descargar el estado de cuenta" … />'},
];

export const ExcelReportsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rows = extensionRowsOf(t, 'excelReports.demo', REPORT_EXTENSIONS);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('excelReports.title')} description={t('excelReports.description')} />
            <DemoSection title={t('excelReports.demo.title')} description={t('excelReports.demo.description')}
                         extensions={rows} Demo={ReportDownloadDemo} loadSource={loadDemo} />
        </Stack>
    );
};
