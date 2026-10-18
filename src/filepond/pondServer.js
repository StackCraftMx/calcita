// El «server» de FilePond con lo de la casa: cada archivo se sube en su propio POST con su barra de avance dentro de su
// tarjeta, el idioma activo en Accept-Language, el error RFC 9457 del backend escrito en la tarjeta y la ✕ que cancela la
// petición de verdad (no solo la pantalla).
//
// Cuándo SÍ: archivos que valen cada uno por su cuenta (adjuntos sueltos, una galería).
// Cuándo NO: el envío de siempre, «todos los archivos y los campos en UN solo envío»: ahí la zona solo elige y la
// pantalla arma su FormData. OJO: aquí el backend ve UN archivo por petición; las reglas del lote completo (cuántos,
// cuánto pesan juntos) ya no las puede revisar por petición.
//
//   <FileDropzone multiple server={createPondServer({url: '/api/v1/adjuntos', headers: {Authorization: `Bearer ${token}`}})} />
//
// Funciones del navegador, sin React: function (regla de la casa).
import {problemTitle} from '@/problems.js';
import {toolkitSettings} from '@/toolkit/toolkitSettings.js';

// status de «no hubo respuesta» para los textos del paquete (problems: offline)
const OFFLINE_STATUS = 0;

/**
 * El título del problema RFC 9457 de una respuesta (o el genérico del paquete, ya traducido).
 *
 * @param {XMLHttpRequest} request
 * @returns {string}
 */
function problemTitleOf(request) {
    let problem = null;
    try {
        problem = JSON.parse(request.responseText);
    } catch {
        // la respuesta no era JSON (un 502 del proxy en HTML): va el título genérico de su status
    }
    return problemTitle(problem, request.status);
}

/**
 * @param {object} options
 * @param {string} options.url a dónde va cada archivo
 * @param {string} [options.fieldName] el campo del archivo en el FormData; por omisión el name de la zona
 * @param {Record<string, string>} [options.headers] p. ej. Authorization
 * @param {boolean} [options.withCredentials] manda las cookies a otro dominio
 * @returns {{process: (...args: any[]) => any, revert: (...args: any[]) => any}} lo que recibe la prop server de FileDropzone
 */
export function createPondServer({url, fieldName, headers = {}, withCredentials = false}) {
    return {
        process: (pondFieldName, file, metadata, load, error, progress, abort) => {
            const request = new XMLHttpRequest();
            request.open('POST', url);
            request.withCredentials = withCredentials;
            for (const [headerName, headerValue] of Object.entries({'Accept-Language': toolkitSettings().language, ...headers})) {
                request.setRequestHeader(headerName, headerValue);
            }

            request.upload.onprogress = (event) => progress(event.lengthComputable, event.loaded, event.total);
            request.onload = () => {
                if (request.status >= 200 && request.status < 300) {
                    // lo que responda el servidor es el id del archivo (FilePond lo guarda para deshacer)
                    load(request.responseText || file.name);
                    return;
                }
                error(problemTitleOf(request));
            };
            request.onerror = () => error(problemTitle(null, OFFLINE_STATUS));

            const formData = new FormData();
            formData.append(fieldName ?? pondFieldName, file, file.name);
            request.send(formData);

            // la ✕ de la tarjeta cancela la petición de verdad
            return {
                abort: () => {
                    request.abort();
                    abort();
                },
            };
        },
        // sin nada que deshacer en el servidor: el «deshacer» de la tarjeta es local. Si el backend guarda el archivo,
        // aquí iría su DELETE con el id que regresó
        revert: (serverId, load) => load(),
    };
}
