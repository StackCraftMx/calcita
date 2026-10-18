// Columnas a lo largo del tiempo (p. ej. registros leídos por mes), dibujadas con Recharts: una serie (data con `value`) o
// varias agrupadas por periodo (`series`, cada una con su llave en data: ventas y devoluciones por mes).
//
// Recharts y no SVG a mano: ejes, escalas, rótulos que no se encimen y el tooltip ya los resolvió la librería. Lo que se
// decide aquí son las reglas de visualización:
//   - una serie → un color (el del tono vía currentColor) y SIN leyenda: el título ya dice qué es; varias → cada una su color
//     y leyenda abajo (chartParts.jsx, lo que comparte con LineChart);
//   - columnas de 28 px como máximo, punta redondeada, base cuadrada;
//   - rejilla horizontal de 1 px, sólida y recesiva; el texto de los ejes en tinta secundaria;
//   - tooltip por columna y VISTA DE TABLA;
//   - una línea de referencia opcional (p. ej. la meta), punteada y en tinta secundaria: se lee sin competir con las
//     columnas, y el eje crece lo necesario para que siempre se vea. Su rótulo va debajo de la gráfica y no sobre la
//     línea, donde se encimaba con la columna del último mes; así también lo lee quien ve la tabla.
//
// El valor se escribe con formatValue (por omisión, número con separador de miles): con él una serie puede ir en
// porcentaje. El eje mide lo que mide su número más largo, para que «2,500,000» no salga cortado.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

import {formatNumber} from '@/formatting.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import ChartTooltip from '@/ui/metrics/ChartTooltip.jsx';
import TableToggle from '@/ui/metrics/TableToggle.jsx';
import {
    AXIS_COLOR, AXIS_TEXT, ChartLegend, ChartTable, GRID_COLOR, ReferenceCaption, highestValueOf, resolvedSeriesOf, valueAxisWidthOf,
} from '@/ui/metrics/chartParts.jsx';

// la llave del valor cuando la gráfica es de una sola serie
const SINGLE_SERIES_KEY = 'value';

/**
 * @param {object} props
 * @param {Array<Record<string, any>>} props.data un renglón por periodo: {key, label, value, tooltip?} con una serie, o
 *     {key, label, [llave de cada serie]: número} con varias
 * @param {string} props.periodLabel encabezado de la primera columna de la tabla («Mes»), ya traducido
 * @param {string} [props.valueLabel] cómo se llama lo que se cuenta, ya traducido (una serie)
 * @param {Array<{key: string, label: string, tone?: 'primary'|'secondary'|'success'|'warning'|'error'|'info'}>} [props.series]
 *     varias series agrupadas: la llave de cada una en data, su nombre ya traducido y su color (por omisión, en orden)
 * @param {string} props.ariaLabel
 * @param {string} props.emptyLabel
 * @param {number} [props.height]
 * @param {'primary'|'success'|'warning'|'error'|'info'} [props.tone] el color de una sola serie
 * @param {(item: any, seriesKey: string) => void} [props.onSelect] recibe el renglón de data que se picó y la serie
 * @param {(value: number) => string} [props.formatValue] cómo se escribe un valor (en el eje, en la tabla y en el
 *     tooltip)
 * @param {{value: number, label: string}} [props.referenceLine] línea de referencia con su rótulo ya traducido («Meta:
 *     10 %»)
 * @param {(row: any) => import('react').ReactNode} [props.renderTooltip] lo que dice el globo de un periodo; por omisión su
 *     nombre y el valor de cada serie
 * @param {object} [props.texts] los textos que cambian, con la forma de `common`: {charts: {viewAsTable, viewAsChart, legend}}
 */
export default function ColumnChart({
    data, periodLabel, valueLabel, series, ariaLabel, emptyLabel, height = 220, tone = 'primary', onSelect, formatValue = formatNumber,
    referenceLine, renderTooltip, texts,
}) {
    const {t} = useToolkitTranslation('common', texts);
    const [asTable, setAsTable] = useState(false);
    const isSingleSeries = !series?.length;
    const drawnSeries = resolvedSeriesOf(isSingleSeries ? [{key: SINGLE_SERIES_KEY, label: valueLabel, tone}] : series);

    // guard clause: sin datos se dice, no se pinta un eje vacío
    if (!data.length) {
        return <Typography variant="body2" color="text.secondary">{emptyLabel}</Typography>;
    }

    // el valor más alto que se dibuja (el de las columnas o el de la línea de referencia) decide el ancho del eje
    const highestValue = highestValueOf(data, drawnSeries, referenceLine);
    const tooltipOf = renderTooltip ?? ((row) => (isSingleSeries
        ? row.tooltip ?? `${row.label}: ${formatValue(row.value)}`
        : (
            <>
                <strong>{row.label}</strong>
                {drawnSeries.map((item) => <Box key={item.key}>{item.label}: {formatValue(row[item.key])}</Box>)}
            </>
        )));

    return (
        <Box>
            <TableToggle asTable={asTable} onToggle={() => setAsTable((current) => !current)} texts={texts} />
            {asTable ? (
                <ChartTable data={data} series={drawnSeries} periodLabel={periodLabel} formatValue={formatValue} height={height} />
            ) : (
                <Box role="img" aria-label={ariaLabel} sx={{height, color: `${tone}.main`}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{top: 8, right: 8, bottom: 0, left: -8}} barCategoryGap={4}>
                            <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                            <XAxis dataKey="label" tick={AXIS_TEXT} tickLine={false} axisLine={{stroke: GRID_COLOR}}
                                   interval="preserveStartEnd" minTickGap={12} />
                            <YAxis allowDecimals={false} tick={AXIS_TEXT} tickLine={false} axisLine={false}
                                   width={valueAxisWidthOf(highestValue, formatValue)} tickFormatter={(value) => formatValue(value)} />
                            <Tooltip cursor={{fill: 'var(--mui-palette-action-hover)'}} content={<ChartTooltip render={tooltipOf} />} />
                            {referenceLine && (
                                // extendDomain: si la referencia queda arriba de todas las columnas, el eje crece hasta ella
                                <ReferenceLine y={referenceLine.value} ifOverflow="extendDomain" stroke={AXIS_COLOR} strokeDasharray="4 4" />
                            )}
                            {drawnSeries.map((item) => (
                                // una serie: currentColor (el tono de la caja); varias: el color de cada una
                                <Bar key={item.key} dataKey={item.key} fill={isSingleSeries ? 'currentColor' : item.color} maxBarSize={28}
                                     radius={[4, 4, 0, 0]} isAnimationActive={false} cursor={onSelect ? 'pointer' : 'default'}
                                     onClick={onSelect ? (entry) => onSelect(entry.payload, item.key) : undefined} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            )}
            <ChartLegend series={drawnSeries} ariaLabel={t('charts.legend')} />
            <ReferenceCaption referenceLine={referenceLine} />
        </Box>
    );
}
