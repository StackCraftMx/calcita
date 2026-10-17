// Del error RFC 9457 del backend al texto que lee la persona.
//
// La regla tiene dos mitades:
//   - Lo que YA viene traducido se usa tal cual. Un backend que responde RFC 9457 manda title y detail en el idioma del
//     header Accept-Language, y los errores de validación (422, como los de Laravel) traen `errors` como
//     {campo: [mensajes]} también traducidos. Traducir aquí por `code` pisaría el texto que el backend escribió
//     para ESE caso (p. ej. "Correo o contraseña incorrectos").
//   - Lo genérico se traduce aquí, con los textos del paquete (namespace problems): sin red (no hubo respuesta), un
//     502 del proxy que llega en HTML, o un error que armó el servidor web por su cuenta en otro idioma.
//
// OJO: estas funciones se llaman fuera de los componentes: leen el idioma y los textos de la configuración vigente
// del proveedor.
//
// Funciones puras, no renderizan: function (regla de la casa).
import {translateToolkit} from '@/toolkit/toolkitSettings.js';

// status → llave genérica de los textos del paquete (namespace problems)
const GENERIC_KEY_BY_STATUS = {
    0: 'offline',
    401: 'unauthenticated',
    403: 'forbidden',
    404: 'notFound',
    409: 'conflict',
    410: 'gone',
    413: 'payloadTooLarge',
    419: 'csrfTokenMismatch',
    422: 'validation',
    429: 'tooManyRequests',
    500: 'serverError',
    502: 'serviceUnavailable',
    503: 'serviceUnavailable',
    504: 'serviceUnavailable',
};

function genericKeyOf(status) {
    return GENERIC_KEY_BY_STATUS[status] ?? 'generic';
}

/**
 * Título del problema en el idioma activo.
 *
 * @param {object|null} problem cuerpo RFC 9457 (puede faltar)
 * @param {number} status status HTTP; 0 si no hubo respuesta
 * @param {{translatedByServer?: boolean}} [options] false cuando el idioma de la respuesta no es el pedido
 * @returns {string}
 */
export function problemTitle(problem, status, {translatedByServer = true} = {}) {
    if (translatedByServer && problem?.title) {
        return problem.title;
    }
    return translateToolkit('problems', `${genericKeyOf(status)}.title`);
}

/**
 * Mensaje principal (detail) del problema en el idioma activo.
 *
 * @param {object|null} problem cuerpo RFC 9457 (puede faltar)
 * @param {number} status status HTTP; 0 si no hubo respuesta
 * @param {{translatedByServer?: boolean}} [options] false cuando el idioma de la respuesta no es el pedido
 * @returns {string}
 */
export function problemMessage(problem, status, {translatedByServer = true} = {}) {
    if (translatedByServer && problem?.detail) {
        return problem.detail;
    }
    return translateToolkit('problems', `${genericKeyOf(status)}.detail`);
}

/**
 * Errores por campo de un 422 de Laravel: {campo: ['mensaje', ...]}, ya traducidos por el backend.
 * Un campo anidado ("rows.3.email") se reduce a su último segmento que no es número, porque el formulario
 * conoce el campo y no la ruta.
 *
 * @param {object|null} problem cuerpo RFC 9457
 * @returns {Record<string, string[]>}
 */
export function fieldErrorsOf(problem) {
    const rawErrors = problem?.errors;
    const errorsByField = {};

    // guard clause: sin errores por campo (cualquier status distinto de 422)
    if (!rawErrors || typeof rawErrors !== 'object' || Array.isArray(rawErrors)) {
        return errorsByField;
    }

    for (const [fieldPath, messages] of Object.entries(rawErrors)) {
        const fieldName = String(fieldPath).split('.').filter((segment) => !/^\d+$/.test(segment)).at(-1) || '_';
        const messageList = Array.isArray(messages) ? messages : [messages];
        errorsByField[fieldName] = [...(errorsByField[fieldName] ?? []), ...messageList.map(String)];
    }
    return errorsByField;
}
