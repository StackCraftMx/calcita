// Redactar un mensaje, como Gmail: Para (uno o varios, separados por coma), Cc y Cco al picar «Cc y Cco», asunto, texto y
// archivos adjuntos. Responder, responder a todos y reenviar llegan con todo ya puesto (draft). Cerrar con algo escrito lo
// guarda en Borradores; «Tirar» lo borra. Al mandar, la pantalla enseña «Deshacer» unos segundos.
//
// Los archivos son de mentira: se toma su nombre y su peso, no se suben (en su proyecto, uploadWithProgress o su API).
// Los errores del servidor van a su campo.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useMemo, useRef, useState} from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {formatFileSize, toastProblem, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {
    Form, FormProblemAlert, FormTextField, Formik, SubmitButton, Yup, applyServerProblem, useFormikContext,
} from '@stackcraftmx/calcita/forms';

import {discardDraft, saveDraft, sendMessage} from '@/modules/mail/mailApi.js';

// los renglones del mensaje al abrir el diálogo
const BODY_MIN_ROWS = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// lo que se revisa para saber si hay algo escrito (y vale la pena guardarlo como borrador)
const DRAFT_FIELDS = Object.freeze(['to', 'cc', 'bcc', 'subject', 'body']);

/** ¿Todas las direcciones del campo son correos? (vacío también vale: el campo obligatorio lo revisa required) */
const areEmails = (text) => (text ?? '').split(/[,;]/).map((address) => address.trim()).filter(Boolean).every((address) => EMAIL_PATTERN.test(address));

/** Guarda lo último escrito en el ref de afuera (para el borrador al cerrar): no pinta nada. */
const KeepLatestValues = ({target}) => {
    const {values} = useFormikContext();
    useEffect(() => {
        target.current = values;
    }, [target, values]);
    return null;
};

/**
 * @param {object} props
 * @param {{to?: string, cc?: string, bcc?: string, subject?: string, body?: string, attachments?: Array<{name: string, size: string}>, conversationId?: string, draftId?: string, mode?: 'new'|'reply'|'replyAll'|'forward', isRestored?: boolean}|null} props.draft
 *     lo que llega ya puesto; null: cerrado. isRestored: regresó de «Deshacer» (al cerrar se guarda aunque no cambie)
 * @param {() => void} props.onClose
 * @param {(sent: object, values: object) => void} props.onSent lo que regresó el servidor (para «Deshacer») y lo que se escribió
 * @param {() => void} props.onDraftChange se guardó o se tiró un borrador (la lista se pone al día)
 */
export const ComposeDialog = ({draft, onClose, onSent, onDraftChange}) => {
    const {t} = useToolkitTranslation('mail');
    const [showsCopies, setShowsCopies] = useState(Boolean(draft?.cc || draft?.bcc));
    const [attachments, setAttachments] = useState(draft?.attachments ?? []);
    const fileInput = useRef(null);
    // lo último escrito, para guardarlo como borrador al cerrar
    const latestValues = useRef(null);
    // el esquema se arma al pintar: yup toma sus mensajes (ya traducidos) al armarlo
    const schema = useMemo(() => Yup.object({
        to: Yup.string().trim().required().test('emails', t('compose.emailsInvalid'), areEmails),
        cc: Yup.string().test('emails', t('compose.emailsInvalid'), areEmails),
        bcc: Yup.string().test('emails', t('compose.emailsInvalid'), areEmails),
        subject: Yup.string().trim().required(),
    }), [t]);

    if (!draft) {
        return null;
    }

    const initialValues = {to: draft.to ?? '', cc: draft.cc ?? '', bcc: draft.bcc ?? '', subject: draft.subject ?? '', body: draft.body ?? ''};

    const send = async (values, formikHelpers) => {
        try {
            const sent = await sendMessage({...values, attachments, conversationId: draft.conversationId, draftId: draft.draftId});
            onSent(sent, {...draft, ...values, attachments});
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    // cerrar: se guarda en Borradores lo que se escribió, lo que regresó de «Deshacer» y un borrador que se volvió a abrir.
    // Una respuesta que se abrió y se cerró sin tocar no deja borrador (ya traía la cita puesta)
    const closeAndKeep = async () => {
        const values = latestValues.current ?? initialValues;
        const hasContent = DRAFT_FIELDS.some((field) => values[field]?.trim());
        const hasChanges = DRAFT_FIELDS.some((field) => values[field] !== initialValues[field]);
        onClose();
        if (hasContent && (hasChanges || draft.isRestored || draft.draftId)) {
            try {
                toastSuccess((await saveDraft({...values, draftId: draft.draftId})).message);
                onDraftChange();
            } catch (error) {
                toastProblem(error);
            }
        }
    };
    const discard = async () => {
        onClose();
        if (draft.draftId) {
            toastSuccess((await discardDraft(draft.draftId)).message);
            onDraftChange();
        }
    };

    return (
        <Dialog open onClose={closeAndKeep} maxWidth="md" fullWidth aria-labelledby="compose-dialog-title">
            <Formik initialValues={initialValues} validationSchema={schema} onSubmit={send}>
                <Form noValidate>
                    <KeepLatestValues target={latestValues} />
                    <DialogTitle id="compose-dialog-title">{t(`compose.titles.${draft.mode ?? 'new'}`)}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2}>
                            <FormProblemAlert />
                            <Stack direction="row" spacing={1} sx={{alignItems: 'flex-start'}}>
                                <FormTextField name="to" label={t('compose.to')} placeholder={t('compose.toPlaceholder')} autoFocus={!draft.to} />
                                {!showsCopies && <Button size="small" onClick={() => setShowsCopies(true)} sx={{mt: 3.5, flexShrink: 0}}>{t('compose.showCopies')}</Button>}
                            </Stack>
                            {showsCopies && <FormTextField name="cc" label={t('compose.cc')} />}
                            {showsCopies && <FormTextField name="bcc" label={t('compose.bcc')} helperText={t('compose.bccHint')} />}
                            <FormTextField name="subject" label={t('compose.subject')} />
                            <FormTextField name="body" label={t('compose.body')} multiline minRows={BODY_MIN_ROWS} autoFocus={Boolean(draft.to)} />
                            {attachments.length > 0 && (
                                <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap'}} aria-label={t('compose.attachments')} role="group">
                                    {attachments.map((attachment) => (
                                        <Chip key={attachment.name} icon={<AttachFileRoundedIcon />} label={`${attachment.name} · ${attachment.size}`}
                                              onDelete={() => setAttachments((current) => current.filter((item) => item.name !== attachment.name))} />
                                    ))}
                                </Stack>
                            )}
                            {/* el selector de archivos del sistema, escondido: lo abre el clip */}
                            <input ref={fileInput} type="file" multiple hidden aria-hidden="true"
                                   onChange={(event) => {
                                       const picked = [...event.target.files].map((file) => ({name: file.name, size: formatFileSize(file.size)}));
                                       setAttachments((current) => [...current.filter((item) => !picked.some((file) => file.name === item.name)), ...picked]);
                                       event.target.value = '';
                                   }} />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Tooltip title={t('compose.discard')}>
                            <IconButton aria-label={t('compose.discard')} onClick={discard}><DeleteOutlineIcon /></IconButton>
                        </Tooltip>
                        <Tooltip title={t('compose.attach')}>
                            <IconButton aria-label={t('compose.attach')} onClick={() => fileInput.current?.click()}><AttachFileRoundedIcon /></IconButton>
                        </Tooltip>
                        <Stack direction="row" spacing={1} sx={{ml: 'auto'}}>
                            <Button onClick={closeAndKeep}>{t('compose.saveAndClose')}</Button>
                            <SubmitButton size="medium">{t('compose.send')}</SubmitButton>
                        </Stack>
                    </DialogActions>
                </Form>
            </Formik>
        </Dialog>
    );
};
