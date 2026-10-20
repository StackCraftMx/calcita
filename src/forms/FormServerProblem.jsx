// Puente entre una máquina de estados y Formik: pinta en sus campos los errores 422 que trae el error del servidor.
//
// Por qué existe: con XState el envío lo hace la máquina (no el onSubmit de Formik), así que el error llega en el
// contexto de la máquina y no en los helpers de Formik. Este componente vive DENTRO del <Formik> y, cada vez que
// llega un error nuevo, lo reparte en los campos que existen. El aviso de arriba lo pinta la pantalla desde el estado
// de la máquina (formLevelMessageOf).
//
// Genérico del paquete: function (regla de la casa).
import {useEffect} from 'react';
import {useFormikContext} from 'formik';

import {splitServerFieldErrors} from '@/forms/serverProblemFields.js';
import {fieldErrorsOf} from '@/problems.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {{error: (Error & {problem?: object})|null}} props el error del contexto de la máquina (null = sin error)
 */
export default function FormServerProblem({error, ...unknownProps}) {
    warnUnknownProps('FormServerProblem', unknownProps);
    const {setFieldError, setFieldTouched, values} = useFormikContext();

    useEffect(() => {
        // guard clause: sin error nuevo no hay nada que pintar
        if (!error) {
            return;
        }
        const {fieldErrors} = splitServerFieldErrors(fieldErrorsOf(error.problem), Object.keys(values));
        for (const [fieldName, message] of Object.entries(fieldErrors)) {
            // tocado primero y sin validar: si no, la validación de yup borraría el error del servidor al instante
            setFieldTouched(fieldName, true, false);
            setFieldError(fieldName, message);
        }
        // OJO: solo cuando cambia el error; values cambia con cada tecla y no debe volver a pintar el error viejo
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error]);

    return null;
}
