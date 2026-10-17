// Botón de enviar de un formulario de Formik.
//
// Se deshabilita mientras el envío está en curso y muestra su propio indicador: un doble clic en un botón que no se
// bloquea manda dos peticiones (dos intentos de login contra el límite por IP).
//
// isPending: cuando el envío lo hace una máquina de estados (XState) y no el onSubmit async de Formik, la pantalla
// pasa aquí si la máquina está en su estado de envío. La máquina además IGNORA un segundo envío en ese estado: el botón
// deshabilitado es la cortesía, la máquina es la garantía.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikContext} from 'formik';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * @param {{children: import('react').ReactNode, disabled?: boolean, isPending?: boolean}} props
 */
export default function SubmitButton({children, disabled, isPending, ...buttonProps}) {
    const {isSubmitting} = useFormikContext();
    const isBusy = Boolean(isPending ?? isSubmitting);

    return (
        <Button type="submit" variant="contained" size="large" disabled={disabled || isBusy} aria-busy={isBusy} {...buttonProps}>
            {isBusy ? <CircularProgress size={22} color="inherit" /> : children}
        </Button>
    );
}
