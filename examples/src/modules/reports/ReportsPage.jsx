// Ejemplo de descargas y del reporte en Excel.
//
// Lo que se ve aquí:
//   - DownloadMenu: «Descargar ▾» con Excel, CSV y JSON (un tipo propio de la app: APP_FILE_TYPES); cada formato pasa por su
//     confirmación y el archivo va al panel;
//   - el reporte (reportSheetOf, reportWorkbookOf, reportCsvOf): la misma hoja se pinta aquí y se descarga;
//   - el panel de descargas (DownloadManager, montado en AppShell) con startDownload: una descarga lenta que se puede
//     cancelar y una que falla con el motivo del servidor.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useMemo, useState} from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import {
    ConfirmDialog, DownloadMenu, PageHeading, SectionCard, formatNumber, formatPercent, materialBackgroundOf, startDownload,
    useConfirmAction, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {SHEET_ROW_KIND, VALUE_FORMAT} from '@stackcraftmx/calcita/excel';
import {Money} from '@stackcraftmx/calcita/money';

import {monthlyReportSheetOf} from '@/modules/reports/monthlyReport.js';
import {REPORT_FORMATS, reportFileOf} from '@/modules/reports/reportFiles.js';
import {downloadOrdersLog, downloadUnavailableFile, getOrderMetrics} from '@/modules/reports/reportsApi.js';

// el estado de cuenta sería un PDF: el panel pinta el ícono de ese tipo de archivo
const STATEMENT_FORMAT = 'pdf';

// la columna Concepto se queda fija al deslizar la tabla de lado (en el teléfono), como en el Resumen del Excel. OJO: tiene
// que tapar lo que pasa por debajo; con fondo transparente se ven pasar las cifras de las otras columnas. Con tarjetas de
// vidrio lleva el material grueso (el mismo desenfoque, casi opaco); sin vidrio, el papel sólido
const fixedConceptCellSxOf = (theme) => ({
    position: 'sticky', left: 0, zIndex: 1, borderRight: 1, borderRightColor: 'divider',
    ...(theme.toolkit?.glass?.surfaces ? materialBackgroundOf(theme, {thick: true}) : {bgcolor: 'background.paper'}),
});
// el gris de los renglones de sección va como sombra de adentro: se pinta ENCIMA del fondo de la celda (el material o el
// papel) sin quitárselo, así la celda fija sigue tapando lo de abajo
const sectionShadeSxOf = (theme) => ({boxShadow: `inset 0 0 0 100vmax ${(theme.vars ?? theme).palette.action.hover}`});

/**
 * Una cifra de la hoja como se lee en pantalla; null es «no aplica» y se escribe con raya, nunca con 0.
 *
 * @param {number|string|null} value
 * @param {string} format uno de VALUE_FORMAT
 * @returns {string}
 */
function figureTextOf(value, format) {
    if (value === null || value === undefined) {
        return '—';
    }
    if (format === VALUE_FORMAT.money) {
        return Money.fromString(value).format();
    }
    if (format === VALUE_FORMAT.percent) {
        return formatPercent(value);
    }
    return formatNumber(value);
}

export const ReportsPage = () => {
    const {t} = useToolkitTranslation('reports');
    const [metrics, setMetrics] = useState(null);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const abortController = new AbortController();
        getOrderMetrics(abortController.signal)
            .then(setMetrics)
            .catch((error) => {
                if (!abortController.signal.aborted) {
                    setLoadError(error);
                }
            });
        return () => abortController.abort();
    }, []);

    // la hoja se vuelve a armar al cambiar de idioma (t cambia con él): los títulos y los meses van en el idioma activo
    const sheet = useMemo(() => (metrics ? monthlyReportSheetOf(metrics, t) : null), [metrics, t]);

    const excelTexts = {
        title: t('excel.title'), subtitle: t('excel.subtitle'), summarySheetName: t('excel.summarySheet'), dataSheetName: t('excel.dataSheet'),
    };

    // OJO: run no regresa la promesa de startDownload a propósito. Si la regresara, el diálogo se quedaría ocupado hasta
    // que termine la descarga; así se cierra al confirmar y el avance se ve en el panel
    const ordersLog = useConfirmAction({
        run: () => {
            startDownload({
                label: t('panel.logLabel'),
                format: REPORT_FORMATS.csv,
                request: (transferOptions) => downloadOrdersLog(transferOptions, t('panel.logFileName')),
            });
        },
    });
    const unavailableFile = useConfirmAction({
        run: () => {
            startDownload({label: t('panel.unavailableLabel'), format: STATEMENT_FORMAT, request: downloadUnavailableFile});
        },
    });

    if (loadError) {
        return <Alert severity="error" role="alert">{loadError.message}</Alert>;
    }

    const downloadMenu = (
        <DownloadMenu
            formats={Object.values(REPORT_FORMATS)}
            label={t('download.label')}
            downloadLabel={t('download.panelLabel')}
            disabled={!sheet}
            download={(format) => reportFileOf(sheet, format, excelTexts)}
            confirmation={(format) => ({
                title: t('download.confirmTitle', {format: t(`common:download.formats.${format}.label`)}),
                description: t(`download.confirmDescription.${format}`),
            })}
        />
    );

    return (
        <>
            <PageHeading title={t('page.title')} description={t('page.subtitle')} actions={downloadMenu} />
            <Stack spacing={2}>
                <SectionCard title={t('excel.title')}>
                    {sheet ? (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {sheet.header.map((title, position) => (
                                            <TableCell key={title} align={position < 2 ? 'left' : 'right'}
                                                       sx={[{fontWeight: 700, whiteSpace: 'nowrap'}, position === 0 && fixedConceptCellSxOf]}>
                                                {title}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sheet.rows.map((row) => (row.kind === SHEET_ROW_KIND.section ? (
                                        // la sección en la celda fija y el resto del renglón en otra: así su nombre no se va al deslizar
                                        <TableRow key={row.label}>
                                            <TableCell sx={[fixedConceptCellSxOf, sectionShadeSxOf, {fontWeight: 700, whiteSpace: 'nowrap'}]}>
                                                {row.label}
                                            </TableCell>
                                            <TableCell colSpan={sheet.header.length - 1} sx={sectionShadeSxOf} />
                                        </TableRow>
                                    ) : (
                                        <TableRow key={row.label}>
                                            <TableCell sx={[fixedConceptCellSxOf, {pl: 3, whiteSpace: 'nowrap'}]}>{row.label}</TableCell>
                                            <TableCell sx={{color: 'text.secondary'}}>{row.howLabel}</TableCell>
                                            {row.values.map((value, position) => (
                                                <TableCell key={sheet.periods[position]} align="right"
                                                           sx={{whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums'}}>
                                                    {figureTextOf(value, row.format)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    )))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box role="status" sx={{display: 'grid', placeItems: 'center', py: 6}}>
                            <CircularProgress aria-label={t('page.loading')} />
                        </Box>
                    )}
                </SectionCard>

                <SectionCard title={t('panel.title')}>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('panel.text')}</Typography>
                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={1.5}>
                        <Button variant="outlined" onClick={() => ordersLog.open({})}>{t('panel.log')}</Button>
                        <Button variant="outlined" color="error" onClick={() => unavailableFile.open({})}>{t('panel.unavailable')}</Button>
                    </Stack>
                </SectionCard>
            </Stack>

            <ConfirmDialog {...ordersLog.dialogProps} title={t('panel.logTitle')} description={t('panel.logDescription')}
                           confirmLabel={t('panel.confirm')} />
            <ConfirmDialog {...unavailableFile.dialogProps} title={t('panel.unavailableTitle')} description={t('panel.unavailableDescription')}
                           confirmLabel={t('panel.confirm')} />
        </>
    );
};
