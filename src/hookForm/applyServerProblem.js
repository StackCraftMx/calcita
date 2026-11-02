// Del error del servidor (RFC 9457) a react-hook-form, con las mismas reglas que el applyServerProblem de formik:
//   - el 422 trae `errors` por campo y cada uno se pinta EN su campo (setError); el de un campo dentro de un renglón que el
//     formulario tiene ('contacts.2.email', FormRepeatingFields) va a ese renglón;
//   - lo que no es de un campo (401, 409, 500, sin conexión) o el error de un campo que el formulario no tiene va al aviso
//     de arriba: errors.root.server, que pinta FormProblemAlert.
//
//   const form = useForm({...});
//   const submit = form.handleSubmit(async (values) => {
//       try { await api.save(values); } catch (error) { applyServerProblem(error, form); }
//   });
//
// Función pura, no renderiza: function (regla de la casa).
import {formLevelMessageOf, splitRowFieldErrors, splitServerFieldErrors} from '@/forms/serverProblemFields.js';
import {fieldErrorsOf} from '@/problems.js';

/** Dónde queda el aviso de arriba en los errores de react-hook-form. */
export const SERVER_PROBLEM_ROOT = 'root.server';
const SERVER_ERROR_TYPE = 'server';

/**
 * @param {unknown} error normalmente un ApiError (trae problem y message ya traducidos)
 * @param {{setError: Function, getValues: Function}} form lo que regresa useForm
 */
export function applyServerProblem(error, {setError, getValues}) {
    // primero los de un renglón ('contacts.2.email'), con su ruta completa; los demás, como siempre
    const {rowFieldErrors, otherErrors} = splitRowFieldErrors(error?.problem?.errors, (path) => getValues(path) !== undefined);
    for (const [path, message] of Object.entries(rowFieldErrors)) {
        setError(path, {type: SERVER_ERROR_TYPE, message}, {shouldFocus: false});
    }
    const errorsByField = fieldErrorsOf(error?.problem ? {...error.problem, errors: otherErrors} : null);
    const formFieldNames = Object.keys(getValues() ?? {});
    const {fieldErrors} = splitServerFieldErrors(errorsByField, formFieldNames);

    for (const [fieldName, message] of Object.entries(fieldErrors)) {
        setError(fieldName, {type: SERVER_ERROR_TYPE, message}, {shouldFocus: false});
    }

    // si todo cayó en renglones, tampoco se repite arriba
    const hasOnlyRowErrors = Object.keys(rowFieldErrors).length > 0 && Object.keys(errorsByField).length === 0;
    const formLevelMessage = hasOnlyRowErrors ? null : formLevelMessageOf(errorsByField, formFieldNames, error?.message);
    if (formLevelMessage) {
        setError(SERVER_PROBLEM_ROOT, {type: SERVER_ERROR_TYPE, message: formLevelMessage});
    }
}
