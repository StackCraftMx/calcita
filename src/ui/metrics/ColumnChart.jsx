// Columnas de UNA serie a lo largo del tiempo (p. ej. registros leídos por mes), dibujadas con Recharts.
//
// Recharts y no SVG a mano: ejes, escalas, rótulos que no se encimen y el tooltip ya los resolvió la librería. Lo que se
// decide aquí son las reglas de visualización:
//   - una serie → un color (el del tono vía currentColor) y SIN leyenda: el título ya dice qué es;
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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import {Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

import {formatNumber} from '@/formatting.js';
import ChartTooltip from '@/ui/metrics/ChartTooltip.jsx';
import TableToggle from '@/ui/metrics/TableToggle.jsx';

const AXIS_COLOR = 'var(--mui-palette-text-secondary)';
const AXIS_FONT_PIXELS = 12;
const AXIS_TEXT = {fill: AXIS_COLOR, fontSize: AXIS_FONT_PIXELS};
// ancho del eje de valores: nunca menos que esto, más lo que pida su número más largo
const AXIS_MINIMUM_WIDTH_PIXELS = 48;
const AXIS_PADDING_PIXELS = 16;
// ancho aproximado de un carácter del eje a 12 px
const AXIS_CHARACTER_PIXELS = 7;
// la marca más alta del eje suele pasar del valor más alto y puede llevar un carácter más (999,999 → 1,000,000)
const AXIS_EXTRA_CHARACTERS = 1;
// largo de la muestra punteada que acompaña al rótulo de la línea de referencia
const REFERENCE_SWATCH_PIXELS = 20;

/**
 * Ancho del eje de valores para que quepa su número más largo.
 *
 * @param {number} highestValue el valor más alto que se dibuja
 * @param {(value: number) => string} formatValue cómo se escribe un valor
 * @returns {number} pixeles
 */
function valueAxisWidthOf(highestValue, formatValue) {
    const longestLabel = formatValue(highestValue).length + AXIS_EXTRA_CHARACTERS;
    return Math.max(AXIS_MINIMUM_WIDTH_PIXELS, AXIS_PADDING_PIXELS + longestLabel * AXIS_CHARACTER_PIXELS);
}

/**
 * @param {object} props
 * @param {Array<{key: string, value: number, label: string, tooltip?: string}>} props.data
 * @param {string} props.periodLabel encabezado de la primera columna de la tabla («Mes»), ya traducido
 * @param {string} props.valueLabel cómo se llama lo que se cuenta, ya traducido
 * @param {string} props.ariaLabel
 * @param {string} props.emptyLabel
 * @param {number} [props.height]
 * @param {'primary'|'success'|'warning'|'error'|'info'} [props.tone]
 * @param {(item: object) => void} [props.onSelect]
 * @param {(value: number) => string} [props.formatValue] cómo se escribe un valor (en el eje, en la tabla y en el
 *     tooltip)
 * @param {{value: number, label: string}} [props.referenceLine] línea de referencia con su rótulo ya traducido («Meta:
 *     10 %»)
 */
export default function ColumnChart({
    data, periodLabel, valueLabel, ariaLabel, emptyLabel, height = 220, tone = 'primary', onSelect, formatValue = formatNumber, referenceLine,
}) {
    const [asTable, setAsTable] = useState(false);

    // guard clause: sin datos se dice, no se pinta un eje vacío
    if (!data.length) {
        return <Typography variant="body2" color="text.secondary">{emptyLabel}</Typography>;
    }

    // el valor más alto que se dibuja (el de las columnas o el de la línea de referencia) decide el ancho del eje
    const highestValue = Math.max(...data.map((item) => item.value), referenceLine?.value ?? 0);

    return (
        <Box>
            <TableToggle asTable={asTable} onToggle={() => setAsTable((current) => !current)} />
            {asTable ? (
                <Box sx={{maxHeight: height, overflowY: 'auto'}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow><TableCell>{periodLabel}</TableCell><TableCell align="right">{valueLabel}</TableCell></TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.key}>
                                    <TableCell>{item.label}</TableCell>
                                    <TableCell align="right">{formatValue(item.value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            ) : (
                <Box role="img" aria-label={ariaLabel} sx={{height, color: `${tone}.main`}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{top: 8, right: 8, bottom: 0, left: -8}} barCategoryGap={4}>
                            <CartesianGrid vertical={false} stroke="var(--mui-palette-divider)" />
                            <XAxis dataKey="label" tick={AXIS_TEXT} tickLine={false} axisLine={{stroke: 'var(--mui-palette-divider)'}}
                                   interval="preserveStartEnd" minTickGap={12} />
                            <YAxis allowDecimals={false} tick={AXIS_TEXT} tickLine={false} axisLine={false}
                                   width={valueAxisWidthOf(highestValue, formatValue)} tickFormatter={(value) => formatValue(value)} />
                            <Tooltip cursor={{fill: 'var(--mui-palette-action-hover)'}}
                                     content={<ChartTooltip render={(item) => item.tooltip ?? `${item.label}: ${formatValue(item.value)}`} />} />
                            {referenceLine && (
                                // extendDomain: si la referencia queda arriba de todas las columnas, el eje crece hasta ella
                                <ReferenceLine y={referenceLine.value} ifOverflow="extendDomain" stroke={AXIS_COLOR} strokeDasharray="4 4" />
                            )}
                            <Bar dataKey="value" fill="currentColor" maxBarSize={28} radius={[4, 4, 0, 0]} isAnimationActive={false}
                                 cursor={onSelect ? 'pointer' : 'default'} onClick={onSelect ? (entry) => onSelect(entry.payload) : undefined} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            )}
            {referenceLine && (
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75, mt: 0.5}}>
                    <Box aria-hidden="true" sx={{width: REFERENCE_SWATCH_PIXELS, borderTop: '2px dashed', borderColor: 'text.secondary'}} />
                    <Typography variant="caption" color="text.secondary">{referenceLine.label}</Typography>
                </Box>
            )}
        </Box>
    );
}
