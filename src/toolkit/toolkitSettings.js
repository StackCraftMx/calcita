// La configuración del paquete: idioma, textos, zona horaria, moneda, nombre de la aplicación y navegación.
//
// La pone ToolkitProvider en cada render y la leen también las funciones que no son componentes (formatos de fecha y
// número, avisos, errores del servidor). Sin proveedor valen los de omisión: español, la zona del navegador y la
// navegación del navegador.
//
// Los textos se resuelven en este orden, para que cada proyecto cambie solo lo que necesite:
//   1. translate del proyecto (por ejemplo el t de i18next), si regresa un texto;
//   2. los textos que el proyecto pasó en `texts`, del idioma activo;
//   3. los textos del paquete (locales/), del idioma activo y, si no está, en español.
// Las llaves usan la forma de i18next: «namespace:llave.anidada», {{variable}} y plurales con _one / _other.
//
// Funciones puras, no renderizan: function (regla de la casa).
import es from '@/locales/es.js';
import en from '@/locales/en.js';

export const DEFAULT_LANGUAGE = 'es';
// la moneda de los montos (código ISO 4217) cuando el proyecto no dice otra
export const DEFAULT_CURRENCY = 'MXN';

const PACKAGE_TEXTS_BY_LANGUAGE = Object.freeze({es, en});

// cómo se escriben números y fechas en cada idioma (Intl)
const INTL_LOCALE_BY_LANGUAGE = Object.freeze({es: 'es-MX', en: 'en-US'});

const NAMESPACE_SEPARATOR = ':';
const KEY_SEPARATOR = '.';
const PLURAL_SEPARATOR = '_';
const PLURAL_OTHER = 'other';
const INTERPOLATION = /\{\{\s*(\w+)\s*\}\}/g;

/**
 * La zona horaria del navegador; si el navegador no la sabe, la de la Ciudad de México.
 *
 * @returns {string}
 */
export function browserTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'America/Mexico_City';
}

let currentSettings = Object.freeze({
    language: DEFAULT_LANGUAGE,
    texts: {},
    translate: null,
    timeZone: browserTimeZone(),
    currency: DEFAULT_CURRENCY,
    appName: '',
    // la compilación del front que corre en esta pestaña ('' en desarrollo): con ella se sabe si hay una versión nueva
    buildId: '',
});

/**
 * Cambia la configuración que leen las funciones del paquete. La llama ToolkitProvider; un proyecto sin React (o una
 * prueba) la puede llamar directo.
 *
 * @param {{language?: string, texts?: object, translate?: Function|null, timeZone?: string, currency?: string, appName?: string, buildId?: string}} settings
 * @returns {void}
 */
export function configureToolkit(settings) {
    currentSettings = Object.freeze({...currentSettings, ...settings});
}

/**
 * La configuración vigente.
 *
 * @returns {{language: string, texts: object, translate: Function|null, timeZone: string, currency: string, appName: string, buildId: string}}
 */
export function toolkitSettings() {
    return currentSettings;
}

/**
 * El locale de Intl del idioma (es → es-MX, en → en-US).
 *
 * @param {string} language
 * @returns {string}
 */
export function intlLocaleOf(language) {
    return INTL_LOCALE_BY_LANGUAGE[language] ?? INTL_LOCALE_BY_LANGUAGE[DEFAULT_LANGUAGE];
}

/**
 * Lo que hay en una ruta de llaves («toast.error») dentro de un objeto de textos.
 *
 * @param {object|undefined} texts
 * @param {string} path
 * @returns {unknown}
 */
function valueAtPath(texts, path) {
    let value = texts;
    for (const part of path.split(KEY_SEPARATOR)) {
        if (value === null || typeof value !== 'object') {
            return undefined;
        }
        value = value[part];
    }

    return value;
}

/**
 * El texto de una llave en un objeto de textos, con su plural si trae count (como i18next: llave_one, llave_other).
 *
 * @param {object|undefined} texts los textos de un idioma, por namespace
 * @param {string} namespace
 * @param {string} key
 * @param {object|undefined} values
 * @param {string} language
 * @returns {string|undefined}
 */
function textOf(texts, namespace, key, values, language) {
    const namespaceTexts = texts?.[namespace];
    if (typeof values?.count === 'number') {
        const pluralCategory = new Intl.PluralRules(intlLocaleOf(language)).select(values.count);
        const pluralText = valueAtPath(namespaceTexts, `${key}${PLURAL_SEPARATOR}${pluralCategory}`)
            ?? valueAtPath(namespaceTexts, `${key}${PLURAL_SEPARATOR}${PLURAL_OTHER}`);
        if (typeof pluralText === 'string') {
            return pluralText;
        }
    }

    const text = valueAtPath(namespaceTexts, key);

    return typeof text === 'string' ? text : undefined;
}

/**
 * Pone los valores en las {{variables}} del texto; una variable sin valor se queda como está.
 *
 * @param {string} text
 * @param {object|undefined} values
 * @returns {string}
 */
function interpolate(text, values) {
    return text.replace(INTERPOLATION, (placeholder, name) => (values?.[name] === undefined ? placeholder : String(values[name])));
}

/**
 * El texto de una llave con una configuración dada (la del proveedor o la vigente).
 *
 * @param {{language: string, texts: object, translate: Function|null}} settings
 * @param {string} defaultNamespace el namespace cuando la llave no trae uno («table», «common», «problems»...)
 * @param {string} key «llave» o «namespace:llave»
 * @param {object} [values] las variables del texto y, para el plural, count
 * @returns {string} la llave misma si no hay texto, para que se note qué falta
 */
export function translateWith(settings, defaultNamespace, key, values) {
    const [namespace, plainKey] = key.includes(NAMESPACE_SEPARATOR) ? key.split(NAMESPACE_SEPARATOR, 2) : [defaultNamespace, key];
    const projectText = settings.translate?.(namespace, plainKey, values);
    if (typeof projectText === 'string') {
        return projectText;
    }

    const text = textOf(settings.texts?.[settings.language], namespace, plainKey, values, settings.language)
        ?? textOf(PACKAGE_TEXTS_BY_LANGUAGE[settings.language], namespace, plainKey, values, settings.language)
        ?? textOf(PACKAGE_TEXTS_BY_LANGUAGE[DEFAULT_LANGUAGE], namespace, plainKey, values, DEFAULT_LANGUAGE);

    return text === undefined ? `${namespace}${NAMESPACE_SEPARATOR}${plainKey}` : interpolate(text, values);
}

/**
 * El texto de una llave con la configuración vigente, para lo que no es componente (avisos, errores del servidor).
 *
 * @param {string} defaultNamespace
 * @param {string} key
 * @param {object} [values]
 * @returns {string}
 */
export function translateToolkit(defaultNamespace, key, values) {
    return translateWith(currentSettings, defaultNamespace, key, values);
}
