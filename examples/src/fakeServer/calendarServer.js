// Lo que respondería el API del calendario de entregas: las citas (entregas e instalaciones) del mes, crear una, moverla y
// borrarla. Las citas salen de una cuenta fija a partir de hoy (sin azar), así el calendario nunca está vacío.
//
// Regla de la tienda: los domingos no hay entregas. Mover una cita a domingo responde 409 y el calendario la regresa.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {ApiError} from '@/fakeServer/ApiError.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {fakeUsers} from '@/fakeServer/fakeAccounts.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

/** El tipo de cita, como lo manda el API. */
export const APPOINTMENT_KIND = Object.freeze({delivery: 'delivery', installation: 'installation', visit: 'visit'});

const HTTP_STATUS = Object.freeze({notFound: 404, conflict: 409, unprocessable: 422});
const SUNDAY = 0;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
// las citas de ejemplo: [días desde hoy, hora, duración en horas, tipo, cliente, lugar, ¿en línea?, invitados, recordatorio]
const SAMPLE_APPOINTMENTS = Object.freeze([
    [-6, 10, 1, APPOINTMENT_KIND.delivery, 'Luis Herrera', 'Av. Madero 32, Ciudad de México', false, ['user-sample'], 60],
    [-3, 12, 2, APPOINTMENT_KIND.installation, 'Mónica Vega', 'Calzada del Valle 400, Monterrey', false, ['user-luis'], 1440],
    [-1, 9, 1, APPOINTMENT_KIND.visit, 'Bruno Díaz', '', true, ['user-ana', 'user-sample'], 15],
    [0, 11, 1, APPOINTMENT_KIND.delivery, 'Irene Campos', 'Av. Chapultepec 215, Guadalajara', false, ['user-sample'], 30],
    [0, 16, 2, APPOINTMENT_KIND.installation, 'Héctor Navarro', 'Calle 5 de Mayo 10, Puebla', false, ['user-luis', 'user-ana'], 60],
    [1, 10, 1, APPOINTMENT_KIND.visit, 'Ana López', '', true, ['user-ana'], 10],
    [2, 13, 1, APPOINTMENT_KIND.visit, 'Gabriela Soto', 'Blvd. Juriquilla 2210, Querétaro', true, ['user-sample', 'user-luis'], 30],
    [4, 9, 3, APPOINTMENT_KIND.installation, 'Fernando Gil', 'Paseo de Montejo 485, Mérida', false, ['user-luis'], 1440],
    [6, 15, 1, APPOINTMENT_KIND.delivery, 'Karla Ibáñez', 'Paseo de los Héroes 9350, Tijuana', false, [], null],
    [9, 10, 1, APPOINTMENT_KIND.delivery, 'Jorge Méndez', 'Av. Presidente Masaryk 120, Ciudad de México', false, ['user-sample'], 60],
    [12, 12, 2, APPOINTMENT_KIND.installation, 'Elena Ruiz', 'Av. Madero 32, Ciudad de México', false, ['user-luis'], 120],
    [15, 11, 1, APPOINTMENT_KIND.visit, 'Luis Herrera', '', true, ['user-ana'], 15],
]);
// las respuestas de los invitados de ejemplo, en orden (sin azar): así se ven las tres
const SAMPLE_RESPONSES = Object.freeze(['accepted', 'pending', 'declined']);
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/;
const TITLE_MAX_LENGTH = 120;

let appointments = null;
let nextAppointmentNumber = 100;

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
        appointments = SAMPLE_APPOINTMENTS.map(([dayOffset, hour, hours, kind, customer, location, isOnline, attendeeIds, reminderMinutes], index) => {
            const start = new Date(today.getTime() + dayOffset * MILLISECONDS_PER_DAY);
            if (start.getDay() === SUNDAY) {
                start.setDate(start.getDate() + 1);
            }
            start.setHours(hour);
            const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
            return {
                id: `appointment-${index + 1}`, kind, title: customer, start: localIsoOf(start), end: localIsoOf(end), location,
                meetingUrl: isOnline ? `https://meet.example.com/calcita-${index + 1}` : '',
                attendees: attendeeIds.map((userId, position) => ({userId, response: SAMPLE_RESPONSES[(index + position) % SAMPLE_RESPONSES.length]})),
                reminderMinutes, notes: '',
            };
        });
    }
    return appointments;
}

/** Una cita como la manda el API, con el nombre de cada invitado. */
function appointmentResponseOf(appointment) {
    return {
        id: appointment.id, kind: appointment.kind, title: appointment.title, start: appointment.start, end: appointment.end,
        location: appointment.location, meeting_url: appointment.meetingUrl, reminder_minutes: appointment.reminderMinutes, notes: appointment.notes,
        attendees: appointment.attendees.map(({userId, response}) => ({id: userId, name: fakeUsers.find((user) => user.id === userId)?.name ?? userId, response})),
    };
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

/** Los errores de cada campo, como un 422 de Laravel. */
function failIfInvalid({title, kind, start, end, meetingUrl, attendeeIds}) {
    const errors = {};
    if (title !== undefined && (!title?.trim() || title.trim().length > TITLE_MAX_LENGTH)) {
        errors.title = [serverTextOf('calendar.titleRequired')];
    }
    if (kind !== undefined && !Object.values(APPOINTMENT_KIND).includes(kind)) {
        errors.kind = [serverTextOf('calendar.kindInvalid')];
    }
    if (start !== undefined && !ISO_DATE_TIME.test(start)) {
        errors.start = [serverTextOf('calendar.dateInvalid')];
    }
    if (start && end && ISO_DATE_TIME.test(start) && ISO_DATE_TIME.test(end) && localDateOf(end) <= localDateOf(start)) {
        errors.end = [serverTextOf('calendar.endBeforeStart')];
    }
    if (meetingUrl) {
        let isWeb = false;
        try {
            isWeb = ['http:', 'https:'].includes(new URL(meetingUrl).protocol);
        } catch {
            isWeb = false;
        }
        if (!isWeb) {
            errors.meetingUrl = [serverTextOf('calendar.meetingUrlInvalid')];
        }
    }
    if (attendeeIds?.some((userId) => !fakeUsers.some((user) => user.id === userId))) {
        errors.attendeeIds = [serverTextOf('calendar.attendeeInvalid')];
    }
    if (Object.keys(errors).length > 0) {
        throw new ApiError({
            status: HTTP_STATUS.unprocessable,
            problem: {status: HTTP_STATUS.unprocessable, title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors},
        });
    }
}

function findOrFail(appointmentId) {
    const appointment = appointmentsOrSample().find((candidate) => candidate.id === appointmentId);
    if (!appointment) {
        throw new ApiError({status: HTTP_STATUS.notFound, problem: {title: serverTextOf('calendar.notFoundTitle'), detail: serverTextOf('calendar.notFound')}});
    }
    return appointment;
}

/**
 * GET appointments?from=&to=: las citas que caen en el rango que se ve (sin él, todas). Así un backend no manda el año
 * completo cada vez.
 */
export async function listAppointments({from, to} = {}, signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return appointmentsOrSample()
        .filter((appointment) => (!from || localDateOf(appointment.end ?? appointment.start) >= localDateOf(from))
            && (!to || localDateOf(appointment.start) < localDateOf(to)))
        .map(appointmentResponseOf);
}

/** POST appointments. */
export async function createAppointment(fields) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    failIfInvalid(fields);
    failIfSunday(fields.start);
    const appointment = {
        id: `appointment-${nextAppointmentNumber++}`, kind: fields.kind, title: fields.title.trim(), start: fields.start, end: fields.end,
        location: fields.location ?? '', meetingUrl: fields.meetingUrl ?? '', reminderMinutes: fields.reminderMinutes ?? null, notes: fields.notes ?? '',
        attendees: (fields.attendeeIds ?? []).map((userId) => ({userId, response: 'pending'})),
    };
    appointmentsOrSample().push(appointment);
    return {appointment: appointmentResponseOf(appointment), message: serverTextOf('calendar.created', {customer: appointment.title})};
}

/** PUT appointments/{id}: todo lo de la cita (los invitados que ya estaban conservan su respuesta). */
export async function updateAppointment(appointmentId, fields) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const appointment = findOrFail(appointmentId);
    failIfInvalid(fields);
    failIfSunday(fields.start);
    const responseOf = (userId) => appointment.attendees.find((attendee) => attendee.userId === userId)?.response ?? 'pending';
    Object.assign(appointment, {
        kind: fields.kind, title: fields.title.trim(), start: fields.start, end: fields.end, location: fields.location ?? '',
        meetingUrl: fields.meetingUrl ?? '', reminderMinutes: fields.reminderMinutes ?? null, notes: fields.notes ?? '',
        attendees: (fields.attendeeIds ?? []).map((userId) => ({userId, response: responseOf(userId)})),
    });
    return {appointment: appointmentResponseOf(appointment), message: serverTextOf('calendar.updated')};
}

/** PATCH appointments/{id}: otra fecha u hora (al arrastrarla). */
export async function moveAppointment(appointmentId, {start, end}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const appointment = findOrFail(appointmentId);
    failIfSunday(start);
    appointment.start = start;
    appointment.end = end ?? appointment.end;
    return {appointment: appointmentResponseOf(appointment)};
}

/** DELETE appointments/{id}. */
export async function deleteAppointment(appointmentId) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    appointments = appointmentsOrSample().filter((appointment) => appointment.id !== appointmentId);
    return {message: serverTextOf('calendar.deleted')};
}
