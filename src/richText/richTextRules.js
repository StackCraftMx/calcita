// Lo que el editor de texto decide sin pantalla: qué botones trae (RICH_TEXT_FEATURE), qué dirección de liga se acepta y
// cómo queda el texto vacío.
//
// Ligas: solo https, http, mailto y tel. Una dirección sin protocolo («calcita.mx») se completa con https://. Lo demás
// (javascript:, data:, file:) se rechaza: una liga así ejecuta código al picarla (XSS).
//
// Vacío: el editor deja «<p></p>» cuando se borra todo; al formulario llega '' para que required() funcione.
//
// Puro (sin React): se prueba con node (richTextRules.test.js).
//
// Genérico del paquete: function (regla de la casa).

/** Los botones que puede traer la barra del editor. */
export const RICH_TEXT_FEATURE = Object.freeze({
    textStyle: 'textStyle',
    bold: 'bold',
    italic: 'italic',
    underline: 'underline',
    strike: 'strike',
    bulletList: 'bulletList',
    orderedList: 'orderedList',
    blockquote: 'blockquote',
    codeBlock: 'codeBlock',
    link: 'link',
    align: 'align',
    clear: 'clear',
    history: 'history',
});

/** Los de siempre: todos. Un editor más sencillo pasa su lista (features={[RICH_TEXT_FEATURE.bold, …]}). */
export const DEFAULT_RICH_TEXT_FEATURES = Object.freeze(Object.values(RICH_TEXT_FEATURE));

/** Los protocolos que puede llevar una liga. */
export const SAFE_LINK_PROTOCOLS = Object.freeze(['https', 'http', 'mailto', 'tel']);

const PROTOCOL_PATTERN = /^([a-z][a-z\d+.-]*):/i;
// «calcita.mx», «www.ejemplo.com/ruta»: un dominio sin protocolo
const BARE_DOMAIN_PATTERN = /^[\w-]+(\.[\w-]+)+(\/\S*)?$/;
const EMPTY_DOCUMENT_PATTERN = /^\s*(<p>\s*<\/p>\s*)*$/;

/**
 * La dirección de una liga lista para guardarse, o null si no se acepta.
 *
 * @param {string|null|undefined} typedUrl lo que escribió la persona
 * @returns {string|null}
 */
export function linkUrlOf(typedUrl) {
    const url = (typedUrl ?? '').trim();
    if (!url) {
        return null;
    }
    const protocol = PROTOCOL_PATTERN.exec(url)?.[1]?.toLowerCase();
    if (protocol) {
        return SAFE_LINK_PROTOCOLS.includes(protocol) ? url : null;
    }
    return BARE_DOMAIN_PATTERN.test(url) ? `https://${url}` : null;
}

/**
 * ¿Se acepta esta dirección como liga? (lo que pide la extensión de ligas del editor)
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isSafeLinkUrl(url) {
    return linkUrlOf(url) !== null;
}

/**
 * El HTML del editor como se guarda: '' si no hay nada escrito.
 *
 * @param {string|null|undefined} html
 * @returns {string}
 */
export function normalizedHtmlOf(html) {
    return !html || EMPTY_DOCUMENT_PATTERN.test(html) ? '' : html;
}
