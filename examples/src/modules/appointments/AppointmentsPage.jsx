// La agenda como producto: EventCalendar de /calendar con todo lo de afuera puesto por la pantalla.
//   - pide al servidor solo las citas del rango que se ve (onDatesChange): así lo haría un backend con un año de citas;
//   - elegir días u horas abre «Agendar cita»; picar una cita enseña su detalle (EventDetails): cuándo, dónde, la liga de la
//     reunión con «Unirse», los invitados con su respuesta y el recordatorio, con «Editar» y «Borrar» (con confirmación);
//   - arrastrarla la cambia de día u hora; los domingos la tienda no entrega: el servidor responde 409 y la cita regresa;
//   - el horario de la tienda (lunes a sábado de 8 a 20) se marca en la semana y el día (fullCalendarProps businessHours).
// El color dice el tipo: las entregas con el color de información, las instalaciones con el de éxito y las visitas con el
// secundario del tema.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useCallback, useEffect, useRef, useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import {
    ConfirmDialog, PageHeading, SectionCard, toastProblem, toastSuccess, useConfirmAction, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {EventCalendar, EventDetails} from '@stackcraftmx/calcita/calendar';

import {AppointmentDialog} from '@/modules/appointments/AppointmentDialog.jsx';
import {APPOINTMENT_KIND, deleteAppointment, loadAppointments, moveAppointment} from '@/modules/appointments/appointmentsApi.js';
import {loadPeople} from '@/modules/appointments/peopleApi.js';

// el color de cada tipo de cita (un color del tema)
const TONE_BY_KIND = Object.freeze({[APPOINTMENT_KIND.delivery]: 'info', [APPOINTMENT_KIND.installation]: 'success', [APPOINTMENT_KIND.visit]: 'secondary'});
// el horario de la tienda: lunes a sábado de 8 a 20 (FullCalendar lo sombrea en la semana y el día)
const STORE_HOURS = Object.freeze({daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '08:00', endTime: '20:00'});
const CALENDAR_OPTIONS = Object.freeze({businessHours: STORE_HOURS, slotMinTime: '07:00:00', slotMaxTime: '21:00:00'});
const DETAIL_TITLE_ID = 'appointment-detail-title';

export const AppointmentsPage = () => {
    const {t, language} = useToolkitTranslation('appointments');
    const [appointments, setAppointments] = useState([]);
    const [people, setPeople] = useState([]);
    // lo que se abre: la ventana de agendar o editar (draft) y el detalle de una cita
    const [draft, setDraft] = useState(null);
    const [openId, setOpenId] = useState(null);
    // el rango que se ve (lo avisa el calendario): se vuelve a pedir al guardar, mover o borrar
    const visibleRange = useRef(null);

    const load = useCallback(() => {
        if (visibleRange.current) {
            loadAppointments(visibleRange.current).then(setAppointments).catch(toastProblem);
        }
    }, []);
    useEffect(() => {
        loadPeople().then(setPeople).catch(toastProblem);
    }, []);
    // al cambiar el idioma se vuelve a pedir (los mensajes del servidor llegan traducidos)
    useEffect(load, [load, language]);

    const deleteAction = useConfirmAction({
        run: ({subject}) => deleteAppointment(subject.id),
        onDone: (response) => {
            toastSuccess(response.message);
            setOpenId(null);
            load();
        },
    });

    const openAppointment = appointments.find((appointment) => appointment.id === openId);
    const titleOf = (appointment) => `${t(`kinds.${appointment.kind}`)} · ${appointment.title}`;
    const events = appointments.map((appointment) => ({
        id: appointment.id, title: titleOf(appointment), start: appointment.start, end: appointment.end, tone: TONE_BY_KIND[appointment.kind],
    }));

    // arrastrar: si el servidor dice que no (domingo), el aviso y el calendario la regresa (EventCalendar recibe el error)
    const move = async ({id, start, end}) => {
        try {
            await moveAppointment(id, {start, end});
            toastSuccess(t('moved'));
            load();
        } catch (error) {
            toastProblem(error);
            throw error;
        }
    };

    return (
        <Stack spacing={3}>
            <PageHeading title={t('page.title')} description={t('page.description')} />
            <SectionCard title={t('calendar')}>
                <EventCalendar ariaLabel={t('calendar')} events={events} onEventChange={move} fullCalendarProps={CALENDAR_OPTIONS}
                               onDatesChange={({start, end}) => {
                                   visibleRange.current = {from: start, to: end};
                                   load();
                               }}
                               onDateSelect={(range) => setDraft({range})} onEventClick={setOpenId} />
            </SectionCard>

            <AppointmentDialog key={draft?.appointment?.id ?? draft?.range?.start ?? 'closed'} draft={draft} people={people}
                               onClose={() => setDraft(null)}
                               onSaved={() => {
                                   setDraft(null);
                                   load();
                               }} />
            {/* la ventana se nombra con el título de la cita (titleId) */}
            <Dialog open={Boolean(openAppointment)} onClose={() => setOpenId(null)} maxWidth="xs" fullWidth aria-labelledby={DETAIL_TITLE_ID}>
                <DialogContent>
                    {openAppointment && (
                        <EventDetails
                            titleId={DETAIL_TITLE_ID}
                            event={{
                                ...openAppointment, title: titleOf(openAppointment), tone: TONE_BY_KIND[openAppointment.kind], description: openAppointment.notes,
                            }}
                            actions={(
                                <>
                                    <Button color="error" onClick={() => deleteAction.open(openAppointment)}>{t('detail.delete')}</Button>
                                    <Button onClick={() => {
                                        setDraft({appointment: openAppointment});
                                        setOpenId(null);
                                    }}>{t('detail.edit')}</Button>
                                    <Button variant="contained" onClick={() => setOpenId(null)}>{t('detail.close')}</Button>
                                </>
                            )} />
                    )}
                </DialogContent>
            </Dialog>
            <ConfirmDialog {...deleteAction.dialogProps} tone="error" title={t('confirmDelete.title')} description={t('confirmDelete.description')}
                           confirmLabel={t('detail.delete')} cancelLabel={t('dialog.cancel')} />
        </Stack>
    );
};
