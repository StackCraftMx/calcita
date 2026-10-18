// EventCalendar (@stackcraftmx/calcita/calendar): mes, semana, día y lista. Elegir días agrega una cita; arrastrarla la
// cambia, y si la regla dice que no (aquí, los domingos), al tronar la función la cita regresa sola.
import {useState} from 'react';
import {toastWarn} from '@stackcraftmx/calcita';
import {EventCalendar} from '@stackcraftmx/calcita/calendar';

const SUNDAY = 0;

interface Appointment {
    id: string;
    title: string;
    start: string;
    end?: string;
    allDay?: boolean;
    tone?: string;
}

const isoDayFromToday = (days: number) => {
    const day = new Date();
    day.setDate(day.getDate() + days);
    return day.toISOString().slice(0, 10);
};

const DeliveryCalendar = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([
        {id: '1', title: 'Entrega · Luis Herrera', start: isoDayFromToday(1), allDay: true, tone: 'info'},
        {id: '2', title: 'Instalación · Mónica Vega', start: isoDayFromToday(3), allDay: true, tone: 'success'},
    ]);

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

    return <EventCalendar events={appointments} onDateSelect={add} onEventChange={move} ariaLabel="Calendario de entregas" height={560} />;
};

export default DeliveryCalendar;
