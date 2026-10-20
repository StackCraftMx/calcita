// El aviso de arriba del formulario de react-hook-form: lo que el servidor dijo que no es de un campo. applyServerProblem
// lo deja en errors.root.server; aquí se pinta. Sin mensaje no pinta nada ni ocupa lugar.
//
// Se cambia desde el tema del proyecto: components.CalcitaFormProblemAlert con styleOverrides.root.
//
// Genérico del paquete: function (regla de la casa).
import {useFormContext, useFormState} from 'react-hook-form';
import Alert from '@mui/material/Alert';
import {piecePart} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaFormProblemAlert): el estilo del proyecto va
// después del de MUI y el sx de la pantalla al final
const THEME_NAME = 'CalcitaFormProblemAlert';
const ProblemAlert = piecePart(THEME_NAME, 'Root', Alert);

/**
 * @param {{control?: object, sx?: object}} props control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormProblemAlert({control, sx, ...unknownProps}) {
    warnUnknownProps('FormProblemAlert', unknownProps);
    const formContext = useFormContext();
    const {errors} = useFormState({control: control ?? formContext?.control});
    const message = errors.root?.server?.message;

    // guard clause: sin aviso del servidor
    if (!message) {
        return null;
    }
    return <ProblemAlert severity="error" role="alert" sx={sx}>{message}</ProblemAlert>;
}
