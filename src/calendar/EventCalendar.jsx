// Un calendario de eventos (@stackcraftmx/calcita/calendar): FullCalendar por dentro, con la barra del framework (anterior y
// siguiente, «Hoy», el título y la vista con el control segmentado) y los colores del tema. En el idioma de
// ToolkitProvider, la semana empieza en lunes y marca la hora actual. Las citas van en bloques de su color (el color es
// información: el tipo de cita), no en puntitos.
//
//   <EventCalendar events={[{id: '1', title: 'Entrega P-2375', start: '2026-10-20T10:00', end: '2026-10-20T11:00', tone: 'info'}]}
//                  onEventClick={openDetail} onDateSelect={openNewEvent} onEventChange={(change) => api.patch(...)} />
//
// Arrastrar un evento lo cambia de día u hora: onEventChange recibe lo nuevo y, si truena (el servidor dijo que no), el
// evento regresa a donde estaba. Sin onEventChange no se puede arrastrar; sin onDateSelect no se pueden elegir días.
//
// OJO: las horas se pintan en la zona del navegador (FullCalendar pide un complemento aparte para zonas con nombre).
//
// Genérico del paquete: function (regla de la casa).
import {useRef, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import spanishLocale from '@fullcalendar/core/locales/es';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import {paletteOf} from '@/theme/components/paletteOf.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import SegmentedControl from '@/ui/filters/SegmentedControl.jsx';

/** Las vistas del calendario (los nombres de FullCalendar). */
export const CALENDAR_VIEW = Object.freeze({month: 'dayGridMonth', week: 'timeGridWeek', day: 'timeGridDay', list: 'listWeek'});

// el texto de cada vista en los textos del paquete (calendar.views.*)
const VIEW_TEXT_KEY = Object.freeze({
    [CALENDAR_VIEW.month]: 'month', [CALENDAR_VIEW.week]: 'week', [CALENDAR_VIEW.day]: 'day', [CALENDAR_VIEW.list]: 'list',
});
// cuántos eventos caben en un día del mes antes del «+2 más»
const DAY_MAX_EVENTS = 3;
const MONDAY = 1;

/**
 * La primera letra en mayúscula y lo demás como viene: «octubre de 2026» → «Octubre de 2026». OJO: con CSS
 * (text-transform: capitalize) salía «Octubre De 2026»: en español solo va la primera.
 *
 * @param {string} text
 * @returns {string}
 */
function capitalizeFirst(text) {
    return text ? text.charAt(0).toLocaleUpperCase() + text.slice(1) : text;
}

/**
 * Los colores del calendario sobre el tema (las variables CSS de FullCalendar), en claro y en oscuro.
 *
 * @param {object} theme
 * @returns {object}
 */
function calendarStylesOf(theme) {
    const palette = paletteOf(theme);
    return {
        '--fc-border-color': palette.divider,
        '--fc-page-bg-color': 'transparent',
        '--fc-neutral-bg-color': palette.action.hover,
        '--fc-today-bg-color': `color-mix(in srgb, ${palette.primary.main} 8%, transparent)`,
        '--fc-list-event-hover-bg-color': palette.action.hover,
        '--fc-now-indicator-color': palette.error.main,
        '--fc-highlight-color': `color-mix(in srgb, ${palette.primary.main} 14%, transparent)`,
        '& .fc': {fontFamily: 'inherit', fontSize: theme.typography.body2.fontSize},
        // los números de los días y los encabezados son ligas en FullCalendar: sin subrayado y del color del texto
        '& .fc a': {color: 'inherit', textDecoration: 'none'},
        '& .fc-col-header-cell-cushion': {fontWeight: 600, py: 1},
        '& .fc-event': {borderRadius: '6px', px: 0.5},
        // la hora no se encoge: en un día angosto se recortaba («1C» en lugar de «10»); lo que se corta es el nombre
        '& .fc-event-time': {flexShrink: 0, overflow: 'visible'},
        '& .fc-scrollgrid': {borderRadius: '12px', overflow: 'hidden'},
        '& .fc-list': {borderRadius: '12px'},
    };
}

/**
 * @param {object} props
 * @param {Array<{id: string, title: string, start: string, end?: string, allDay?: boolean, tone?: string}>} props.events
 *     start y end como texto ISO; tone: un color del tema (por omisión primary)
 * @param {string} [props.initialView] una de CALENDAR_VIEW
 * @param {string[]} [props.views] las que se ofrecen en el control segmentado
 * @param {(eventId: string) => void} [props.onEventClick]
 * @param {(range: {start: string, end: string, allDay: boolean}) => void} [props.onDateSelect] al elegir días u horas
 * @param {(change: {id: string, start: string, end: string|null, allDay: boolean}) => Promise<unknown>|void} [props.onEventChange]
 *     al arrastrar un evento; si truena, el evento regresa
 * @param {number|'auto'} [props.height]
 * @param {string} props.ariaLabel ya traducido
 */
export default function EventCalendar({
    events, initialView = CALENDAR_VIEW.month, views = Object.values(CALENDAR_VIEW), onEventClick, onDateSelect, onEventChange, height = 'auto', ariaLabel,
}) {
    const theme = useTheme();
    const palette = paletteOf(theme);
    const {t} = useToolkitTranslation('calendar');
    const {language} = useToolkitSettings();
    const calendarRef = useRef(null);
    const [title, setTitle] = useState('');
    const [view, setView] = useState(initialView);
    const calendarApi = () => calendarRef.current?.getApi();

    const coloredEvents = events.map((event) => {
        const color = palette[event.tone] ?? palette.primary;
        return {...event, backgroundColor: color.main, borderColor: color.main, textColor: color.contrastText};
    });

    const changeEvent = async ({event, revert}) => {
        try {
            await onEventChange({id: event.id, start: event.startStr, end: event.endStr || null, allDay: event.allDay});
        } catch {
            // el servidor dijo que no: el evento regresa a donde estaba (quien llama ya avisó el error)
            revert();
        }
    };

    return (
        <Stack spacing={2} role="region" aria-label={ariaLabel}>
            <Stack direction={{xs: 'column', md: 'row'}} spacing={1.5} sx={{alignItems: {md: 'center'}, justifyContent: 'space-between'}}>
                <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                    <Tooltip title={t('previous')}>
                        <IconButton aria-label={t('previous')} onClick={() => calendarApi()?.prev()}><ChevronLeftRoundedIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title={t('next')}>
                        <IconButton aria-label={t('next')} onClick={() => calendarApi()?.next()}><ChevronRightRoundedIcon /></IconButton>
                    </Tooltip>
                    <Button variant="outlined" size="small" onClick={() => calendarApi()?.today()}>{t('today')}</Button>
                    <Typography variant="h6" component="h2" sx={{pl: 1}} aria-live="polite">{capitalizeFirst(title)}</Typography>
                </Stack>
                {views.length > 1 && (
                    <SegmentedControl ariaLabel={t('view')} value={view} onChange={(nextView) => calendarApi()?.changeView(nextView)}
                                      options={views.map((value) => ({value, label: t(`views.${VIEW_TEXT_KEY[value]}`)}))} />
                )}
            </Stack>
            <Box sx={calendarStylesOf}>
                <FullCalendar ref={calendarRef} plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]} initialView={initialView}
                              headerToolbar={false} locale={language === 'es' ? spanishLocale : 'en'} firstDay={MONDAY} height={height}
                              nowIndicator dayMaxEvents={DAY_MAX_EVENTS} events={coloredEvents} eventDisplay="block"
                              datesSet={(dateInfo) => {
                                  setTitle(dateInfo.view.title);
                                  setView(dateInfo.view.type);
                              }}
                              eventClick={onEventClick ? (clickInfo) => onEventClick(clickInfo.event.id) : undefined}
                              selectable={Boolean(onDateSelect)} selectMirror
                              select={onDateSelect ? (selectInfo) => {
                                  onDateSelect({start: selectInfo.startStr, end: selectInfo.endStr, allDay: selectInfo.allDay});
                                  calendarApi()?.unselect();
                              } : undefined}
                              editable={Boolean(onEventChange)} eventChange={onEventChange ? changeEvent : undefined} />
            </Box>
        </Stack>
    );
}
