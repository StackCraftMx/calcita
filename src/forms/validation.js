// Mensajes por defecto de yup como LLAVES de i18n y no como texto.
//
// Por qué llaves: setLocale es global y se llama una sola vez. Con el texto en español, al cambiar a inglés los
// errores seguirían en español hasta recargar. Con {key, values} el esquema no cambia y el texto se traduce al
// PINTARLO (translateValidationMessage, lo usa FormTextField) en el idioma que esté activo en ese momento.
//
// Uso en un esquema: Yup.string().required().email()  → sin textos pegados.
// Mensaje propio de un campo: .required({key: 'auth:login.emailRequired'}) o .test('x', {key: 'modulo:llave'}, fn).
// O sin tocar el esquema: cada mensaje lleva su regla y su campo, y la pantalla (messages del campo) o los textos del
// proyecto (validation:fields.<campo>.<regla>) ponen el suyo (translateValidationMessage, en validationMessages.js).
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

/**
 * Un mensaje de yup como llave: {key: 'validation:<nombre>', values, rule, path}.
 *
 * `rule` (la regla de yup que falló: required, min, matches…) y `path` (el campo) dejan que la pantalla o los textos del
 * proyecto pongan un mensaje propio para ese campo y esa regla sin tocar el esquema (translateValidationMessage). `label`
 * (el de .label('RFC') del esquema) va en los valores, para los textos que dicen el nombre del campo.
 *
 * @param {string} name el nombre del texto en el namespace validation
 * @param {string} rule la regla de yup
 * @param {(params: object) => object} [valuesOf] los valores del texto, sacados de lo que da yup (min, max…)
 * @returns {(params?: object) => {key: string, values: object, rule: string, path?: string}}
 */
function messageOf(name, rule, valuesOf) {
    return (params = {}) => {
        const values = {...(valuesOf ? valuesOf(params) : {}), ...(params.label ? {label: params.label} : {})};
        // OJO: con .label('RFC') yup cambia params.path por el nombre visible; el campo de verdad viene en originalPath
        const fieldPath = params.originalPath ?? params.path;
        return {key: `${NAMESPACE}:${name}`, values, rule, ...(fieldPath ? {path: fieldPath} : {})};
    };
}

/** El locale de yup: cada mensaje por defecto es una llave del namespace validation, con su regla y su campo. */
export const YUP_LOCALE = Object.freeze({
    mixed: {
        default: messageOf('default', 'default'),
        required: messageOf('required', 'required'),
        defined: messageOf('required', 'defined'),
        notNull: messageOf('required', 'notNull'),
        notType: messageOf('notType', 'notType'),
        oneOf: messageOf('oneOf', 'oneOf', ({values}) => ({values: String(values)})),
        notOneOf: messageOf('notOneOf', 'notOneOf', ({values}) => ({values: String(values)})),
    },
    string: {
        length: messageOf('stringLength', 'length', ({length}) => ({count: length})),
        min: messageOf('stringMin', 'min', ({min}) => ({count: min})),
        max: messageOf('stringMax', 'max', ({max}) => ({count: max})),
        matches: messageOf('matches', 'matches'),
        email: messageOf('email', 'email'),
        url: messageOf('url', 'url'),
        uuid: messageOf('uuid', 'uuid'),
        trim: messageOf('trim', 'trim'),
        lowercase: messageOf('lowercase', 'lowercase'),
        uppercase: messageOf('uppercase', 'uppercase'),
    },
    number: {
        min: messageOf('numberMin', 'min', ({min}) => ({min})),
        max: messageOf('numberMax', 'max', ({max}) => ({max})),
        lessThan: messageOf('lessThan', 'lessThan', ({less}) => ({less})),
        moreThan: messageOf('moreThan', 'moreThan', ({more}) => ({more})),
        positive: messageOf('positive', 'positive'),
        negative: messageOf('negative', 'negative'),
        integer: messageOf('integer', 'integer'),
    },
    date: {
        min: messageOf('dateMin', 'min', ({min}) => ({min: String(min)})),
        max: messageOf('dateMax', 'max', ({max}) => ({max: String(max)})),
    },
    array: {
        min: messageOf('arrayMin', 'min', ({min}) => ({count: min})),
        max: messageOf('arrayMax', 'max', ({max}) => ({count: max})),
        length: messageOf('arrayLength', 'length', ({length}) => ({count: length})),
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
