// El texto de un error de validación en el idioma activo. Aparte de validation.js a propósito: no importa yup, así lo usan
// los campos sueltos de la puerta principal (inputs/) sin cargar yup en un proyecto que no valida con él.
//
// De dónde sale el texto, en este orden (el primero que exista gana):
//   1. el de la pantalla para ese campo y esa regla: <TextInput messages={{matches: 'El RFC lleva 12 o 13 caracteres'}} />
//   2. el de los textos del proyecto para ese campo y esa regla: validation:fields.<campo>.<regla>
//      ({es: {validation: {fields: {rfc: {matches: '…'}}}}}); el campo sin índices de lista (contacts[2].email → contacts.email)
//   3. el del mensaje mismo: la llave que puso Calcita (buildYupLocale) o el esquema ({key: 'clientes:rfcLargo'})
// Así el negocio pide un mensaje muy específico y se agrega un texto, sin tocar el esquema ni los mensajes de Calcita.
//
// Las formas de mensaje que entiende (readValidationMessage de ToolkitProvider lee cualquier otra, la de un sistema que ya
// existe):
//   'El correo ya existe.'               un texto ya escrito (el del backend): tal cual
//   {key, values}                        la de Calcita (y rule y path, que pone buildYupLocale)
//   {msg, values}                        la de muchos sistemas con i18next (su setLocale de yup)
//   {message: 'texto'}                   un texto dentro de un objeto
//   {message: {…}, type}                 el error entero de react-hook-form: se lee su message
// Una forma que no entiende NO se pinta como «[object Object]»: sale el mensaje general y se avisa en la consola.
//
// Funciones puras, no renderizan: function (regla de la casa).
import {createLogger} from '@/observability/logger.js';

const NAMESPACE = 'validation';
const DEFAULT_MESSAGE_KEY = `${NAMESPACE}:default`;
const log = createLogger('forms');
// las formas de mensaje que no se entendieron y de las que ya se avisó (una vez por forma)
const warnedShapes = new Set();

/**
 * El campo sin índices de lista, para buscar su texto propio: 'contacts[2].email' y 'contacts.2.email' son 'contacts.email'.
 *
 * @param {string} path
 * @returns {string}
 */
export function fieldKeyOf(path) {
    return String(path)
        .replace(/\[\d+\]/g, '')
        .split('.')
        .filter((step) => step !== '' && !/^\d+$/.test(step))
        .join('.');
}

/**
 * Un mensaje en la forma de Calcita, venga como venga.
 *
 * @param {unknown} error
 * @returns {{text: string}|{key: string, values: object, rule?: string, path?: string}|null} null: no se entendió
 */
export function normalizedValidationMessage(error) {
    if (typeof error === 'string') {
        return {text: error};
    }
    if (!error || typeof error !== 'object') {
        return null;
    }
    const key = typeof error.key === 'string' ? error.key : (typeof error.msg === 'string' ? error.msg : null);
    if (key) {
        return {key, values: error.values ?? error.params ?? {}, rule: error.rule, path: error.path};
    }
    if (typeof error.message === 'string') {
        return {text: error.message};
    }
    if (error.message && typeof error.message === 'object') {
        const inner = normalizedValidationMessage(error.message);
        // el error de react-hook-form trae la regla en `type`
        return inner && 'key' in inner && !inner.rule && error.type ? {...inner, rule: error.type} : inner;
    }
    return null;
}

/**
 * Avisa una vez por forma de un mensaje que no se entendió (sus llaves), en vez de pintar «[object Object]».
 *
 * @param {object} error
 * @returns {void}
 */
function warnUnknownShape(error) {
    const shape = Object.keys(error).sort().join(',');
    if (warnedShapes.has(shape)) {
        return;
    }
    warnedShapes.add(shape);
    log.warn(`Un mensaje de validación con forma desconocida ({${shape}}): se enseña el mensaje general. Conéctelo con readValidationMessage de ToolkitProvider.`);
}

/**
 * Texto de un error de validación en el idioma activo.
 *
 * @param {(key: string, values?: object) => string} translate el t de useToolkitTranslation (respeta `defaultValue`, como el
 *     de i18next: con él busca los textos opcionales sin avisar que faltan)
 * @param {unknown} error lo que dejó la validación en el campo
 * @param {object} [options]
 * @param {string} [options.label] el nombre del campo, para los textos que lo dicen ({{label}}: «Escriba {{label}}»)
 * @param {Record<string, string|object>} [options.messages] los textos de la pantalla para este campo, por regla
 *     ({required: 'Escriba el RFC', matches: 'El RFC lleva 12 o 13 caracteres'}); ya traducidos o como {key, values}
 * @param {((error: unknown) => unknown)|null} [options.readMessage] cómo leer el mensaje de un sistema que ya existe
 *     (readValidationMessage de ToolkitProvider): regresa un texto, {key, values} o undefined para la lectura de siempre
 * @param {string} [options.fieldName] el name del campo que pinta el error: para el texto propio de ese campo cuando el
 *     mensaje no trae su campo (las reglas propias, los de un sistema que ya existe)
 * @returns {string|undefined}
 */
export function translateValidationMessage(translate, error, {label, messages, readMessage, fieldName} = {}) {
    if (error === undefined || error === null || error === '' || error === false) {
        return undefined;
    }
    const read = readMessage ? readMessage(error) : undefined;
    const message = normalizedValidationMessage(read === undefined || read === null ? error : read);
    if (!message) {
        warnUnknownShape(typeof error === 'object' ? error : {value: error});
        return translate(DEFAULT_MESSAGE_KEY);
    }
    if ('text' in message) {
        return message.text;
    }
    const values = label && message.values.label === undefined ? {...message.values, label} : message.values;

    // 1. el de la pantalla para esta regla
    const ownMessage = message.rule ? messages?.[message.rule] : undefined;
    if (ownMessage !== undefined && ownMessage !== null) {
        return translateValidationMessage(translate, ownMessage, {label});
    }
    // 2. el de los textos del proyecto para este campo y esta regla (opcional: sin él no se avisa que falta)
    const path = message.path ?? fieldName;
    if (message.rule && path) {
        const fieldText = translate(`${NAMESPACE}:fields.${fieldKeyOf(path)}.${message.rule}`, {...values, defaultValue: ''});
        if (fieldText) {
            return fieldText;
        }
    }
    // 3. el del mensaje
    return translate(message.key, values);
}

/**
 * El mensaje de una regla propia (.test) como lo dejan las de Calcita: su llave, sus valores y el nombre de la regla, para
 * que la pantalla (messages del campo) o los textos del proyecto (validation:fields.<campo>.<regla>) pongan el suyo sin
 * tocar el esquema. Es un objeto fijo: quien lo lea (rule.message.key) lo encuentra como siempre.
 *
 *   {name: 'percent', message: ruleMessageOf('validation:percent', 'percent', {min: 0, max: 100}), test: …}
 *
 * @param {string} key la llave del texto ('validation:percent')
 * @param {string} rule el nombre de la regla
 * @param {object} [values] los valores del texto
 * @returns {{key: string, values: object, rule: string}}
 */
export function ruleMessageOf(key, rule, values = {}) {
    return {key, values, rule};
}
