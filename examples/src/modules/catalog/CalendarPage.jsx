// Hecho en Calcita · el calendario (EventCalendar de /calendar): el ejemplo vivo y su código en JS y TS (para copiar).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import DeliveryCalendar from '@/modules/catalog/demos/calendar/DeliveryCalendar.tsx';

const loadSource = () => import('@/modules/catalog/demos/calendar/DeliveryCalendar.tsx?demo-source');

// «Cómo se extiende»: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts (calendar.demo.extend.<id>)
const CALENDAR_EXTENSIONS = [
    {id: 'events', option: 'events', example: "events={[{id: 'e1', title: 'Entrega P-2375', start: '2026-10-20', allDay: true, tone: 'success'}]}"},
    {id: 'views', option: 'initialView · views', example: 'initialView={CALENDAR_VIEW.week} views={[CALENDAR_VIEW.month, CALENDAR_VIEW.week]}'},
    {id: 'onEventClick', option: 'onEventClick', example: 'onEventClick={(eventId) => navigate(`/deliveries/${eventId}`)}'},
    {id: 'onDateSelect', option: 'onDateSelect', example: 'onDateSelect={({start, end}) => openNewDelivery(start, end)}'},
    {id: 'onEventChange', option: 'onEventChange', example: 'onEventChange={(change) => deliveriesApi.reschedule(change)}'},
    {id: 'height', option: 'height', example: 'height="auto"'},
    {id: 'ariaLabel', option: 'ariaLabel', example: 'ariaLabel="Entregas de octubre"'},
    {id: 'onDatesChange', option: 'onDatesChange', example: 'onDatesChange={({start, end}) => deliveriesApi.list({from: start, to: end})}'},
    {id: 'onViewChange', option: 'onViewChange', example: "onViewChange={(view) => localStorage.setItem('calendar-view', view)}"},
    {id: 'renderEvent', option: 'renderEvent', example: 'renderEvent={(event) => <DeliveryChip delivery={event} />}'},
    {id: 'fullCalendarProps', option: 'fullCalendarProps', example: "fullCalendarProps={{businessHours: {daysOfWeek: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '18:00'}, hiddenDays: [0]}}"},
    {id: 'texts', option: 'texts', example: "texts={{today: 'Hoy mero', details: {join: 'Entrar a la junta'}}}"},
    {id: 'eventDetails', option: 'EventDetails event', example: "<EventDetails event={{title, start, end, location, meetingUrl, attendees: [{id, name, response: 'accepted'}], reminderMinutes: 15, description}} />"},
    {id: 'eventDetailsActions', option: 'EventDetails actions · titleId', example: '<EventDetails event={event} titleId="detail-title" actions={<Button onClick={edit}>Editar</Button>} />'},
];

export const CalendarPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('calendar.title')} description={t('calendar.description')} />
            <DemoSection title={t('calendar.demo.title')} description={t('calendar.demo.description')}
                         extensions={extensionRowsOf(t, 'calendar.demo', CALENDAR_EXTENSIONS)} Demo={DeliveryCalendar} loadSource={loadSource} />
        </Stack>
    );
};
