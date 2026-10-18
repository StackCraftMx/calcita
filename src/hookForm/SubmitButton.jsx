// Botón de enviar de react-hook-form: se bloquea y muestra su indicador mientras se envía (un doble clic no manda dos
// peticiones). Mismo look que el SubmitButton de formik.
//
// Genérico del paquete: function (regla de la casa).
import {useFormContext, useFormState} from 'react-hook-form';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.isPending] cuando el envío lo lleva una máquina de estados y no el handleSubmit
 * @param {object} [props.control] el de useForm, si la pantalla no usa FormProvider
 * @param {object} [props.sx] (y lo demás del Button de MUI: size, fullWidth, startIcon…)
 * @param {'small'|'medium'|'large'} [props.size]
 * @param {boolean} [props.fullWidth]
 * @param {import('react').ReactNode} [props.startIcon]
 */
export default function SubmitButton({children, disabled, isPending, control, ...buttonProps}) {
    const formContext = useFormContext();
    const {isSubmitting} = useFormState({control: control ?? formContext?.control});
    const isBusy = Boolean(isPending ?? isSubmitting);

    return (
        <Button type="submit" variant="contained" size="large" disabled={disabled || isBusy} aria-busy={isBusy} {...buttonProps}>
            {isBusy ? <CircularProgress size={22} color="inherit" /> : children}
        </Button>
    );
}
