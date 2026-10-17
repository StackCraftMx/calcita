// El aviso de arriba del formulario de formik: lo que el servidor dijo que no es de un campo (sin conexión, un 409, un 500)
// o el error de un campo que el formulario no tiene. applyServerProblem lo deja en el status de formik; aquí se pinta.
//
// Sin mensaje no pinta nada ni ocupa lugar.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikContext} from 'formik';
import Alert from '@mui/material/Alert';

/**
 * @param {{sx?: object}} props
 */
export default function FormProblemAlert({sx}) {
    const {status} = useFormikContext();

    // guard clause: sin aviso del servidor
    if (!status) {
        return null;
    }
    return <Alert severity="error" role="alert" sx={sx}>{status}</Alert>;
}
