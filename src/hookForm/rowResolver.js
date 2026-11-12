// La validación de un renglón que es su propio useForm (EditableRows y useEditableServerRows de react-hook-form): el yup
// del renglón (rowSchema, con el yupResolver de @hookform/resolvers, que esta puerta ya pide) y, encima, las reglas propias
// de la pantalla (validateRow).
//
// Funciones puras, no renderizan: function (regla de la casa).
import {yupResolver} from '@hookform/resolvers/yup';

/**
 * La validación de un renglón para useForm: su yup y, encima, lo que diga validateRow con los demás renglones (los errores
 * de yup ganan en el mismo campo). Los demás renglones se leen al validar, no al armar el renglón.
 *
 * @param {object|undefined} rowSchema el yup de un renglón
 * @param {() => ((values: object, context: object) => object|Promise<object>)|undefined} validateRowOf la regla de ahora
 * @param {() => object} contextOf lo que recibe la regla (los demás renglones, el renglón del servidor…), leído al validar
 * @returns {import('react-hook-form').Resolver}
 */
export function rowResolverOf(rowSchema, validateRowOf, contextOf) {
    const schemaResolver = rowSchema ? yupResolver(rowSchema) : null;
    return async (values, context, options) => {
        const checked = schemaResolver ? await schemaResolver(values, context, options) : {values, errors: {}};
        const validateRow = validateRowOf();
        if (!validateRow) {
            return checked;
        }
        const ownErrors = await validateRow(values, contextOf()) ?? {};
        const extraErrors = Object.fromEntries(Object.entries(ownErrors)
            .filter(([field, message]) => message && !checked.errors[field])
            .map(([field, message]) => [field, {type: 'validateRow', message}]));
        const errors = {...checked.errors, ...extraErrors};
        return Object.keys(errors).length > 0 ? {values: {}, errors} : {values: checked.values, errors: {}};
    };
}
