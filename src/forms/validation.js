// Mensajes por defecto de yup como LLAVES de i18n y no como texto.
//
// Por qué llaves: setLocale es global y se llama una sola vez. Con el texto en español, al cambiar a inglés los
// errores seguirían en español hasta recargar. Con {key, values} el esquema no cambia y el texto se traduce al
// PINTARLO (translateValidationMessage, lo usa FormTextField) en el idioma que esté activo en ese momento.
//
// Uso en un esquema: Yup.string().required().email()  → sin textos pegados.
// Mensaje propio de un campo: .required({key: 'auth:login.emailRequired'}) o .test('x', {key: 'modulo:llave'}, fn).
//
// IMPORTANTE: toda llave de aquí existe en los textos del paquete, namespace validation de locales/{es,en}.js (lo revisa
// validation.test.js). La validación de aquí es para no gastar un viaje al servidor en lo obvio; la que protege es la
// del backend.
//
// buildYupLocale() se llama UNA vez en la entrada de la aplicación, antes del primer esquema.
//
// Funciones puras, no renderizan: function (regla de la casa). Solo importa yup (se prueba con node --test).
import * as Yup from 'yup';

const NAMESPACE = 'validation';

/** {key: 'validation:<nombre>', values} */
function messageKey(name, values) {
    return values === undefined ? {key: `${NAMESPACE}:${name}`} : {key: `${NAMESPACE}:${name}`, values};
}

/** El locale de yup: cada mensaje por defecto es una llave del namespace validation. */
export const YUP_LOCALE = Object.freeze({
    mixed: {
        default: messageKey('default'),
        required: messageKey('required'),
        defined: messageKey('required'),
        notNull: messageKey('required'),
        notType: messageKey('notType'),
        oneOf: ({values}) => messageKey('oneOf', {values: String(values)}),
        notOneOf: ({values}) => messageKey('notOneOf', {values: String(values)}),
    },
    string: {
        length: ({length}) => messageKey('stringLength', {count: length}),
        min: ({min}) => messageKey('stringMin', {count: min}),
        max: ({max}) => messageKey('stringMax', {count: max}),
        matches: messageKey('matches'),
        email: messageKey('email'),
        url: messageKey('url'),
        uuid: messageKey('uuid'),
        trim: messageKey('trim'),
        lowercase: messageKey('lowercase'),
        uppercase: messageKey('uppercase'),
    },
    number: {
        min: ({min}) => messageKey('numberMin', {min}),
        max: ({max}) => messageKey('numberMax', {max}),
        lessThan: ({less}) => messageKey('lessThan', {less}),
        moreThan: ({more}) => messageKey('moreThan', {more}),
        positive: messageKey('positive'),
        negative: messageKey('negative'),
        integer: messageKey('integer'),
    },
    date: {
        min: ({min}) => messageKey('dateMin', {min: String(min)}),
        max: ({max}) => messageKey('dateMax', {max: String(max)}),
    },
    array: {
        min: ({min}) => messageKey('arrayMin', {count: min}),
        max: ({max}) => messageKey('arrayMax', {count: max}),
        length: ({length}) => messageKey('arrayLength', {count: length}),
    },
});

/**
 * Instala el locale de llaves en yup. Se llama una vez en la entrada de la aplicación, antes del primer esquema.
 */
export function buildYupLocale() {
    Yup.setLocale(YUP_LOCALE);
}

export {Yup};

// el texto de un error en el idioma activo vive aparte (sin yup) para los campos sueltos; aquí se re-exporta
export {translateValidationMessage} from '@/forms/validationMessages.js';
