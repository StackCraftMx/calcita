// EventCalendar (@stackcraftmx/calcita/calendar): mes, semana, día y lista. Elegir días agrega una cita; arrastrarla la
// cambia, y si la regla dice que no (aquí, los domingos), al tronar la función la cita regresa sola. Picar una cita abre su
// detalle con EventDetails: cuándo, dónde, la liga de la reunión con «Unirse», los invitados con su respuesta y el
// recordatorio. Lo que la cita traiga se pinta; lo que no, no ocupa lugar.
import {useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import {toastWarn} from '@stackcraftmx/calcita';
import {EventCalendar, EventDetails} from '@stackcraftmx/calcita/calendar';

const SUNDAY = 0;
// el horario de la tienda: lunes a sábado de 8 a 20 (se sombrea en la semana y el día)
const STORE_HOURS = {daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '20:00'};

// 1. Las citas: lo que traigan de más (lugar, liga, invitados, recordatorio) lo pinta el detalle
interface Appointment {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay?: boolean;
    tone?: string;
    location?: string;
    meetingUrl?: string;
    attendees?: Array<{id: string, name: string, response?: 'accepted' | 'declined' | 'pending'}>;
    reminderMinutes?: number | null;
}

const dayFromToday = (days: number, hour?: number) => {
    const day = new Date();
    day.setDate(day.getDate() + days);
    const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
    return hour === undefined ? date : `${date}T${String(hour).padStart(2, '0')}:00:00`;
};

const DeliveryCalendar = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([
        {id: '1', title: 'Entrega · Luis Herrera', start: dayFromToday(1), allDay: true, tone: 'info', location: 'Av. Madero 32'},
        {id: '2', title: 'Revisión del pedido', start: dayFromToday(2, 10), end: dayFromToday(2, 11), tone: 'secondary',
            meetingUrl: 'https://meet.example.com/revision', reminderMinutes: 15,
            attendees: [{id: 'ana', name: 'Ana Martínez', response: 'accepted'}, {id: 'luis', name: 'Luis Herrera', response: 'pending'}]},
    ]);
    const [openId, setOpenId] = useState<string | null>(null);
    const openAppointment = appointments.find((appointment) => appointment.id === openId);

    const add = ({start, end, allDay}: {start: string, end: string, allDay: boolean}) => {
        setAppointments((current) => [...current, {id: String(Date.now()), title: 'Nueva entrega', start, end, allDay, tone: 'info'}]);
    };
    const move = async ({id, start, end, allDay}: {id: string, start: string, end: string | null, allDay: boolean}) => {
        // un día completo («2026-10-25») se lee en la zona local, no en UTC
        if (new Date(`${start.slice(0, 10)}T12:00:00`).getDay() === SUNDAY) {
            toastWarn('Los domingos no hay entregas.');
            throw new Error('domingo');
        }
        setAppointments((current) => current.map((appointment) => (
            appointment.id === id ? {...appointment, start, end: end ?? undefined, allDay} : appointment
        )));
    };

    return (
        <>
            <EventCalendar events={appointments} onDateSelect={add} onEventChange={move} onEventClick={setOpenId}
                           ariaLabel="Calendario de entregas" height={560}
                           // 2. lo demás de FullCalendar: el horario de la tienda
                           fullCalendarProps={{businessHours: STORE_HOURS}}
                           // 3. el rango que se ve: aquí pediría a su backend solo esas citas
                           onDatesChange={({start, end}) => console.info('pedir citas del', start, 'al', end)} />
            {/* 4. el detalle de la cita, con los botones que quiera la pantalla */}
            <Dialog open={Boolean(openAppointment)} onClose={() => setOpenId(null)} maxWidth="xs" fullWidth aria-labelledby="delivery-detail-title">
                <DialogContent>
                    {openAppointment && (
                        <EventDetails event={openAppointment} titleId="delivery-detail-title"
                                      actions={<Button variant="contained" onClick={() => setOpenId(null)}>Cerrar</Button>} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default DeliveryCalendar;
