// Redactar un mensaje (o responder uno: llega con «Para» y «Asunto» ya puestos). Los errores del servidor van a su campo.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import {toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {Form, FormProblemAlert, FormTextField, Formik, SubmitButton, Yup, applyServerProblem} from '@stackcraftmx/calcita/forms';

import {sendMessage} from '@/modules/mail/mailApi.js';

// los renglones del mensaje al abrir el diálogo
const BODY_MIN_ROWS = 6;

/**
 * @param {object} props
 * @param {{to: string, subject: string}|null} props.draft null: cerrado
 * @param {() => void} props.onClose
 * @param {() => void} props.onSent
 */
export const ComposeDialog = ({draft, onClose, onSent}) => {
    const {t} = useToolkitTranslation('mail');
    // el esquema se arma al pintar: yup toma sus mensajes al armarlo
    const schema = useMemo(() => Yup.object({to: Yup.string().trim().required().email(), subject: Yup.string().trim().required()}), []);

    const send = async (values, formikHelpers) => {
        try {
            const response = await sendMessage(values);
            toastSuccess(response.message);
            onSent();
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <Dialog open={Boolean(draft)} onClose={onClose} maxWidth="sm" fullWidth>
            <Formik initialValues={{to: draft?.to ?? '', subject: draft?.subject ?? '', body: ''}} validationSchema={schema} onSubmit={send} enableReinitialize>
                <Form noValidate>
                    <DialogTitle>{draft?.subject ? t('compose.replyTitle') : t('compose.title')}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2}>
                            <FormProblemAlert />
                            <FormTextField name="to" label={t('compose.to')} type="email" autoFocus={!draft?.to} />
                            <FormTextField name="subject" label={t('compose.subject')} />
                            <FormTextField name="body" label={t('compose.body')} multiline minRows={BODY_MIN_ROWS} autoFocus={Boolean(draft?.to)} />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>{t('common:actions.cancel')}</Button>
                        <SubmitButton size="medium">{t('compose.send')}</SubmitButton>
                    </DialogActions>
                </Form>
            </Formik>
        </Dialog>
    );
};
