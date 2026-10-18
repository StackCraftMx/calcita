// El calendario de entregas: EventCalendar de /calendar con las citas del servidor. Elegir días u horas abre «Nueva cita»;
// picar una cita enseña su detalle con «Borrar»; arrastrarla la cambia de día u hora. Los domingos la tienda no entrega:
// el servidor responde 409, sale el aviso y la cita regresa sola a donde estaba.
//
// El color dice el tipo: azul las entregas, verde las instalaciones, morado las visitas.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useCallback, useEffect, useMemo, useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {PageHeading, SectionCard, formatDate, formatDateTime, toastProblem, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {EventCalendar} from '@stackcraftmx/calcita/calendar';
import {Form, FormProblemAlert, FormSelectField, FormTextField, Formik, SubmitButton, Yup, applyServerProblem} from '@stackcraftmx/calcita/forms';

import {APPOINTMENT_KIND, createAppointment, deleteAppointment, listAppointments, moveAppointment} from '@/modules/appointments/appointmentsApi.js';

// el color de cada tipo de cita (un color del tema)
const TONE_BY_KIND = Object.freeze({[APPOINTMENT_KIND.delivery]: 'info', [APPOINTMENT_KIND.installation]: 'success', [APPOINTMENT_KIND.visit]: 'secondary'});
// un día completo viene sin hora («2026-10-20»)
const WHOLE_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Cuándo, en palabras: un día completo sin moverlo de zona (formatDate) o el día con su hora. */
const whenOf = (text) => (WHOLE_DAY_PATTERN.test(text) ? formatDate(text) : formatDateTime(text));

/** «Nueva cita» para los días u horas elegidos. */
const NewAppointmentDialog = ({range, onCreated, onClose}) => {
    const {t} = useToolkitTranslation('appointments');
    // el esquema se arma al pintar: yup toma sus mensajes al armarlo
    const schema = useMemo(() => Yup.object({customer: Yup.string().trim().required(), kind: Yup.string().required()}), []);
    const kindOptions = Object.values(APPOINTMENT_KIND).map((kind) => ({value: kind, label: t(`kinds.${kind}`)}));

    const save = async (values, formikHelpers) => {
        try {
            const response = await createAppointment({...values, start: range.start, end: range.end});
            toastSuccess(response.message);
            onCreated();
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <Dialog open={Boolean(range)} onClose={onClose} maxWidth="xs" fullWidth>
            <Formik initialValues={{customer: '', kind: APPOINTMENT_KIND.delivery}} validationSchema={schema} onSubmit={save}>
                <Form noValidate>
                    <DialogTitle>{t('new.title')}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2}>
                            <Typography variant="body2" color="text.secondary">{range && t('new.when', {start: whenOf(range.start)})}</Typography>
                            <FormProblemAlert />
                            <FormTextField name="customer" label={t('new.customer')} autoFocus />
                            <FormSelectField name="kind" label={t('new.kind')} options={kindOptions} />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>{t('common:actions.cancel')}</Button>
                        <SubmitButton size="medium">{t('new.save')}</SubmitButton>
                    </DialogActions>
                </Form>
            </Formik>
        </Dialog>
    );
};

export const AppointmentsPage = () => {
    const {t} = useToolkitTranslation('appointments');
    const [appointments, setAppointments] = useState([]);
    const [newRange, setNewRange] = useState(null);
    const [openAppointment, setOpenAppointment] = useState(null);

    const load = useCallback(() => listAppointments().then(setAppointments).catch(toastProblem), []);
    useEffect(() => {
        load();
    }, [load]);

    const events = appointments.map((appointment) => ({
        id: appointment.id, title: `${t(`kinds.${appointment.kind}`)} · ${appointment.customer}`, start: appointment.start, end: appointment.end,
        tone: TONE_BY_KIND[appointment.kind],
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

    const removeOpenAppointment = async () => {
        const response = await deleteAppointment(openAppointment.id);
        toastSuccess(response.message);
        setOpenAppointment(null);
        load();
    };

    return (
        <Stack spacing={3}>
            <PageHeading title={t('page.title')} description={t('page.description')} />
            <SectionCard title={t('calendar')}>
                <EventCalendar ariaLabel={t('calendar')} events={events} onDateSelect={setNewRange} onEventChange={move}
                               onEventClick={(eventId) => setOpenAppointment(appointments.find((appointment) => appointment.id === eventId))} />
            </SectionCard>

            <NewAppointmentDialog range={newRange} onClose={() => setNewRange(null)} onCreated={() => {
                setNewRange(null);
                load();
            }} />
            <Dialog open={Boolean(openAppointment)} onClose={() => setOpenAppointment(null)} maxWidth="xs" fullWidth>
                <DialogTitle>{openAppointment && `${t(`kinds.${openAppointment.kind}`)} · ${openAppointment.customer}`}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">{openAppointment && t('detail.when', {start: whenOf(openAppointment.start), end: whenOf(openAppointment.end)})}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button color="error" onClick={removeOpenAppointment}>{t('detail.delete')}</Button>
                    <Button variant="contained" onClick={() => setOpenAppointment(null)}>{t('detail.close')}</Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
};
