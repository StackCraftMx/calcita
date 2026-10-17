// Reparte los errores por campo de un 422 entre los campos que EXISTEN en el formulario y los que no.
//
// Lo que no tiene campo no se pierde: va al aviso de arriba del formulario. Un error invisible es peor que uno mal
// colocado.
//
// Función pura sin imports (se prueba con node --test en serverProblemFields.test.js); la usan applyServerProblem y
// las pantallas que pintan el aviso desde su máquina de estados.

/**
 * @param {Record<string, string[]>} errorsByField lo que regresa fieldErrorsOf(problem)
 * @param {string[]} formFieldNames campos del formulario (Object.keys de sus valores iniciales)
 * @returns {{fieldErrors: Record<string, string>, unassignedMessages: string[]}}
 */
export function splitServerFieldErrors(errorsByField, formFieldNames) {
    const fieldErrors = {};
    const unassignedMessages = [];

    for (const [fieldName, messages] of Object.entries(errorsByField ?? {})) {
        if (formFieldNames.includes(fieldName)) {
            fieldErrors[fieldName] = messages.join(' ');
        } else {
            unassignedMessages.push(...messages);
        }
    }

    return {fieldErrors, unassignedMessages};
}

/**
 * Mensaje del aviso de arriba: lo que quedó sin campo, o el mensaje general si el error no trae errores por campo.
 * Si todo cayó en sus campos, no se repite arriba (null).
 *
 * @param {Record<string, string[]>} errorsByField
 * @param {string[]} formFieldNames
 * @param {string|null|undefined} generalMessage el message del ApiError (ya traducido)
 * @returns {string|null}
 */
export function formLevelMessageOf(errorsByField, formFieldNames, generalMessage) {
    const {unassignedMessages} = splitServerFieldErrors(errorsByField, formFieldNames);
    if (unassignedMessages.length > 0) {
        return unassignedMessages.join(' ');
    }
    const hasFieldErrors = Object.keys(errorsByField ?? {}).length > 0;
    return hasFieldErrors ? null : (generalMessage || null);
}
