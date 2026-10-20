// Lo que comparten las gráficas de tiempo de la casa (ColumnChart y LineChart): las medidas del eje de valores, la vista de
// tabla, la leyenda de las series y el rótulo de la línea de referencia. Un solo lugar: si cambia cómo se lee una tabla o una
// leyenda, cambia en las dos gráficas.
//
// Las reglas de la guía de Apple (HIG «Charts» y «Charting data»):
//   - con una serie, sin leyenda (el título ya dice qué es); con varias, leyenda;
//   - el color no va solo: cada serie de líneas lleva además su trazo (continuo, rayado, punteado) y toda gráfica tiene su
//     vista de tabla;
//   - ejes y rejilla tenues, que den contexto sin competir con los datos.
//
// Los colores salen del tema (useChartColors), nunca escritos como var(--mui-…): un proyecto con su propio prefijo de
// variables (cssVarPrefix) o sin variables CSS se quedaba con ejes y texto sin color.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaChart con defaultProps y
// styleOverrides de sus partes: tableArea, legend, legendItem, legendLine, legendSwatch, reference, referenceLine.
//
// Genérico del paquete: function (regla de la casa).
import {useMemo} from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';

import {paletteOf} from '@/theme/components/paletteOf.js';
import {piecePart} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaChart)
const THEME_NAME = 'CalcitaChart';
const ChartTableArea = piecePart(THEME_NAME, 'TableArea', Box);
const ChartLegendPart = piecePart(THEME_NAME, 'Legend', Box);
const ChartLegendItem = piecePart(THEME_NAME, 'LegendItem', Box);
const ChartLegendLine = piecePart(THEME_NAME, 'LegendLine', Box);
const ChartLegendSwatch = piecePart(THEME_NAME, 'LegendSwatch', Box);
const ChartReference = piecePart(THEME_NAME, 'Reference', Box);
const ChartReferenceLine = piecePart(THEME_NAME, 'ReferenceLine', Box);

const AXIS_FONT_PIXELS = 12;
// ancho del eje de valores: nunca menos que esto, más lo que pida su número más largo
const AXIS_MINIMUM_WIDTH_PIXELS = 48;
const AXIS_PADDING_PIXELS = 16;
// ancho aproximado de un carácter del eje a 12 px
const AXIS_CHARACTER_PIXELS = 7;
// la marca más alta del eje suele pasar del valor más alto y puede llevar un carácter más (999,999 → 1,000,000)
const AXIS_EXTRA_CHARACTERS = 1;
// largo de la muestra que acompaña al rótulo de la línea de referencia y a cada serie de la leyenda
const SWATCH_PIXELS = 20;

/** Los colores de las series, en orden, cuando la pantalla no dice el suyo: los del tema. */
export const CHART_SERIES_TONES = Object.freeze(['primary', 'info', 'success', 'warning', 'error', 'secondary']);
/** El trazo de cada serie de líneas, en orden (continuo, rayado, punteado): así no se distinguen solo por el color. */
export const CHART_LINE_DASHES = Object.freeze(['0', '6 4', '2 3']);

/**
 * Los colores de las gráficas, leídos del tema: con variables CSS salen como var(--su-prefijo-palette-…) y sirven en claro y
 * en oscuro sin volver a pintar; sin ellas, el color de la paleta.
 *
 * @returns {{palette: object, axis: string, axisText: {fill: string, fontSize: number}, grid: string, text: string, muted: string, hover: string}}
 */
export function useChartColors() {
    const palette = paletteOf(useTheme());
    return useMemo(() => ({
        palette,
        axis: palette.text.secondary,
        axisText: {fill: palette.text.secondary, fontSize: AXIS_FONT_PIXELS},
        grid: palette.divider,
        text: palette.text.primary,
        muted: palette.text.secondary,
        hover: palette.action.hover,
    }), [palette]);
}

/**
 * Ancho del eje de valores para que quepa su número más largo.
 *
 * @param {number} highestValue el valor más alto que se dibuja
 * @param {(value: number) => string} formatValue cómo se escribe un valor
 * @returns {number} pixeles
 */
export function valueAxisWidthOf(highestValue, formatValue) {
    const longestLabel = formatValue(highestValue).length + AXIS_EXTRA_CHARACTERS;
    return Math.max(AXIS_MINIMUM_WIDTH_PIXELS, AXIS_PADDING_PIXELS + longestLabel * AXIS_CHARACTER_PIXELS);
}

/**
 * Las series con su color y su trazo resueltos (lo que la pantalla no dijo, por su lugar en la lista).
 *
 * @param {Array<{key: string, label: string, tone?: string, dash?: string}>} series
 * @param {object} palette la del tema (useChartColors().palette)
 * @returns {Array<{key: string, label: string, tone: string, color: string, dash: string}>}
 */
export function resolvedSeriesOf(series, palette) {
    return series.map((item, index) => {
        const tone = item.tone ?? CHART_SERIES_TONES[index % CHART_SERIES_TONES.length];
        return {
            ...item,
            tone,
            color: (palette[tone] ?? palette.primary).main,
            dash: item.dash ?? CHART_LINE_DASHES[index % CHART_LINE_DASHES.length],
        };
    });
}

/**
 * El valor más alto de todas las series (y de la línea de referencia), para el ancho del eje.
 *
 * @param {Array<Record<string, any>>} data
 * @param {Array<{key: string}>} series
 * @param {{value: number}|undefined} referenceLine
 * @returns {number}
 */
export function highestValueOf(data, series, referenceLine) {
    const values = data.flatMap((row) => series.map((item) => Number(row[item.key]) || 0));
    return Math.max(0, ...values, referenceLine?.value ?? 0);
}

/**
 * La vista de tabla: un renglón por periodo y una columna por serie.
 *
 * @param {object} props
 * @param {Array<Record<string, any>>} props.data
 * @param {Array<{key: string, label: string}>} props.series
 * @param {string} props.periodLabel
 * @param {(value: number) => string} props.formatValue
 * @param {number} props.height
 */
export function ChartTable({data, series, periodLabel, formatValue, height, ...unknownProps}) {
    warnUnknownProps('ChartTable', unknownProps);
    return (
        <ChartTableArea ownSx={{maxHeight: height, overflowY: 'auto'}}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>{periodLabel}</TableCell>
                        {series.map((item) => <TableCell key={item.key} align="right">{item.label}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.key}>
                            <TableCell>{row.label}</TableCell>
                            {series.map((item) => <TableCell key={item.key} align="right">{formatValue(row[item.key])}</TableCell>)}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ChartTableArea>
    );
}

/**
 * La leyenda: solo con dos series o más. Cada una con su muestra (su color y, en líneas, su trazo).
 *
 * @param {object} props
 * @param {Array<{key: string, label: string, color: string, dash: string}>} props.series ya resueltas
 * @param {boolean} [props.showsDash] la muestra con el trazo de su línea (LineChart); sin él, un cuadro de color
 * @param {string} props.ariaLabel
 */
export function ChartLegend({series, showsDash = false, ariaLabel, ...unknownProps}) {
    warnUnknownProps('ChartLegend', unknownProps);
    if (series.length < 2) {
        return null;
    }
    return (
        <ChartLegendPart component="ul" aria-label={ariaLabel} ownSx={{display: 'flex', flexWrap: 'wrap', gap: 2, listStyle: 'none', p: 0, m: 0, mt: 1}}>
            {series.map((item) => (
                <ChartLegendItem component="li" key={item.key} ownSx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
                    {showsDash ? (
                        <ChartLegendLine component="svg" aria-hidden="true" width={SWATCH_PIXELS} height={8} ownSx={{color: item.color}}>
                            <line x1="0" y1="4" x2={SWATCH_PIXELS} y2="4" stroke="currentColor" strokeWidth="2" strokeDasharray={item.dash} />
                        </ChartLegendLine>
                    ) : (
                        <ChartLegendSwatch aria-hidden="true" ownSx={{width: 10, height: 10, borderRadius: 0.5, bgcolor: item.color}} />
                    )}
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                </ChartLegendItem>
            ))}
        </ChartLegendPart>
    );
}

/**
 * El rótulo de la línea de referencia (la meta), debajo de la gráfica: sobre la línea se encimaba con la última columna, y
 * así también lo lee quien ve la tabla.
 *
 * @param {{referenceLine?: {value: number, label: string}}} props
 */
export function ReferenceCaption({referenceLine, ...unknownProps}) {
    warnUnknownProps('ReferenceCaption', unknownProps);
    if (!referenceLine) {
        return null;
    }
    return (
        <ChartReference ownSx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75, mt: 0.5}}>
            <ChartReferenceLine aria-hidden="true" ownSx={{width: SWATCH_PIXELS, borderTop: '2px dashed', borderColor: 'text.secondary'}} />
            <Typography variant="caption" color="text.secondary">{referenceLine.label}</Typography>
        </ChartReference>
    );
}
