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
// Funciones del navegador, sin React: function (regla de la casa). Se prueba con node --test (uploadWithProgress.test.js)
// con un XMLHttpRequest de mentira.
import {toolkitSettings} from '@/toolkit/toolkitSettings.js';

const PERCENT = 100;

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
 * @param {FormData} formData los archivos y los campos que pida el backend
 * @param {object} [options]
 * @param {Record<string, string>} [options.headers] p. ej. Authorization; Accept-Language ya va con el idioma activo
 * @param {(percent: number) => void} [options.onProgress] 0 a 100 de lo que ya viajó del cuerpo
 * @param {AbortSignal} [options.signal]
 * @param {boolean} [options.withCredentials] manda las cookies a otro dominio (sesión de Sanctum en otro subdominio)
 * @returns {Promise<Response>}
 */
export function uploadWithProgress(url, formData, {headers = {}, onProgress, signal, withCredentials = false} = {}) {
    return new Promise((resolve, reject) => {
        // guard clause: ya venía cancelada
        if (signal?.aborted) {
            reject(new DOMException('La subida se canceló', 'AbortError'));
            return;
        }

        const request = new XMLHttpRequest();
        request.open('POST', url);
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
            if (event.lengthComputable) {
                onProgress?.(Math.round((event.loaded / event.total) * PERCENT));
            }
        };
        request.onload = () => {
            resolve(new Response(request.response, {status: request.status, headers: headersOf(request.getAllResponseHeaders())}));
        };
        request.onerror = () => reject(new TypeError('No hubo respuesta del servidor'));
        request.ontimeout = () => reject(new TypeError('El servidor tardó demasiado en responder'));
        request.onabort = () => reject(new DOMException('La subida se canceló', 'AbortError'));
        request.send(formData);
    });
}
