// Calendario de actividad: un cuadro por día, semanas en columnas (el de GitHub).
//
// Sirve para ver RITMO de un vistazo: qué días llegan cargas, si hubo semanas muertas, si la actividad crece. Las
// reglas de visualización:
//   - es MAGNITUD, así que va un solo tono de claro a oscuro (el del tono que se pida), en cuatro niveles más "sin
//     actividad". Nunca un arcoíris. Se arma con color-mix sobre el color del tema (su variable CSS si el tema las usa),
//     sin hexadecimales: en modo oscuro los mismos niveles se ven sobre su propia superficie;
//   - los niveles se cortan por CUARTILES de los días con actividad (heatmapScale.js), no por valores fijos;
//   - leyenda "Menos → Más", tooltip por día con el número exacto (el color solo nunca dice cuánto) y VISTA DE TABLA
//     (para lector de pantalla, para quien no distingue el tono y para copiar los números).
//
// Sin librería a propósito: el Heatmap de MUI X Charts es de la edición Pro, que pide licencia.
//
// Textos por props y del paquete, y fechas con los formatos del paquete.
//
// Genérico del paquete: function (regla de la casa).
import {useMemo, useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import {useFormatters} from '@/toolkit/useFormatters.js';
import {HEATMAP_LEVELS, calendarWeeksOf, levelOf} from '@/ui/metrics/heatmapScale.js';
import TableToggle, {CHART_VIEW} from '@/ui/metrics/TableToggle.jsx';

// cuadros de 12 px en teléfono (el calendario se desliza) y de 16 px desde md, donde el panel ocupa todo el ancho
const CELL_PIXELS = {xs: 12, md: 16};
const GAP_PIXELS = 3;
// solo lunes, miércoles y viernes llevan rótulo: los siete encimados no se leen a 12 px
const LABELED_WEEKDAYS = new Set([1, 3, 5]);
// porcentaje del tono en cada nivel; el nivel 0 es el gris de "hover" del tema
const LEVEL_TONE_PERCENT = {1: 30, 2: 55, 3: 78, 4: 100};

/**
 * Relleno de un nivel con los colores del tema.
 *
 * @param {object} theme tema de MUI (con o sin variables CSS)
 * @param {string} tone primary, info, success...
 * @param {number} level 0 a 4
 * @returns {string} color CSS
 */
function levelFill(theme, tone, level) {
    // un tema con variables CSS las trae en theme.vars; el tema por omisión de MUI, solo en theme.palette
    const {palette} = theme.vars ?? theme;
    if (level === 0) {
        return palette.action.hover;
    }
    return `color-mix(in srgb, ${palette[tone].main} ${LEVEL_TONE_PERCENT[level]}%, transparent)`;
}

/**
 * @param {object} props
 * @param {string} props.startsOn primer día del rango ("2025-09-16"), fecha de calendario
 * @param {string} props.endsOn último día del rango ("2026-09-15")
 * @param {Array<{date: string, value: number, detail?: string}>} props.days solo los días con actividad; el resto vale
 *     0
 * @param {string} props.ariaLabel qué muestra el calendario, ya traducido
 * @param {string} props.valueLabel encabezado de la columna de valor en la tabla ("Registros leídos")
 * @param {(value: number) => string} props.describeValue el valor en palabras para el tooltip ("120 registros leídos")
 * @param {import('react').ReactNode} [props.summary] renglón de resumen arriba del calendario
 * @param {string} [props.emptyLabel] qué decir si ningún día tiene actividad
 * @param {'primary'|'info'|'success'|'warning'|'error'} [props.tone]
 * @param {'chart'|'table'} [props.defaultView] cómo se ve al abrir (CHART_VIEW); por omisión dibujada
 * @param {(view: 'chart'|'table') => void} [props.onViewChange] la persona cambió a la tabla o a la gráfica
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function CalendarHeatmap({startsOn, endsOn, days, ariaLabel, valueLabel, describeValue, summary, emptyLabel, tone = 'primary', texts, defaultView = CHART_VIEW.chart, onViewChange}) {
    const {t} = useToolkitTranslation('common', texts);
    const {formatDate, formatMonthShortName, formatNumber, formatWeekdayShortName} = useFormatters();
    const [asTable, setAsTable] = useState(defaultView === CHART_VIEW.table);
    const toggleView = () => {
        setAsTable(!asTable);
        onViewChange?.(asTable ? CHART_VIEW.chart : CHART_VIEW.table);
    };

    const {weeks, monthMarks, thresholds} = useMemo(() => calendarWeeksOf({startsOn, endsOn, days}), [startsOn, endsOn, days]);
    const activeDays = days.filter((day) => day.value > 0);

    return (
        <Box>
            <Stack direction="row" spacing={2} sx={{justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                <Typography variant="body2" color="text.secondary">
                    {activeDays.length ? summary : emptyLabel}
                </Typography>
                <Box sx={{flexShrink: 0}}>
                    <TableToggle asTable={asTable} onToggle={toggleView} texts={texts} />
                </Box>
            </Stack>

            {asTable ? (
                <Box sx={{maxHeight: 260, overflowY: 'auto'}}>
                    <Table size="small" aria-label={ariaLabel}>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('charts.day')}</TableCell>
                                <TableCell align="right">{valueLabel}</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[...activeDays].reverse().map((day) => (
                                <TableRow key={day.date}>
                                    <TableCell sx={{whiteSpace: 'nowrap'}}>{formatDate(day.date)}</TableCell>
                                    <TableCell align="right" sx={{fontVariantNumeric: 'tabular-nums'}}>{formatNumber(day.value)}</TableCell>
                                    <TableCell sx={{color: 'text.secondary'}}>{day.detail}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            ) : (
                // el calendario no se encoge: en pantallas angostas se desliza y arranca mostrando lo más reciente
                <Box sx={{overflowX: 'auto', pb: 0.5}}
                     ref={(node) => {
                         if (node) {
                             node.scrollLeft = node.scrollWidth;
                         }
                     }}>
                    <Box role="img" aria-label={ariaLabel}
                         sx={{
                             display: 'inline-grid',
                             gridTemplateColumns: {
                                 xs: `auto repeat(${weeks.length}, ${CELL_PIXELS.xs}px)`,
                                 md: `auto repeat(${weeks.length}, ${CELL_PIXELS.md}px)`,
                             },
                             columnGap: `${GAP_PIXELS}px`,
                             rowGap: `${GAP_PIXELS}px`,
                             alignItems: 'center',
                         }}>
                        <Box />
                        {monthMarks.map((month, column) => (
                            <Typography key={`month-${column}`} variant="caption" color="text.secondary"
                                        sx={{fontSize: 10, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'visible', width: CELL_PIXELS}}>
                                {month ? formatMonthShortName(month) : ''}
                            </Typography>
                        ))}
                        {[1, 2, 3, 4, 5, 6, 7].map((isoWeekday) => (
                            <Box key={`weekday-${isoWeekday}`} sx={{display: 'contents'}}>
                                <Typography variant="caption" color="text.secondary"
                                            sx={{fontSize: 10, lineHeight: {xs: `${CELL_PIXELS.xs}px`, md: `${CELL_PIXELS.md}px`}, pr: 0.75}}>
                                    {LABELED_WEEKDAYS.has(isoWeekday) ? formatWeekdayShortName(isoWeekday) : ''}
                                </Typography>
                                {weeks.map((week, column) => {
                                    const day = week[isoWeekday - 1];
                                    if (!day) {
                                        return <Box key={`outside-${column}-${isoWeekday}`} />;
                                    }
                                    const level = levelOf(day.value, thresholds);
                                    return (
                                        <Tooltip key={day.date} arrow disableInteractive
                                                 title={`${formatDate(day.date)}: ${describeValue(day.value)}${day.detail ? ` · ${day.detail}` : ''}`}>
                                            <Box sx={(theme) => ({width: CELL_PIXELS, height: CELL_PIXELS, borderRadius: '3px', bgcolor: levelFill(theme, tone, level)})} />
                                        </Tooltip>
                                    );
                                })}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {!asTable && (
                <Stack direction="row" spacing={0.5} sx={{alignItems: 'center', justifyContent: 'flex-end', mt: 1}} aria-hidden="true">
                    <Typography variant="caption" color="text.secondary" sx={{mr: 0.5}}>{t('charts.less')}</Typography>
                    {HEATMAP_LEVELS.map((level) => (
                        <Box key={level} sx={(theme) => ({width: CELL_PIXELS, height: CELL_PIXELS, borderRadius: '3px', bgcolor: levelFill(theme, tone, level)})} />
                    ))}
                    <Typography variant="caption" color="text.secondary" sx={{ml: 0.5}}>{t('charts.more')}</Typography>
                </Stack>
            )}
        </Box>
    );
}
