// El texto de un error de validación en el idioma activo. Aparte de validation.js a propósito: no importa yup, así lo usan
// los campos sueltos de la puerta principal (inputs/) sin cargar yup en un proyecto que no valida con él.
//
// Función pura, no renderiza: function (regla de la casa).

/**
 * Texto de un error de validación en el idioma activo.
 * Acepta las dos formas que llegan: {key, values} de yup (buildYupLocale), o un texto ya traducido (los del backend).
 *
 * @param {(key: string, values?: object) => string} translate el t de useToolkitTranslation
 * @param {string|{key: string, values?: object}|undefined|null} error
 * @returns {string|undefined}
 */
export function translateValidationMessage(translate, error) {
    if (!error) {
        return undefined;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (typeof error === 'object' && error.key) {
        return translate(error.key, error.values);
    }
    return String(error);
}
