// Las llamadas del calendario de entregas, con los datos ya en la forma de la pantalla (camelCase). Aquí iría axios; en los
// ejemplos van al servidor de mentira, con la misma forma.
//
// Funciones que no renderizan: function (regla de la casa).
import {
    APPOINTMENT_KIND, createAppointment, deleteAppointment, listAppointments, moveAppointment, updateAppointment,
} from '@/fakeServer/calendarServer.js';

export {APPOINTMENT_KIND, deleteAppointment, moveAppointment};

const appointmentOf = (response) => ({
    id: response.id, kind: response.kind, title: response.title, start: response.start, end: response.end, location: response.location,
    meetingUrl: response.meeting_url, reminderMinutes: response.reminder_minutes, notes: response.notes, attendees: response.attendees,
});

/** Las citas del rango que se ve (from y to como los da el calendario). */
export const loadAppointments = async (range, signal) => (await listAppointments(range, signal)).map(appointmentOf);
/** Crear o guardar (con id) una cita; los campos en camelCase como los deja el formulario. */
export const saveAppointment = async (appointmentId, fields) => (appointmentId ? updateAppointment(appointmentId, fields) : createAppointment(fields));
