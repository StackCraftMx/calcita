// El aviso de arriba del formulario de react-hook-form: lo que el servidor dijo que no es de un campo. applyServerProblem
// lo deja en errors.root.server; aquí se pinta. Sin mensaje no pinta nada ni ocupa lugar.
//
// Genérico del paquete: function (regla de la casa).
import {useFormContext, useFormState} from 'react-hook-form';
import Alert from '@mui/material/Alert';

/**
 * @param {{control?: object, sx?: object}} props control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormProblemAlert({control, sx}) {
    const formContext = useFormContext();
    const {errors} = useFormState({control: control ?? formContext?.control});
    const message = errors.root?.server?.message;

    // guard clause: sin aviso del servidor
    if (!message) {
        return null;
    }
    return <Alert severity="error" role="alert" sx={sx}>{message}</Alert>;
}
