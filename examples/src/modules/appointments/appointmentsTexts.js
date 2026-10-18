// Los textos del ejemplo del calendario de entregas (namespace appointments).
export const appointmentsTexts = {
    es: {
        appointments: {
            menu: {label: 'Calendario', description: 'Las entregas, instalaciones y visitas: agende, mueva y borre citas.'},
            page: {
                title: 'Calendario de entregas',
                description: 'Elija días u horas para agendar una cita; arrástrela para cambiarla de día. Los domingos la tienda no entrega: si la mueve a domingo, regresa sola.',
            },
            calendar: 'Calendario de entregas',
            kinds: {delivery: 'Entrega', installation: 'Instalación', visit: 'Visita'},
            new: {title: 'Nueva cita', when: 'Desde el {{start}}', customer: 'Cliente', kind: 'Tipo de cita', save: 'Agendar'},
            detail: {when: 'Del {{start}} al {{end}}', delete: 'Borrar', close: 'Cerrar'},
            moved: 'Se cambió la cita.',
        },
    },
    en: {
        appointments: {
            menu: {label: 'Calendar', description: 'Deliveries, installations and visits: schedule, move and delete appointments.'},
            page: {
                title: 'Delivery calendar',
                description: 'Choose days or hours to schedule an appointment; drag it to change its day. The store does not deliver on Sundays: if you move it to Sunday, it goes back on its own.',
            },
            calendar: 'Delivery calendar',
            kinds: {delivery: 'Delivery', installation: 'Installation', visit: 'Visit'},
            new: {title: 'New appointment', when: 'From {{start}}', customer: 'Customer', kind: 'Appointment type', save: 'Schedule'},
            detail: {when: 'From {{start}} to {{end}}', delete: 'Delete', close: 'Close'},
            moved: 'The appointment was changed.',
        },
    },
};
