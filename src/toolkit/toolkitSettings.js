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

/**
 * Los idiomas que ofrece la app cuando el proyecto no dice otros: su código, su nombre en su propio idioma (así lo busca quien
 * lo habla) y cómo se escriben sus números y fechas (Intl). El proyecto agrega los suyos en ToolkitProvider `languages` y pone
 * sus traducciones en `texts` (lo que no traduzca sale en español); los textos del paquete solo vienen en español e inglés.
 */
export const DEFAULT_LANGUAGES = Object.freeze([
    Object.freeze({code: 'es', label: 'Español', locale: 'es-MX'}),
    Object.freeze({code: 'en', label: 'English', locale: 'en-US'}),
]);

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
    // los idiomas que ofrece la app (DEFAULT_LANGUAGES)
    languages: DEFAULT_LANGUAGES,
});

/**
 * Cambia la configuración que leen las funciones del paquete. La llama ToolkitProvider; un proyecto sin React (o una
 * prueba) la puede llamar directo.
 *
 * @param {{language?: string, texts?: object, translate?: Function|null, timeZone?: string, currency?: string, appName?: string, buildId?: string, languages?: Array<{code: string, label: string, locale?: string}>}} settings
 * @returns {void}
 */
export function configureToolkit(settings) {
    currentSettings = Object.freeze({...currentSettings, ...settings});
}

/**
 * La configuración vigente.
 *
 * @returns {{language: string, texts: object, translate: Function|null, timeZone: string, currency: string, appName: string, buildId: string, languages: Array<{code: string, label: string, locale?: string}>}}
 */
export function toolkitSettings() {
    return currentSettings;
}

/**
 * El locale de Intl del idioma: el que dice su lista de idiomas (es → es-MX, pt → pt-BR) o, si no dice, el código mismo
 * (Intl entiende «pt»). OJO: antes un idioma que no fuera es ni en salía con los números y las fechas de México.
 *
 * @param {string} language
 * @param {Array<{code: string, locale?: string}>} [languages] por omisión los de la configuración vigente
 * @returns {string}
 */
export function intlLocaleOf(language, languages = currentSettings.languages) {
    const known = languages?.find((entry) => entry.code === language) ?? DEFAULT_LANGUAGES.find((entry) => entry.code === language);
    return known?.locale ?? language ?? DEFAULT_LANGUAGES[0].locale;
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
 * El texto de una llave en los textos propios de los componentes (la prop `texts` de un componente y los de ComponentTexts
 * de afuera), si alguno la trae. Cada capa es {namespace, texts} con la misma forma que ese namespace en los textos del
 * paquete (es.js): plurales con _one/_other y {{variables}}. La primera capa que trae la llave gana.
 *
 * @param {Array<{namespace: string, texts: object|undefined}>} layers de la más cercana a la más lejana
 * @param {string} namespace el de la llave
 * @param {string} key la llave sin namespace
 * @param {object|undefined} values
 * @param {string} language para elegir el plural
 * @returns {string|undefined} el texto ya con sus variables, o undefined si ninguna capa lo trae
 */
export function componentTextOf(layers, namespace, key, values, language) {
    for (const layer of layers) {
        if (layer.namespace !== namespace || !layer.texts) {
            continue;
        }
        const text = textOf({[namespace]: layer.texts}, namespace, key, values, language);
        if (text !== undefined) {
            return interpolate(text, values);
        }
    }

    return undefined;
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

    if (text !== undefined) {
        return interpolate(text, values);
    }
    // como en i18next: sin la llave en ningún lado, el texto por omisión que pidió quien llama (un globo opcional pasa ''
    // y no se pinta); sin él, la llave tal cual, para que se note qué falta
    if (typeof values?.defaultValue === 'string') {
        return interpolate(values.defaultValue, values);
    }
    return `${namespace}${NAMESPACE_SEPARATOR}${plainKey}`;
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
