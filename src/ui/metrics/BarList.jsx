// Barras horizontales de UNA serie con su nombre a la izquierda y su valor en la punta (ventas por producto,
// cuentas por organización), dibujadas con Recharts.
//
// Horizontales porque los nombres son largos ("Empresa / Área de ventas"): se leen completos sin rotarlos. Una serie → un
// color (el del tono, vía currentColor: los atributos SVG no leen var(...) pero sí currentColor); el valor va en tinta,
// nunca del color de la barra; y cada barra puede llevar a la pantalla que la explica.
//
// OJO: el número y el detalle de la punta salen del renglón de la barra (barListLabels.js), nunca de items[index]: Recharts
// descarta las barras de ancho 0 y renumera las etiquetas, y el detalle se corría al renglón de arriba.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import {Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

import {useFormatters} from '@/toolkit/useFormatters.js';
import ChartTooltip from '@/ui/metrics/ChartTooltip.jsx';
import TableToggle, {CHART_VIEW} from '@/ui/metrics/TableToggle.jsx';
import {BAR_MIN_POINT_SIZE, barLabelValueOf} from '@/ui/metrics/barListLabels.js';
import {useChartColors} from '@/ui/metrics/chartParts.jsx';

const ROW_HEIGHT_PIXELS = 36;

/**
 * El valor en la punta: el número fuerte y el detalle ("de 8") tenue; value es {value, detail} de barLabelValueOf. colors y
 * formatNumber: los de useChartColors y useFormatters (los da BarList: este pedazo lo pinta recharts por su cuenta).
 */
function ValueLabel({x, y, width, height, value, colors, formatNumber}) {
    return (
        <text x={x + width + 8} y={y + height / 2} dominantBaseline="central" fontSize={13}>
            <tspan fill={colors.text} fontWeight={600}>{formatNumber(value.value)}</tspan>
            {value.detail && <tspan fill={colors.muted} fontSize={12}>{` ${value.detail}`}</tspan>}
        </text>
    );
}

/**
 * @param {object} props
 * @param {Array<{key: string, label: string, value: number, detail?: string, tooltip?: string}>} props.items
 * @param {(item: any) => void} [props.onSelect] recibe el renglón de items que se picó
 * @param {string} props.emptyLabel ya traducido
 * @param {'primary'|'success'|'warning'|'error'|'info'} [props.tone]
 * @param {'chart'|'table'} [props.defaultView] cómo se ve al abrir (CHART_VIEW); por omisión dibujada
 * @param {(view: 'chart'|'table') => void} [props.onViewChange] la persona cambió a la tabla o a la gráfica
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function BarList({items, onSelect, emptyLabel, tone = 'primary', texts, defaultView = CHART_VIEW.chart, onViewChange}) {
    const [asTable, setAsTable] = useState(defaultView === CHART_VIEW.table);
    const toggleView = () => {
        setAsTable(!asTable);
        onViewChange?.(asTable ? CHART_VIEW.chart : CHART_VIEW.table);
    };
    const colors = useChartColors();
    const {formatNumber} = useFormatters();

    // guard clause: sin datos se dice, no se pinta un eje vacío
    if (!items.length) {
        return <Typography variant="body2" color="text.secondary">{emptyLabel}</Typography>;
    }

    // lo más largo de la etiqueta decide el ancho del eje: sin esto el nombre se corta o sobra medio contenedor
    // OJO: String(... ?? '') porque un renglón sin nombre (catálogo dado de baja) tumbaba toda la gráfica
    // OJO: 220 px de tope. Con 160 se cortaban etiquetas largas («Cuenta pendiente de activar») sin puntos suspensivos
    // ni forma de leerlas; el tooltip de la barra sigue mostrando el texto completo
    const labelWidth = Math.min(220, 16 + Math.max(...items.map((item) => String(item.label ?? '').length)) * 7);
    const longestValue = Math.max(...items.map((item) => `${formatNumber(item.value)} ${item.detail ?? ''}`.length));

    return (
        <Box>
            <TableToggle asTable={asTable} onToggle={toggleView} texts={texts} />
            {asTable ? (
                <Table size="small">
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.key} hover={Boolean(onSelect)} onClick={onSelect ? () => onSelect(item) : undefined}
                                      sx={{cursor: onSelect ? 'pointer' : 'default'}}>
                                <TableCell>{item.label}</TableCell>
                                <TableCell align="right">{formatNumber(item.value)} {item.detail}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <Box sx={{height: items.length * ROW_HEIGHT_PIXELS, color: `${tone}.main`}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={items} layout="vertical" margin={{top: 0, bottom: 0, left: 0, right: 16 + longestValue * 7}}>
                            {/* OJO: con todo en 0 el dominio [0, 0] manda el 0 a la MITAD del eje (escala degenerada de d3) y la
                                barra de 1 px con su «0 de 2» saldría a medio renglón; el tope mínimo de 1 lo deja en el origen */}
                            <XAxis type="number" hide domain={[0, (dataMax) => Math.max(dataMax, 1)]} />
                            <YAxis type="category" dataKey="label" width={labelWidth} tickLine={false} axisLine={false}
                                   tick={{fill: colors.text, fontSize: 13}} />
                            <Tooltip cursor={{fill: colors.hover}}
                                     content={<ChartTooltip render={(item) => item.tooltip ?? `${item.label}: ${formatNumber(item.value)}`} />} />
                            <Bar dataKey="value" fill="currentColor" maxBarSize={16} radius={[0, 4, 4, 0]} isAnimationActive={false}
                                 minPointSize={BAR_MIN_POINT_SIZE} cursor={onSelect ? 'pointer' : 'default'}
                                 onClick={onSelect ? (entry) => onSelect(entry.payload) : undefined}>
                                {/* OJO: SIN dataKey; con dataKey LabelList ignora valueAccessor y regresa el índice corrido */}
                                <LabelList valueAccessor={barLabelValueOf} content={(labelProps) => <ValueLabel {...labelProps} colors={colors} formatNumber={formatNumber} />} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Box>
    );
}
