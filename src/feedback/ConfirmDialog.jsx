// Diálogo de confirmación: toda acción que cambia algo, manda un correo o descarga un archivo pasa por aquí antes de
// ejecutarse (regla de tablas). Dice en lenguaje ciudadano QUÉ va a pasar y a QUÉ renglón («¿Dar de baja a Ana López?
// Ya no podrá entrar; se puede reactivar después»).
//
// Recibe el estado de la petición por props (pending, error) en vez de hacerla él: core no conoce el API. Lo normal es
// alimentarlo con useConfirmAction (máquina confirmActionMachine), que ya garantiza que cancelar no ejecuta y que un
// doble clic no manda dos peticiones. Mientras la petición está en curso no se puede cerrar ni volver a confirmar.
//
// children: lo que el diálogo necesita pedir antes de confirmar (p. ej. el motivo de una baja), debajo del texto.
//
// Genérico del paquete: function (regla de la casa).
import {useId} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title texto ya traducido, con el renglón («¿Dar de baja a Ana López?»)
 * @param {import('react').ReactNode} [props.description] qué va a pasar, en palabras normales
 * @param {string} [props.confirmLabel]
 * @param {string} [props.cancelLabel]
 * @param {'primary'|'error'|'warning'} [props.tone]
 * @param {boolean} [props.isPending]
 * @param {boolean} [props.isConfirmDisabled] la acción ya no aplica (p. ej. conflicto: el registro cambió)
 * @param {string|null} [props.errorMessage] mensaje ya traducido (ApiError.message)
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onClose
 * @param {import('react').ReactNode} [props.children]
 */
export default function ConfirmDialog({
    open, title, description, confirmLabel, cancelLabel, tone = 'primary',
    isPending = false, isConfirmDisabled = false, errorMessage = null, onConfirm, onClose, children,
}) {
    const {t} = useToolkitTranslation('common');
    // ids propios: una pantalla puede tener varios diálogos montados y los aria-* no deben apuntar al de otro
    const dialogId = useId();

    const handleClose = () => {
        // guard clause: no se cierra a media petición
        if (isPending) {
            return;
        }
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
                aria-labelledby={`${dialogId}-title`} aria-describedby={`${dialogId}-description`}>
            <DialogTitle id={`${dialogId}-title`}>{title}</DialogTitle>
            <DialogContent>
                {errorMessage && <Alert severity="error" role="alert" sx={{mb: 2}}>{errorMessage}</Alert>}
                {description && (
                    <DialogContentText id={`${dialogId}-description`}>{description}</DialogContentText>
                )}
                {children}
            </DialogContent>
            <DialogActions sx={{px: 3, pb: 2.5}}>
                <Button variant="outlined" color="inherit" onClick={handleClose} disabled={isPending}>
                    {cancelLabel ?? t('actions.cancel')}
                </Button>
                <Button variant="contained" color={tone} onClick={onConfirm} disabled={isPending || isConfirmDisabled}
                        aria-busy={isPending}>
                    {isPending ? <CircularProgress size={20} color="inherit" /> : (confirmLabel ?? t('actions.confirm'))}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
