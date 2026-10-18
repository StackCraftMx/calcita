// La ruta del calendario de entregas. La pantalla viaja en su propio archivo (lazy): FullCalendar solo se baja al abrirla.
export const APPOINTMENTS_PATH = '/appointments';

export const routes = [
    {path: APPOINTMENTS_PATH, lazy: async () => ({Component: (await import('@/modules/appointments/AppointmentsPage.jsx')).AppointmentsPage})},
];
