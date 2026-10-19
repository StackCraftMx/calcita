// La ventana para agendar o editar una cita: de qué es, su tipo, el día con sus horas, dónde, la liga de la reunión en
// línea, los invitados, el recordatorio y notas. Formik con los campos de la casa; si el servidor rechaza un campo (la hora de
// fin antes que la de inicio, una liga que no es web), el error sale en su campo; si es domingo, en el aviso de arriba.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import {FormSection, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {FormDateField} from '@stackcraftmx/calcita/date-pickers';
import {
    Form, FormCatalogField, FormProblemAlert, FormSelectField, FormTextField, Formik, SubmitButton, Yup, applyServerProblem,
} from '@stackcraftmx/calcita/forms';

import {APPOINTMENT_KIND, saveAppointment} from '@/modules/appointments/appointmentsApi.js';

// las horas que se ofrecen, cada media hora de 7:00 a 21:00 (el horario de la tienda con margen)
const FIRST_HOUR = 7;
const LAST_HOUR = 21;
const TIME_OPTIONS = Object.freeze(Array.from({length: (LAST_HOUR - FIRST_HOUR) * 2 + 1}, (_, index) => {
    const minutes = FIRST_HOUR * 60 + index * 30;
    const time = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    return {value: time, label: time};
}));
// los recordatorios que se ofrecen, en minutos antes ('' = sin recordatorio)
const REMINDER_MINUTES = Object.freeze([10, 30, 60, 1440]);
const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '10:00';
const TITLE_MAX_LENGTH = 120;

/** La hora HH:MM de lo que manda el calendario, si la trae y está entre las que se ofrecen. */
const timeOf = (isoText, fallback) => {
    const time = /T(\d{2}:\d{2})/.exec(isoText ?? '')?.[1];
    return TIME_OPTIONS.some((option) => option.value === time) ? time : fallback;
};

/**
 * @param {object} props
 * @param {{appointment?: object, range?: {start: string, end: string}}|null} props.draft la cita a editar o el rango elegido en
 *     el calendario para una nueva (null: cerrada)
 * @param {Array<{id: string, name: string}>} props.people a quiénes se puede invitar
 * @param {() => void} props.onClose
 * @param {() => void} props.onSaved
 */
export const AppointmentDialog = ({draft, people, onClose, onSaved}) => {
    const {t} = useToolkitTranslation('appointments');
    // el esquema se arma al pintar: yup toma sus mensajes (ya traducidos) al armarlo
    const schema = useMemo(() => Yup.object({
        title: Yup.string().trim().required().max(TITLE_MAX_LENGTH),
        kind: Yup.string().required(),
        date: Yup.string().required(),
        meetingUrl: Yup.string().trim().url(),
    }), []);

    if (!draft) {
        return null;
    }
    const {appointment, range} = draft;
    const start = appointment?.start ?? range?.start;
    const end = appointment?.end ?? range?.end;
    const initialValues = {
        title: appointment?.title ?? '', kind: appointment?.kind ?? APPOINTMENT_KIND.delivery, date: (start ?? '').slice(0, 10),
        startTime: timeOf(start, DEFAULT_START_TIME), endTime: timeOf(end, DEFAULT_END_TIME), location: appointment?.location ?? '',
        meetingUrl: appointment?.meetingUrl ?? '', attendeeIds: appointment?.attendees.map((attendee) => attendee.id) ?? [],
        reminderMinutes: appointment?.reminderMinutes ?? '', notes: appointment?.notes ?? '',
    };

    const save = async (values, formikHelpers) => {
        const {date, startTime, endTime, reminderMinutes, ...fields} = values;
        try {
            const response = await saveAppointment(appointment?.id, {
                ...fields, start: `${date}T${startTime}:00`, end: `${date}T${endTime}:00`,
                reminderMinutes: reminderMinutes === '' ? null : Number(reminderMinutes),
            });
            toastSuccess(response.message);
            onSaved();
        } catch (error) {
            // la hora de fin la revisa el servidor como «end»: su error sale en el aviso de arriba con su texto
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="appointment-dialog-title">
            <Formik initialValues={initialValues} validationSchema={schema} onSubmit={save}>
                <Form noValidate>
                    <DialogTitle id="appointment-dialog-title">{appointment ? t('dialog.editTitle') : t('dialog.newTitle')}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2.5}>
                            <FormProblemAlert />
                            <FormSection>
                                <FormTextField name="title" label={t('dialog.title')} placeholder={t('dialog.titlePlaceholder')} autoFocus />
                                <FormSelectField name="kind" label={t('dialog.kind')}
                                                 options={Object.values(APPOINTMENT_KIND).map((kind) => ({value: kind, label: t(`kinds.${kind}`)}))} />
                            </FormSection>
                            <FormSection title={t('dialog.whenSection')}>
                                <FormDateField name="date" label={t('dialog.date')} />
                                <FormSelectField name="startTime" label={t('dialog.startTime')} options={TIME_OPTIONS} />
                                <FormSelectField name="endTime" label={t('dialog.endTime')} options={TIME_OPTIONS} />
                                <FormSelectField name="reminderMinutes" label={t('dialog.reminder')}
                                                 options={[{value: '', label: t('dialog.noReminder')}, ...REMINDER_MINUTES.map((minutes) => ({value: minutes, label: t(`dialog.reminderOptions.${minutes}`)}))]} />
                            </FormSection>
                            <FormSection title={t('dialog.whereSection')} footer={t('dialog.whereFooter')}>
                                <FormTextField name="location" label={t('dialog.location')} placeholder={t('dialog.locationPlaceholder')} />
                                <FormTextField name="meetingUrl" label={t('dialog.meetingUrl')} type="url" placeholder="https://meet.example.com/…" />
                            </FormSection>
                            <FormSection>
                                <FormCatalogField name="attendeeIds" label={t('dialog.attendees')} multiple placeholder={t('dialog.attendeesPlaceholder')}
                                                  options={people.map((person) => ({code: person.id, label: person.name}))} formatLabel={(option) => option.label} />
                                <FormTextField name="notes" label={t('dialog.notes')} multiline minRows={2} />
                            </FormSection>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>{t('dialog.cancel')}</Button>
                        <SubmitButton size="medium">{appointment ? t('dialog.save') : t('dialog.schedule')}</SubmitButton>
                    </DialogActions>
                </Form>
            </Formik>
        </Dialog>
    );
};
