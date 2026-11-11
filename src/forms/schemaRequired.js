// Si el esquema de yup del formulario pide un campo: lo lee el campo de formik para ponerle su asterisco cuando el proyecto
// lo prende (ToolkitProvider requiredFromSchema). Así el esquema manda y la pantalla no repite a mano cuáles son
// obligatorios (un paso de 33 campos tenía 23).
//
// Cuenta como obligatorio lo que yup describe como no opcional: .required() y .defined(); y una lista con .min(1) o más,
// porque pide al menos uno. Las condiciones (.when) se resuelven con los valores de ese momento: un RFC que solo se pide a
// una empresa lleva su asterisco solo cuando se elige empresa.
//
// Sin importar yup: camina el esquema por lo que todos los de yup traen (fields de un objeto, innerType de una lista,
// resolve y describe). Así /date-pickers y /rich-text no le piden yup al proyecto que no lo usa.
//
// Funciones puras, sin React.

/**
 * Las partes de un nombre de campo de formik: 'contacts.2.email' y 'contacts[2].email' dan ['contacts', '2', 'email'].
 *
 * @param {string} name
 * @returns {string[]}
 */
export function fieldPathOf(name) {
    return name.replace(/\[(\d+)]/g, '.$1').split('.').filter(Boolean);
}

/**
 * @param {object} description lo que da describe() de un esquema de yup
 * @returns {boolean}
 */
function describesRequired(description) {
    if (description.optional === false) {
        return true;
    }
    // una lista con .min(1) pide al menos uno aunque yup la llame opcional
    return description.type === 'array' && (description.tests ?? []).some((test) => test.name === 'min' && Number(test.params?.min) >= 1);
}

/**
 * Lo que yup dice de un campo (describe), con sus condiciones resueltas. Lo usan el asterisco y los topes
 * (schemaLimits.js).
 *
 * @param {unknown} schema el validationSchema del formulario (un esquema de yup o una función que lo da, como en formik)
 * @param {string} name el campo, con la forma de formik ('contacts.2.email')
 * @param {object} [values] los valores del formulario, para las condiciones (.when)
 * @returns {object|null} null si no hay esquema, si no es de yup o si el campo no está en él
 */
export function fieldDescriptionOf(schema, name, values) {
    let current = typeof schema === 'function' ? schema() : schema;
    if (!current || typeof current.describe !== 'function') {
        return null;
    }
    let value = values;
    let parent;
    for (const part of fieldPathOf(name)) {
        // con sus condiciones ya resueltas: un campo puede existir o pedirse según otro
        const resolved = typeof current.resolve === 'function' ? current.resolve({value, parent}) : current;
        const next = resolved.fields ? resolved.fields[part] : resolved.innerType;
        if (!next) {
            return null;
        }
        current = next;
        parent = value;
        value = value?.[part];
    }
    return current.describe({value, parent});
}

/**
 * @param {unknown} schema el validationSchema del formulario (un esquema de yup o una función que lo da, como en formik)
 * @param {string} name el campo, con la forma de formik ('contacts.2.email')
 * @param {object} [values] los valores del formulario, para las condiciones (.when)
 * @returns {boolean} false si no hay esquema, si no es de yup o si el campo no está en él
 */
export function isRequiredInSchema(schema, name, values) {
    const description = fieldDescriptionOf(schema, name, values);
    return description ? describesRequired(description) : false;
}
