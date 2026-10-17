// Del error del servidor (RFC 9457) a react-hook-form, con las mismas reglas que el applyServerProblem de formik:
//   - el 422 trae `errors` por campo y cada uno se pinta EN su campo (setError);
//   - lo que no es de un campo (401, 409, 500, sin conexión) o el error de un campo que el formulario no tiene va al aviso
//     de arriba: errors.root.server, que pinta FormProblemAlert.
//
//   const form = useForm({...});
//   const submit = form.handleSubmit(async (values) => {
//       try { await api.save(values); } catch (error) { applyServerProblem(error, form); }
//   });
//
// Función pura, no renderiza: function (regla de la casa).
import {formLevelMessageOf, splitServerFieldErrors} from '@/forms/serverProblemFields.js';
import {fieldErrorsOf} from '@/problems.js';

/** Dónde queda el aviso de arriba en los errores de react-hook-form. */
export const SERVER_PROBLEM_ROOT = 'root.server';
const SERVER_ERROR_TYPE = 'server';

/**
 * @param {Error & {problem?: object}} error normalmente un ApiError (trae problem y message ya traducidos)
 * @param {{setError: Function, getValues: Function}} form lo que regresa useForm
 */
export function applyServerProblem(error, {setError, getValues}) {
    const errorsByField = fieldErrorsOf(error?.problem);
    const formFieldNames = Object.keys(getValues() ?? {});
    const {fieldErrors} = splitServerFieldErrors(errorsByField, formFieldNames);

    for (const [fieldName, message] of Object.entries(fieldErrors)) {
        setError(fieldName, {type: SERVER_ERROR_TYPE, message}, {shouldFocus: false});
    }

    const formLevelMessage = formLevelMessageOf(errorsByField, formFieldNames, error?.message);
    if (formLevelMessage) {
        setError(SERVER_PROBLEM_ROOT, {type: SERVER_ERROR_TYPE, message: formLevelMessage});
    }
}
