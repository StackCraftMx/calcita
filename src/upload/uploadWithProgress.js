// Subir un formulario con archivos (multipart) con el AVANCE real de la subida.
//
// fetch no dice cuántos bytes del cuerpo ya viajaron; XMLHttpRequest sí (xhr.upload.onprogress). Es UNA petición normal,
// el mismo POST de siempre, pero la pantalla puede pintar «Subiendo 47 %».
//
// El avance llega a 100 % cuando el CUERPO terminó de viajar; lo que sigue (el servidor procesando y la respuesta
// bajando) ya no se puede medir aquí: la pantalla cambia a «procesando…» sin porcentaje (uploadMachine lo hace sola).
//
// Responde como fetch: un Response (res.ok, res.status, res.headers, res.json(), res.blob()), así quien llama trata el
// error RFC 9457 igual que con cualquier otra petición. La cancelación también es la de fetch: AbortSignal → AbortError.
//
// Por omisión es un POST; method cambia el verbo para los protocolos que suben por partes (el PATCH de cada trozo y el HEAD
// que pregunta hasta dónde llegó, en la subida por trozos de FilePond).
//
// Funciones del navegador, sin React: function (regla de la casa). Se prueba con node --test (uploadWithProgress.test.js)
// con un XMLHttpRequest de mentira.
import {toolkitSettings} from '@/toolkit/toolkitSettings.js';

const PERCENT = 100;
// las respuestas que por regla no llevan cuerpo: Response truena si se le da uno, aunque venga vacío (un 204 a un PATCH es
// lo normal en una subida por trozos)
const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

/**
 * Los headers de XMLHttpRequest ('k: v\r\nk2: v2') como objeto para Response.
 *
 * @param {string|null} rawHeaders
 * @returns {Record<string, string>}
 */
function headersOf(rawHeaders) {
    const headers = {};
    for (const line of String(rawHeaders ?? '').trim().split(/[\r\n]+/)) {
        const separatorPosition = line.indexOf(': ');
        if (separatorPosition > 0) {
            headers[line.slice(0, separatorPosition)] = line.slice(separatorPosition + 2);
        }
    }
    return headers;
}

/**
 * @param {string} url
 * @param {FormData|Blob|null} formData los archivos y los campos que pida el backend (un trozo del archivo, o nada en un HEAD)
 * @param {object} [options]
 * @param {string} [options.method] por omisión POST
 * @param {Record<string, string>} [options.headers] p. ej. Authorization; Accept-Language ya va con el idioma activo
 * @param {(percent: number, transfer: {loaded: number, total: number}) => void} [options.onProgress] 0 a 100 de lo que ya
 *     viajó del cuerpo, y los bytes (para la velocidad y lo que falta)
 * @param {AbortSignal} [options.signal]
 * @param {boolean} [options.withCredentials] manda las cookies a otro dominio (sesión de Sanctum en otro subdominio)
 * @returns {Promise<Response>}
 */
export function uploadWithProgress(url, formData, {method = 'POST', headers = {}, onProgress, signal, withCredentials = false} = {}) {
    return new Promise((resolve, reject) => {
        // guard clause: ya venía cancelada
        if (signal?.aborted) {
            reject(new DOMException('La subida se canceló', 'AbortError'));
            return;
        }

        const request = new XMLHttpRequest();
        request.open(method, url);
        request.responseType = 'blob';
        request.withCredentials = withCredentials;
        signal?.addEventListener('abort', () => request.abort(), {once: true});

        // OJO: Content-Type NO se pone a mano: el navegador lo arma con el separador del multipart; puesto a mano, el
        // servidor no encuentra los archivos
        const finalHeaders = {'Accept-Language': toolkitSettings().language, ...headers};
        for (const [name, value] of Object.entries(finalHeaders)) {
            request.setRequestHeader(name, value);
        }

        request.upload.onprogress = (event) => {
            // al cancelar, el navegador todavía avisa un último avance: ya no se cuenta (la pantalla volvería a «Subiendo»)
            if (signal?.aborted) {
                return;
            }
            if (event.lengthComputable) {
                onProgress?.(Math.round((event.loaded / event.total) * PERCENT), {loaded: event.loaded, total: event.total});
            }
        };
        request.onload = () => {
            const body = NULL_BODY_STATUSES.has(request.status) ? null : request.response;
            resolve(new Response(body, {status: request.status, headers: headersOf(request.getAllResponseHeaders())}));
        };
        request.onerror = () => reject(new TypeError('No hubo respuesta del servidor'));
        request.ontimeout = () => reject(new TypeError('El servidor tardó demasiado en responder'));
        request.onabort = () => reject(new DOMException('La subida se canceló', 'AbortError'));
        request.send(formData);
    });
}
