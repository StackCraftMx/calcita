// Del error del servidor a los campos del formulario de Formik (validación de los dos lados).
//
// El backend responde RFC 9457 con dos tipos de queja:
//   - un 422 trae `errors` por campo ({email: ['...']}) y eso se pinta EN ese campo: un error de campo mostrado como
//     aviso obliga a adivinar cuál está mal;
//   - lo demás (401, 409, 429, 500) es del formulario entero y va al aviso (status de Formik).
// Si el campo del que se queja no existe en el formulario, el mensaje no se pierde: va al aviso.
//
// Función pura, no renderiza: function (regla de la casa).
import {formLevelMessageOf, splitServerFieldErrors} from '@/forms/serverProblemFields.js';
import {fieldErrorsOf} from '@/problems.js';

/**
 * @param {unknown} error normalmente un ApiError (trae problem y message ya traducidos)
 * @param {{setFieldError: Function, setStatus: Function, values: object}} formikHelpers
 */
export function applyServerProblem(error, {setFieldError, setStatus, values}) {
    const errorsByField = fieldErrorsOf(error?.problem);
    const formFieldNames = Object.keys(values ?? {});
    const {fieldErrors} = splitServerFieldErrors(errorsByField, formFieldNames);

    for (const [fieldName, message] of Object.entries(fieldErrors)) {
        setFieldError(fieldName, message);
    }
    setStatus(formLevelMessageOf(errorsByField, formFieldNames, error?.message));
}
