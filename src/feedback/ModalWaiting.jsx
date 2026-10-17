// Bloqueo general "espere un momento" como diálogo modal, para una acción que no se puede interrumpir (p. ej. generar
// un archivo grande).
//
// OJO zIndex: HASTA ARRIBA de todo, encima de modal (1300), snackbar (1400) y tooltip (1500), para que ningún elemento
// de la interfaz se le monte mientras bloquea. No se cierra con Escape a propósito.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

/**
 * @param {{open: boolean, title?: string, text?: string}} props textos ya traducidos; por defecto los de common:waiting
 */
export default function ModalWaiting({open, title, text}) {
    const {t} = useToolkitTranslation('common');

    return (
        <Dialog open={open} disableEscapeKeyDown aria-busy="true" sx={{zIndex: (theme) => theme.zIndex.tooltip + 10}}>
            <DialogTitle sx={{textAlign: 'center'}}>{title ?? t('waiting.title')}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{alignItems: 'center'}}>
                    <CircularProgress size={28} />
                    <DialogContentText sx={{textAlign: 'center'}}>{text ?? t('waiting.text')}</DialogContentText>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
