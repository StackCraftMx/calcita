// Líneas a lo largo del tiempo, de una serie o de varias que se comparan (ventas contra devoluciones, este año contra el
// pasado), dibujadas con Recharts. Lo que comparte con ColumnChart (ejes, tabla, leyenda, línea de referencia) vive en
// chartParts.jsx.
//
// Las reglas de la guía de Apple (HIG «Charts» y «Charting data»):
//   - líneas para ver la tendencia; columnas (ColumnChart) para comparar periodos sueltos;
//   - cada serie con su color Y su trazo (continuo, rayado, punteado), con su punto en cada periodo: el color no va solo;
//   - una serie sin leyenda (el título ya dice qué es); varias, con leyenda abajo; toda gráfica con su vista de tabla;
//   - el globo de un periodo dice el valor de cada serie.
//
//   <LineChart data={[{key: '2026-4', label: 'abr', sales: 120, returns: 8}, …]} periodLabel="Mes"
//              series={[{key: 'sales', label: 'Ventas'}, {key: 'returns', label: 'Devoluciones', tone: 'error'}]}
//              ariaLabel="Ventas y devoluciones por mes" emptyLabel="Sin datos" />
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {CartesianGrid, Line, LineChart as RechartsLineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

import {formatNumber} from '@/formatting.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import ChartTooltip from '@/ui/metrics/ChartTooltip.jsx';
import TableToggle from '@/ui/metrics/TableToggle.jsx';
import {
    AXIS_COLOR, AXIS_TEXT, ChartLegend, ChartTable, GRID_COLOR, ReferenceCaption, highestValueOf, resolvedSeriesOf, valueAxisWidthOf,
} from '@/ui/metrics/chartParts.jsx';

// el grueso de la línea y el tamaño de su punto (px): se ven en el teléfono sin tapar a la vecina
const LINE_WIDTH_PIXELS = 2;
const DOT_RADIUS_PIXELS = 3;
const ACTIVE_DOT_RADIUS_PIXELS = 5;

/**
 * @param {object} props
 * @param {Array<Record<string, any>>} props.data un renglón por periodo: {key, label, [llave de cada serie]: número}
 * @param {Array<{key: string, label: string, tone?: 'primary'|'secondary'|'success'|'warning'|'error'|'info', dash?: string}>} props.series
 *     la llave de cada serie en data, su nombre ya traducido, su color y su trazo (por omisión, en orden)
 * @param {string} props.periodLabel encabezado de la primera columna de la tabla («Mes»), ya traducido
 * @param {string} props.ariaLabel
 * @param {string} props.emptyLabel
 * @param {number} [props.height]
 * @param {(value: number) => string} [props.formatValue] cómo se escribe un valor (en el eje, en la tabla y en el globo)
 * @param {{value: number, label: string}} [props.referenceLine] línea de referencia (la meta) con su rótulo ya traducido
 * @param {(row: any) => void} [props.onSelect] recibe el renglón de data del periodo que se picó
 * @param {(row: any) => import('react').ReactNode} [props.renderTooltip] lo que dice el globo de un periodo; por omisión su
 *     nombre y el valor de cada serie
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`: {charts: {viewAsTable, viewAsChart, legend}}
 */
export default function LineChart({
    data, series, periodLabel, ariaLabel, emptyLabel, height = 220, formatValue = formatNumber, referenceLine, onSelect, renderTooltip, texts,
}) {
    const {t} = useToolkitTranslation('common', texts);
    const [asTable, setAsTable] = useState(false);
    const drawnSeries = resolvedSeriesOf(series);

    // guard clause: sin datos se dice, no se pinta un eje vacío
    if (!data.length) {
        return <Typography variant="body2" color="text.secondary">{emptyLabel}</Typography>;
    }

    const highestValue = highestValueOf(data, drawnSeries, referenceLine);
    // el periodo que se picó: recharts da su posición en data (a veces como texto)
    const selectPeriodAt = (activeIndex) => {
        const row = data[Number(activeIndex)];
        if (row) {
            onSelect(row);
        }
    };
    const tooltipOf = renderTooltip ?? ((row) => (
        <>
            <strong>{row.label}</strong>
            {drawnSeries.map((item) => <Box key={item.key}>{item.label}: {formatValue(row[item.key])}</Box>)}
        </>
    ));

    return (
        <Box>
            <TableToggle asTable={asTable} onToggle={() => setAsTable((current) => !current)} texts={texts} />
            {asTable ? (
                <ChartTable data={data} series={drawnSeries} periodLabel={periodLabel} formatValue={formatValue} height={height} />
            ) : (
                <Box role="img" aria-label={ariaLabel} sx={{height}}>
                    <ResponsiveContainer width="100%" height="100%">
                        {/* OJO: recharts 3 avisa el clic con el índice del periodo (activeIndex), ya no con activePayload (el de
                            la versión 2) */}
                        <RechartsLineChart data={data} margin={{top: 8, right: 12, bottom: 0, left: -8}}
                                           onClick={onSelect ? (state) => selectPeriodAt(state?.activeIndex) : undefined}>
                            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                            <XAxis dataKey="label" tick={AXIS_TEXT} tickLine={false} axisLine={{stroke: GRID_COLOR}}
                                   interval="preserveStartEnd" minTickGap={12} />
                            <YAxis allowDecimals={false} tick={AXIS_TEXT} tickLine={false} axisLine={false}
                                   width={valueAxisWidthOf(highestValue, formatValue)} tickFormatter={(value) => formatValue(value)} />
                            <Tooltip cursor={{stroke: GRID_COLOR}} content={<ChartTooltip render={tooltipOf} />} />
                            {referenceLine && (
                                <ReferenceLine y={referenceLine.value} ifOverflow="extendDomain" stroke={AXIS_COLOR} strokeDasharray="4 4" />
                            )}
                            {drawnSeries.map((item) => (
                                <Line key={item.key} type="monotone" dataKey={item.key} name={item.label} stroke={item.color}
                                      strokeWidth={LINE_WIDTH_PIXELS} strokeDasharray={item.dash} isAnimationActive={false}
                                      dot={{r: DOT_RADIUS_PIXELS, fill: item.color, strokeWidth: 0}}
                                      activeDot={{r: ACTIVE_DOT_RADIUS_PIXELS, cursor: onSelect ? 'pointer' : 'default'}} />
                            ))}
                        </RechartsLineChart>
                    </ResponsiveContainer>
                </Box>
            )}
            <ChartLegend series={drawnSeries} showsDash ariaLabel={t('charts.legend')} />
            <ReferenceCaption referenceLine={referenceLine} />
        </Box>
    );
}
