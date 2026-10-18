// Lo que respondería el API del calendario de entregas: las citas (entregas e instalaciones) del mes, crear una, moverla y
// borrarla. Las citas salen de una cuenta fija a partir de hoy (sin azar), así el calendario nunca está vacío.
//
// Regla de la tienda: los domingos no hay entregas. Mover una cita a domingo responde 409 y el calendario la regresa.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {ApiError} from '@/fakeServer/ApiError.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

/** El tipo de cita, como lo manda el API. */
export const APPOINTMENT_KIND = Object.freeze({delivery: 'delivery', installation: 'installation', visit: 'visit'});

const HTTP_STATUS = Object.freeze({notFound: 404, conflict: 409, unprocessable: 422});
const SUNDAY = 0;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
// las citas de ejemplo: [días desde hoy, hora, duración en horas, tipo, cliente]
const SAMPLE_APPOINTMENTS = Object.freeze([
    [-6, 10, 1, APPOINTMENT_KIND.delivery, 'Luis Herrera'], [-3, 12, 2, APPOINTMENT_KIND.installation, 'Mónica Vega'],
    [-1, 9, 1, APPOINTMENT_KIND.visit, 'Bruno Díaz'], [0, 11, 1, APPOINTMENT_KIND.delivery, 'Irene Campos'],
    [0, 16, 2, APPOINTMENT_KIND.installation, 'Héctor Navarro'], [1, 10, 1, APPOINTMENT_KIND.delivery, 'Ana López'],
    [2, 13, 1, APPOINTMENT_KIND.visit, 'Gabriela Soto'], [4, 9, 3, APPOINTMENT_KIND.installation, 'Fernando Gil'],
    [6, 15, 1, APPOINTMENT_KIND.delivery, 'Karla Ibáñez'], [9, 10, 1, APPOINTMENT_KIND.delivery, 'Jorge Méndez'],
    [12, 12, 2, APPOINTMENT_KIND.installation, 'Elena Ruiz'], [15, 11, 1, APPOINTMENT_KIND.visit, 'Luis Herrera'],
]);

let appointments = null;

/** La fecha y hora local como texto ISO sin zona (como la espera el calendario). */
function localIsoOf(date) {
    const pad = (number) => String(number).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

/** Las citas de ejemplo a partir de hoy; un domingo se corre al lunes (regla de la tienda). */
function appointmentsOrSample() {
    if (!appointments) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appointments = SAMPLE_APPOINTMENTS.map(([dayOffset, hour, hours, kind, customer], index) => {
            const start = new Date(today.getTime() + dayOffset * MILLISECONDS_PER_DAY);
            if (start.getDay() === SUNDAY) {
                start.setDate(start.getDate() + 1);
            }
            start.setHours(hour);
            const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
            return {id: `appointment-${index + 1}`, kind, customer, start: localIsoOf(start), end: localIsoOf(end)};
        });
    }
    return appointments;
}

/** GET appointments. */
export async function listAppointments(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return appointmentsOrSample().map((appointment) => ({...appointment}));
}

/**
 * La fecha local de lo que manda el calendario. OJO: un día completo («2026-10-25», sin hora) se lee como medianoche UTC y
 * en México caía en el día anterior; se le pone la hora local.
 */
function localDateOf(text) {
    return new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00` : text);
}

/** El 409 de la regla de los domingos. */
function failIfSunday(startText) {
    if (localDateOf(startText).getDay() === SUNDAY) {
        throw new ApiError({status: HTTP_STATUS.conflict, problem: {code: 'closed_on_sunday', title: serverTextOf('calendar.sundayTitle'), detail: serverTextOf('calendar.sunday')}});
    }
}

/** POST appointments. */
export async function createAppointment({kind, customer, start, end}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    if (!customer?.trim()) {
        throw new ApiError({
            status: HTTP_STATUS.unprocessable,
            problem: {title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors: {customer: [serverTextOf('calendar.customerRequired')]}},
        });
    }
    failIfSunday(start);
    const appointment = {id: `appointment-${Date.now()}`, kind, customer: customer.trim(), start, end};
    appointmentsOrSample().push(appointment);
    return {appointment, message: serverTextOf('calendar.created', {customer: appointment.customer})};
}

/** PATCH appointments/{id}: otra fecha u hora (al arrastrarla). */
export async function moveAppointment(appointmentId, {start, end}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const appointment = appointmentsOrSample().find((candidate) => candidate.id === appointmentId);
    if (!appointment) {
        throw new ApiError({status: HTTP_STATUS.notFound, problem: {title: serverTextOf('calendar.notFoundTitle'), detail: serverTextOf('calendar.notFound')}});
    }
    failIfSunday(start);
    appointment.start = start;
    appointment.end = end ?? appointment.end;
    return {appointment: {...appointment}};
}

/** DELETE appointments/{id}. */
export async function deleteAppointment(appointmentId) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    appointments = appointmentsOrSample().filter((appointment) => appointment.id !== appointmentId);
    return {message: serverTextOf('calendar.deleted')};
}
