import {useState} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {ConfirmDialog, ContentDialog, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';

// qué diálogo está abierto: uno a la vez (Apple, «Sheets»: «Display only one sheet at a time»)
const DIALOGS = ['simple', 'confirm', 'destructive', 'form', 'long', 'reading'] as const;
type DialogKind = (typeof DIALOGS)[number] | 'none';
// los párrafos del contenido largo: los justos para que se deslice por dentro
const LONG_CONTENT_PARAGRAPHS = 8;

// «Cancelar» a la izquierda y la acción a la derecha (Apple, «Alerts»)
const DialogKinds = () => {
    const {t} = useToolkitTranslation('catalog');
    const [openDialog, setOpenDialog] = useState<DialogKind>('none');
    const [nickname, setNickname] = useState('');

    const close = () => setOpenDialog('none');
    // en una app de verdad, aquí va la acción; el ejemplo avisa y cierra
    const confirmAndClose = (message: string) => {
        toastSuccess(message);
        close();
    };
    const longParagraphs = Array.from({length: LONG_CONTENT_PARAGRAPHS}, (unused, index) => t('overlays.dialogs.longParagraph', {number: index + 1}));

    return (
        <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap'}}>
            {DIALOGS.map((kind) => (
                <Button key={kind} variant="outlined" onClick={() => setOpenDialog(kind)}>{t(`overlays.dialogs.kinds.${kind}`)}</Button>
            ))}

            <Dialog open={openDialog === 'simple'} onClose={close} aria-labelledby="simple-dialog-title">
                <DialogTitle id="simple-dialog-title">{t('overlays.dialogs.simpleTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{t('overlays.dialogs.simpleText')}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>{t('samples.cancel')}</Button>
                    <Button variant="contained" onClick={() => confirmAndClose(t('overlays.dialogs.published'))}>{t('samples.publish')}</Button>
                </DialogActions>
            </Dialog>

            {/* la confirmación del framework; tone="error" para lo que borra */}
            <ConfirmDialog open={openDialog === 'confirm'} title={t('overlays.dialogs.confirmTitle')} description={t('overlays.dialogs.confirmText')}
                           confirmLabel={t('samples.send')} onConfirm={() => confirmAndClose(t('overlays.dialogs.sent'))} onClose={close} />
            <ConfirmDialog open={openDialog === 'destructive'} tone="error" title={t('overlays.dialogs.destructiveTitle')}
                           description={t('overlays.dialogs.destructiveText')} confirmLabel={t('samples.delete')}
                           onConfirm={() => confirmAndClose(t('overlays.dialogs.deleted'))} onClose={close} />

            <Dialog open={openDialog === 'form'} onClose={close} aria-labelledby="form-dialog-title" fullWidth maxWidth="xs">
                <DialogTitle id="form-dialog-title">{t('overlays.dialogs.formTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{mb: 2}}>{t('overlays.dialogs.formText')}</DialogContentText>
                    <TextField autoFocus fullWidth label={t('overlays.dialogs.nickname')} value={nickname} onChange={(event) => setNickname(event.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>{t('samples.cancel')}</Button>
                    <Button variant="contained" disabled={!nickname.trim()} onClick={() => confirmAndClose(t('overlays.dialogs.saved'))}>
                        {t('samples.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* scroll="paper": se desliza por dentro y los botones se quedan a la vista */}
            <Dialog open={openDialog === 'long'} onClose={close} scroll="paper" aria-labelledby="long-dialog-title">
                <DialogTitle id="long-dialog-title">{t('overlays.dialogs.longTitle')}</DialogTitle>
                <DialogContent dividers>
                    {longParagraphs.map((paragraph) => <DialogContentText key={paragraph} sx={{mb: 2}}>{paragraph}</DialogContentText>)}
                </DialogContent>
                <DialogActions>
                    <Button onClick={close}>{t('samples.cancel')}</Button>
                    <Button variant="contained" onClick={() => confirmAndClose(t('overlays.dialogs.accepted'))}>{t('samples.accept')}</Button>
                </DialogActions>
            </Dialog>

            {/* la hoja de lectura: sólida, para leer con calma */}
            <ContentDialog open={openDialog === 'reading'} onClose={close} title={t('overlays.dialogs.readingTitle')}>
                <Typography sx={{mb: 2}}>{t('overlays.dialogs.readingText')}</Typography>
                {longParagraphs.map((paragraph) => <Typography key={paragraph} color="text.secondary" sx={{mb: 2}}>{paragraph}</Typography>)}
            </ContentDialog>
        </Stack>
    );
};

export default DialogKinds;
