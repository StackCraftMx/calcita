// El aviso de arriba del formulario de formik: lo que el servidor dijo que no es de un campo (sin conexión, un 409, un 500)
// o el error de un campo que el formulario no tiene. applyServerProblem lo deja en el status de formik; aquí se pinta.
//
// Sin mensaje no pinta nada ni ocupa lugar.
//
// Se cambia desde el tema del proyecto: components.CalcitaFormProblemAlert con styleOverrides.root.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikContext} from 'formik';
import Alert from '@mui/material/Alert';
import {piecePart} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaFormProblemAlert): el estilo del proyecto va
// después del de MUI y el sx de la pantalla al final
const THEME_NAME = 'CalcitaFormProblemAlert';
const ProblemAlert = piecePart(THEME_NAME, 'Root', Alert);

/**
 * @param {{sx?: object}} props
 */
export default function FormProblemAlert({sx, ...unknownProps}) {
    warnUnknownProps('FormProblemAlert', unknownProps);
    const {status} = useFormikContext();

    // guard clause: sin aviso del servidor
    if (!status) {
        return null;
    }
    return <ProblemAlert severity="error" role="alert" sx={sx}>{status}</ProblemAlert>;
}
