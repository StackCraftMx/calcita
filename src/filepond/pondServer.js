// El «server» de FilePond con lo de la casa: cada archivo se sube en su propio POST con su barra de avance dentro de su
// tarjeta, el idioma activo en Accept-Language, el error del backend escrito en la tarjeta y la ✕ que cancela la petición
// de verdad (no solo la pantalla).
//
// Cuándo SÍ: archivos que valen cada uno por su cuenta (adjuntos sueltos, una galería).
// Cuándo NO: el envío de siempre, «todos los archivos y los campos en UN solo envío»: ahí la zona solo elige y la
// pantalla arma su FormData. OJO: aquí el backend ve UN archivo por petición; las reglas del lote completo (cuántos,
// cuánto pesan juntos) ya no las puede revisar por petición.
//
//   <FileDropzone multiple server={createPondServer({url: '/api/v1/adjuntos', headers: {Authorization: `Bearer ${token}`}})} />
//
// POR TROZOS: cuando la zona pide trozos (chunkUploads, y el archivo pasa de chunkSize o va chunkForce), cada archivo sube
// con el protocolo de trozos de FilePond y la barra honesta de chunkedUpload.js: el folio con un POST a url, cada trozo con
// un PATCH a patchUrl + folio, y retomar con un HEAD (lo mismo que usa el cargador mini con createChunkedUpload). Las reglas son las de FilePond (mismos nombres de opciones), así un
// backend que ya recibía trozos de FilePond no cambia.
//
//   <FileDropzone chunkUploads chunkForce chunkSize="1 MB"
//                 server={createPondServer({url: '/upload', patchUrl: '/upload?patch=', headers: {'X-Upload-Context': JSON.stringify(data)}})} />
//
// OJO con los headers: por trozos viajan en UTF-8 byte por byte (como los manda FilePond): se pasan como texto normal, sin
// convertirlos a mano antes (convertidos dos veces, los acentos llegan rotos). El envío de un solo POST los manda tal cual.
//
// Un backend que no contesta RFC 9457 (Laravel manda {message, errors}): toProblem convierte su error, el mismo adaptador
// de createApiClient. Cada petición sale por sendRequest (por omisión uploadWithProgress de la casa): se puede pasar por el
// cliente del proyecto o probar sin servidor.
//
// Funciones del navegador, sin React: function (regla de la casa).
import {createLogger} from '@/observability/logger.js';
import {problemTitle} from '@/problems.js';
import {toolkitSettings, translateToolkit} from '@/toolkit/toolkitSettings.js';
import {UPLOAD_FAILURE, UploadFailure, defaultPatchUrlOf, problemOfResponse, startChunkedUpload} from '@/upload/chunkedUpload.js';
import {uploadWithProgress} from '@/upload/uploadWithProgress.js';

const log = createLogger('pond');

// status de «no hubo respuesta» para los textos del paquete (problems: offline)
const OFFLINE_STATUS = 0;

/**
 * ¿Este archivo va por trozos? La regla de FilePond: la zona los pidió y el archivo pasa del tamaño del trozo, o la zona los
 * fuerza para todos (hay servidores que solo reciben por trozos).
 *
 * @param {Blob} file
 * @param {{chunkUploads?: boolean, chunkForce?: boolean, chunkSize?: number}} options lo que FilePond le pasa al server
 * @returns {boolean}
 */
export function usesChunks(file, options) {
    return options?.chunkUploads === true && (file.size > options.chunkSize || options.chunkForce === true);
}

/**
 * Lo que se escribe en la tarjeta cuando un archivo no subió: el título del problema del servidor, o el genérico de su
 * status, ya traducido. Vacío deja el «No se pudo subir» de la zona.
 *
 * @param {unknown} failure
 * @param {((body: any, response: Response) => any)|undefined} toProblem
 * @returns {Promise<string>}
 */
async function failureMessageOf(failure, toProblem) {
    if (failure?.reason === UPLOAD_FAILURE.noTransferId) {
        return translateToolkit('common', 'upload.pond.noTransferId');
    }
    if (failure?.reason === UPLOAD_FAILURE.noResponse) {
        return problemTitle(null, OFFLINE_STATUS);
    }
    if (failure?.reason === UPLOAD_FAILURE.rejected && failure.response) {
        return problemTitle(await problemOfResponse(failure.response, toProblem), failure.response.status);
    }
    // no es de la red ni del servidor: un error de programación, que se anota para encontrarlo
    log.error('La subida falló sin respuesta del servidor', failure);
    return '';
}

/**
 * La subida de siempre: el archivo en un solo POST. done termina con lo que contestó el servidor (el id del archivo) o,
 * si contestó vacío, con el nombre del archivo. Los errores tienen la forma de la subida por trozos (UploadFailure): los
 * dos envíos se leen igual.
 *
 * @param {object} options
 * @returns {{done: Promise<string>, abort: () => void}}
 */
function startSingleUpload({url, fieldName, file, headers, withCredentials, sendRequest, onProgress}) {
    const controller = new AbortController();
    const formData = new FormData();
    formData.append(fieldName, file, file.name);
    const done = sendRequest(url, formData, {
        method: 'POST', headers, withCredentials, signal: controller.signal,
        onProgress: (percent, transfer) => {
            // cancelada, ya no hay avance que contar: la tarjeta se queda en «cancelada»
            if (!controller.signal.aborted) {
                onProgress(transfer.loaded, transfer.total);
            }
        },
    }).then(
        async (response) => {
            if (!response.ok) {
                throw new UploadFailure(UPLOAD_FAILURE.rejected, response);
            }
            return (await response.text()) || file.name;
        },
        (failure) => {
            if (failure?.name === 'AbortError') {
                throw failure;
            }
            throw new UploadFailure(UPLOAD_FAILURE.noResponse);
        },
    );
    return {done, abort: () => controller.abort()};
}

/**
 * @param {object} options
 * @param {string} options.url a dónde va cada archivo (por trozos: el POST que pide el folio)
 * @param {string} [options.fieldName] el campo del archivo en el FormData; por omisión el name de la zona
 * @param {Record<string, string>} [options.headers] p. ej. Authorization; por trozos van en las tres peticiones
 * @param {boolean} [options.withCredentials] manda las cookies a otro dominio
 * @param {string} [options.patchUrl] por trozos: a dónde va cada trozo, con el folio pegado al final. Por omisión, el de
 *     FilePond: url + '?patch='
 * @param {(body: any, response: Response) => any} [options.toProblem] el error del backend a la forma RFC 9457 (Laravel:
 *     body => ({title: body.message}))
 * @param {import('@/upload/chunkedUpload.js').UploadSendRequest} [options.sendRequest] cómo viaja cada petición; por omisión
 *     uploadWithProgress de la casa
 * @returns {{process: (...args: any[]) => any, revert: (...args: any[]) => any}} lo que recibe la prop server de FileDropzone
 */
export function createPondServer({url, fieldName, headers = {}, withCredentials = false, patchUrl, toProblem, sendRequest = uploadWithProgress}) {
    const chunkUrl = patchUrl ?? defaultPatchUrlOf(url);
    return {
        // FilePond llama process con su progress, su folio (transfer) y, al final, sus opciones de trozos
        process: (pondFieldName, file, metadata, load, error, progress, abort, transfer, options = {}) => {
            const requestHeaders = {'Accept-Language': toolkitSettings().language, ...headers};
            const reportProgress = (loaded, total) => progress(true, loaded, total);
            const upload = usesChunks(file, options)
                ? startChunkedUpload({
                    file, fileName: file.name, fieldName: fieldName ?? pondFieldName, metadata, url, patchUrl: chunkUrl,
                    headers: requestHeaders, withCredentials, chunkSize: options.chunkSize, retryDelays: options.chunkRetryDelays,
                    transferId: options.chunkTransferId ?? null, onTransferId: transfer, onProgress: reportProgress, sendRequest,
                })
                : startSingleUpload({
                    url, fieldName: fieldName ?? pondFieldName, file, headers: requestHeaders, withCredentials, sendRequest,
                    onProgress: reportProgress,
                });

            // lo que responda el servidor es el id del archivo (por trozos, el folio): FilePond lo guarda para deshacer
            upload.done.then(load, async (failure) => {
                // la ✕ ya le avisó a FilePond (abort de abajo)
                if (failure?.name === 'AbortError') {
                    return;
                }
                error(await failureMessageOf(failure, toProblem));
            });

            // la ✕ de la tarjeta cancela la petición de verdad
            return {
                abort: () => {
                    upload.abort();
                    abort();
                },
            };
        },
        // sin nada que deshacer en el servidor: el «deshacer» de la tarjeta es local. Si el backend guarda el archivo,
        // aquí iría su DELETE con el id que regresó
        revert: (serverId, load) => load(),
    };
}
