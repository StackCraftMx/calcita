// Un reporte que se ve en pantalla y se baja en Excel o CSV desde la MISMA hoja (reportSheetOf de /excel): así el archivo
// dice lo mismo que la pantalla. DownloadMenu confirma el formato y el archivo va al panel de descargas. ExcelJS pesa casi
// 1 MB: se carga con import() solo cuando alguien pide el Excel.
import {XLSX_CONTENT_TYPE, DownloadMenu} from '@stackcraftmx/calcita';
import {VALUE_FORMAT, fileNameSlugOf, reportCsvOf, reportSheetOf, reportWorkbookOf} from '@stackcraftmx/calcita/excel';

const TITLE = 'Pedidos y ventas por mes';

// la hoja: secciones con sus conceptos, una cifra por periodo y el total (lo que mandaría el servidor, ya acomodado)
const sheet = reportSheetOf({
    conceptLabel: 'Concepto',
    periodLabels: ['Agosto', 'Septiembre', 'Octubre'],
    totalsLabel: 'Total',
    dataLabels: {section: 'Sección', period: 'Mes'},
    sections: [
        {
            label: 'Pedidos',
            rows: [
                {label: 'Recibidos', format: VALUE_FORMAT.count, values: [1210, 1302, 1382, 3894]},
                {label: 'Cancelados', format: VALUE_FORMAT.count, values: [11, 9, 13, 33]},
                {label: 'Tasa de cancelación', format: VALUE_FORMAT.percent, values: [0.91, 0.69, 0.94, 0.85]},
            ],
        },
        {
            label: 'Ventas',
            rows: [{label: 'Vendido', format: VALUE_FORMAT.money, isTotal: true, values: ['7520440.10', '8102990.00', '8708227.00', '24331657.10']}],
        },
    ],
});

// el archivo de cada formato: {blob, fileName}, lo que espera el panel
const reportFileOf = async (format: string) => {
    const fileName = `${fileNameSlugOf(TITLE)}.${format}`;
    if (format === 'csv') {
        return {blob: new Blob([reportCsvOf(sheet)], {type: 'text/csv;charset=utf-8'}), fileName};
    }
    const {default: ExcelJS} = await import('exceljs');
    const workbook = reportWorkbookOf(ExcelJS, sheet, {title: TITLE, subtitle: 'Agosto a octubre de 2026', summarySheetName: 'Resumen', dataSheetName: 'Datos'});
    return {blob: new Blob([await workbook.xlsx.writeBuffer()], {type: XLSX_CONTENT_TYPE}), fileName};
};

const ReportDownloadDemo = () => (
    <DownloadMenu formats={['xlsx', 'csv']} label="Descargar el reporte" downloadLabel={TITLE} download={(format) => reportFileOf(format)}
                  confirmation={(format) => ({
                      title: `¿Descargar el reporte en ${format === 'xlsx' ? 'Excel' : 'CSV'}?`,
                      description: 'Puede seguir trabajando mientras se arma: el archivo sale en el panel de abajo a la derecha.',
                  })} />
);

export default ReportDownloadDemo;
