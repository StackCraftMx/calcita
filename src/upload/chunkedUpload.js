// Subir UN archivo por trozos, con el protocolo de trozos de FilePond (el que ya esperan los backends que lo usan):
//   1. POST a url con «Upload-Length» (lo que pesa el archivo): el servidor aparta un lugar y contesta su folio (texto)
//   2. cada trozo en su PATCH a patchUrl + folio, uno detrás de otro, con Upload-Offset (dónde empieza), Upload-Length y
//      Upload-Name; el cuerpo es el pedazo del archivo tal cual (application/offset+octet-stream)
//   3. al reintentar después de un error, HEAD a patchUrl + folio: «Upload-Offset» dice desde dónde seguir
//
// Lo usan la zona de FilePond (createPondServer, con chunkUploads) y el cargador mini (createChunkedUpload, la función
// upload de FileUploadInput y FormFileUploadField).
//
// Por qué lo hace Calcita y no FilePond: FilePond cuenta lo que ya SALIÓ del navegador y pinta «100 %» mientras el servidor
// todavía guarda el último trozo (hay servidores que esperan medio segundo por trozo, a propósito). Aquí la barra es honesta:
//   - suma lo que el servidor ya confirmó más lo que va en camino del trozo de ahora;
//   - nunca regresa (un trozo que se reintenta no baja la barra);
//   - el final depende de la vista (holdBeforeFull): la tarjeta de FilePond no tiene «Procesando», así que se queda en 99 %
//     hasta que el servidor confirma el último trozo; el cargador mini sí lo tiene: llega a 100 % cuando salió el último
//     byte y su «Procesando» dice que el servidor está guardando.
// Los trozos van uno tras otro, nunca juntos: el que tarda es el servidor y mandar dos a la vez no gana nada.
//
// Reintentos: solo cuando no hubo respuesta o el servidor falló (5xx), con las esperas de retryDelays. Un 4xx es el servidor
// diciendo que no: se enseña en seguida, sin hacer esperar a la persona.
//
// OJO, distinto de FilePond: con un archivo que mide justo N trozos, FilePond manda al final un PATCH vacío de más (el
// servidor ya había armado el archivo); aquí no.
//
// Cada petición sale por sendRequest, con la misma forma que uploadWithProgress de la casa (url, cuerpo, {method, headers,
// onProgress, signal, withCredentials}) → Response: así el proyecto la pasa por su propio cliente, o se prueba sin servidor.
//
// Funciones del navegador, sin React: function (regla de la casa). Se prueba con node --test (chunkedUpload.test.js) con un
// servidor de mentira.
import {ApiError} from '@/api/ApiError.js';
import {createLogger} from '@/observability/logger.js';
import {toolkitSettings, translateToolkit} from '@/toolkit/toolkitSettings.js';
import {parseFileSize} from '@/upload/fileRules.js';
import {uploadWithProgress} from '@/upload/uploadWithProgress.js';

const log = createLogger('upload');

/** Los headers del protocolo de trozos de FilePond. */
export const CHUNK_HEADER = Object.freeze({
    length: 'Upload-Length',
    offset: 'Upload-Offset',
    name: 'Upload-Name',
    contentType: 'Content-Type',
});

/** Por qué no se pudo subir: el servidor dijo que no, no contestó, o no dio el folio de la subida. */
export const UPLOAD_FAILURE = Object.freeze({rejected: 'rejected', noResponse: 'noResponse', noTransferId: 'noTransferId'});

// el cuerpo de cada trozo: los bytes del archivo tal cual, desde Upload-Offset
const CHUNK_CONTENT_TYPE = 'application/offset+octet-stream';
// la barra se detiene aquí hasta que el servidor confirma el último trozo (FilePond redondea: 99.6 % ya diría «100 %»)
const HONEST_CEILING = 0.99;
const SERVER_ERROR_STATUS = 500;
// status de «no hubo respuesta» (los textos del paquete dicen «sin conexión»)
const OFFLINE_STATUS = 0;
/** Los de FilePond: trozos de 5 MB y tres reintentos por trozo. */
export const DEFAULT_CHUNK_SIZE = 5_000_000;
export const DEFAULT_CHUNK_RETRY_DELAYS = Object.freeze([500, 1000, 3000]);

/** Una subida que no salió: el motivo (UPLOAD_FAILURE) y la respuesta del servidor, si la hubo. */
export class UploadFailure extends Error {
    /**
     * @param {string} reason de UPLOAD_FAILURE
     * @param {Response|null} [response]
     */
    constructor(reason, response = null) {
        super(`La subida no salió: ${reason}`);
        this.name = 'UploadFailure';
        this.reason = reason;
        this.response = response;
    }
}

/**
 * Los trozos de un archivo: dónde empieza y dónde acaba cada uno. Un archivo vacío es un trozo vacío: el servidor igual
 * necesita saber que el archivo llegó completo.
 *
 * @param {number} fileSize en bytes
 * @param {number} chunkSize en bytes
 * @returns {{index: number, offset: number, end: number}[]}
 */
export function chunkPiecesOf(fileSize, chunkSize) {
    const count = Math.max(1, Math.ceil(fileSize / chunkSize));
    return Array.from({length: count}, (_, index) => {
        const offset = index * chunkSize;
        return {index, offset, end: Math.min(offset + chunkSize, fileSize)};
    });
}

/**
 * Lo que la barra puede decir que ya subió: lo que el servidor confirmó más lo que va en camino del trozo de ahora, sin
 * llegar al final hasta que el servidor confirma el último trozo.
 *
 * @param {{confirmedBytes: number, sendingBytes: number, totalBytes: number}} transfer
 * @returns {number} bytes
 */
export function honestLoadedOf({confirmedBytes, sendingBytes, totalBytes}) {
    return Math.min(confirmedBytes + sendingBytes, Math.floor(totalBytes * HONEST_CEILING));
}

/**
 * Hasta dónde ya está guardado el archivo cuando el servidor dice su Upload-Offset: el final del último trozo COMPLETO antes
 * de ese punto. Un trozo que quedó a medias se vuelve a mandar entero.
 *
 * @param {{offset: number, end: number}[]} pieces
 * @param {number} serverOffset
 * @returns {number}
 */
export function storedBytesOf(pieces, serverOffset) {
    return pieces.filter((piece) => piece.end > piece.offset && piece.end <= serverOffset).reduce((last, piece) => Math.max(last, piece.end), 0);
}

/**
 * Un texto listo para viajar en un header. Los headers solo llevan bytes: el texto va en UTF-8 byte por byte (lo mismo que
 * FilePond hace con los suyos). Sin esto, un nombre con «–» o con un emoji tumba la petición y uno con acentos llega roto.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function headerTextOf(value) {
    return String.fromCharCode(...new TextEncoder().encode(String(value)));
}

/**
 * @param {Record<string, unknown>} headers
 * @returns {Record<string, string>}
 */
function headerTextsOf(headers) {
    return Object.fromEntries(Object.entries(headers).map(([name, value]) => [name, headerTextOf(value)]));
}

/**
 * Espera antes de reintentar; si la persona cancela mientras tanto, termina en AbortError como lo demás.
 *
 * @param {number} milliseconds
 * @param {AbortSignal} signal
 * @returns {Promise<void>}
 */
function waitBeforeRetry(milliseconds, signal) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, milliseconds);
        signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('La subida se canceló', 'AbortError'));
        }, {once: true});
    });
}

/**
 * Manda una petición y la repite si no hubo respuesta o el servidor falló (5xx), con las esperas de retryDelays. Regresa la
 * respuesta buena; si no la hubo, termina en UploadFailure. Cancelar termina en AbortError.
 *
 * @param {() => Promise<Response>} sendOnce
 * @param {number[]|null|undefined} retryDelays
 * @param {AbortSignal} signal
 * @returns {Promise<Response>}
 */
async function sendWithRetries(sendOnce, retryDelays, signal) {
    const delays = [...(retryDelays ?? [])];
    for (;;) {
        let response = null;
        try {
            response = await sendOnce();
        } catch (failure) {
            // cancelar no es un error de la subida: sube tal cual
            if (failure?.name === 'AbortError') {
                throw failure;
            }
            // sin respuesta (sin red, el servidor se cayó): se puede reintentar
        }
        if (response?.ok) {
            return response;
        }
        const canRetry = response === null || response.status >= SERVER_ERROR_STATUS;
        if (!canRetry || delays.length === 0) {
            throw new UploadFailure(response ? UPLOAD_FAILURE.rejected : UPLOAD_FAILURE.noResponse, response);
        }
        await waitBeforeRetry(delays.shift(), signal);
    }
}

/**
 * @typedef {(url: string, body: FormData|Blob|null, options: {method: string, headers: Record<string, string>, withCredentials: boolean, signal: AbortSignal, onProgress?: (percent: number, transfer: {loaded: number, total: number}) => void}) => Promise<Response>} UploadSendRequest
 *   cómo viaja cada petición: la misma forma que uploadWithProgress de la casa
 */

/**
 * A dónde van los trozos si no se dice: lo que usa FilePond, «?patch=» pegado a url (o «&patch=» si url ya trae «?»).
 *
 * @param {string} url
 * @returns {string}
 */
export function defaultPatchUrlOf(url) {
    return `${url}${url.includes('?') ? '&' : '?'}patch=`;
}

/**
 * El problema del cuerpo de error: el JSON del servidor, pasado por el adaptador del proyecto (toProblem). Lo que no sea un
 * objeto cuenta como sin problema (se usa el texto genérico del paquete). Un adaptador que truena no tumba el mensaje.
 *
 * @param {Response} response
 * @param {((body: any, response: Response) => any)|undefined} toProblem
 * @returns {Promise<object|null>}
 */
export async function problemOfResponse(response, toProblem) {
    let body = null;
    try {
        body = JSON.parse(await response.text());
    } catch {
        // la respuesta no era JSON (un 502 del proxy en HTML): va el título genérico de su status
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return null;
    }
    if (!toProblem) {
        return body;
    }
    try {
        const problem = toProblem(body, response);
        return problem && typeof problem === 'object' && !Array.isArray(problem) ? problem : null;
    } catch (failure) {
        log.error('toProblem tronó al leer el error de una subida', failure);
        return null;
    }
}

/**
 * Sube un archivo por trozos (ver el encabezado). Regresa la subida en curso: done termina con el folio que dio el servidor
 * y abort la cancela de verdad (la petición de ahora y los reintentos que esperaban).
 *
 * @param {object} options
 * @param {Blob} options.file
 * @param {string} options.fileName el que viaja en Upload-Name
 * @param {string} options.fieldName el campo del primer POST: lleva los metadatos en JSON, como FilePond
 * @param {object|null} [options.metadata]
 * @param {string} options.url a dónde va el POST que pide el folio
 * @param {string} options.patchUrl a dónde va cada trozo: el folio va pegado al final ('/subidas?patch=')
 * @param {Record<string, unknown>} [options.headers] van en las tres peticiones (Authorization, los datos de la pantalla)
 * @param {boolean} [options.withCredentials]
 * @param {number} options.chunkSize en bytes
 * @param {number[]|null} [options.retryDelays] las esperas entre reintentos, en milisegundos; null o [] = sin reintentos
 * @param {string|null} [options.transferId] el folio de un intento anterior: se sigue desde donde se quedó
 * @param {(transferId: string) => void} [options.onTransferId] el folio nuevo, para retomar si algo falla
 * @param {(loaded: number, total: number) => void} [options.onProgress] lo honesto (ver honestLoadedOf), en bytes
 * @param {boolean} [options.holdBeforeFull] true (por omisión): la barra se queda en 99 % hasta que el servidor confirma el
 *     último trozo (una vista sin «Procesando»); false: llega a 100 % cuando salió el último byte
 * @param {UploadSendRequest} options.sendRequest
 * @returns {{done: Promise<string>, abort: () => void}}
 */
export function startChunkedUpload(options) {
    const controller = new AbortController();
    const done = runChunkedUpload(options, controller.signal);
    return {done, abort: () => controller.abort()};
}

/**
 * @param {Parameters<typeof startChunkedUpload>[0]} options
 * @param {AbortSignal} signal
 * @returns {Promise<string>} el folio
 */
async function runChunkedUpload(options, signal) {
    const {file, fileName, fieldName, metadata = null, url, patchUrl, headers = {}, withCredentials = false, chunkSize, retryDelays,
        transferId = null, onTransferId, onProgress, holdBeforeFull = true, sendRequest} = options;
    const totalBytes = file.size;
    const pieces = chunkPiecesOf(totalBytes, chunkSize);
    const send = (requestUrl, body, method, protocolHeaders, onUploadProgress) => sendRequest(requestUrl, body, {
        method, headers: headerTextsOf({...headers, ...protocolHeaders}), withCredentials, signal, onProgress: onUploadProgress,
    });

    // lo que la barra ya enseñó: nunca regresa
    let shownBytes = 0;
    let confirmedBytes = 0;
    const showProgress = (sendingBytes) => {
        // cancelada, ya no hay avance que contar: la tarjeta se queda en «cancelada»
        if (signal.aborted) {
            return;
        }
        const loadedBytes = holdBeforeFull
            ? honestLoadedOf({confirmedBytes, sendingBytes, totalBytes})
            : Math.min(confirmedBytes + sendingBytes, totalBytes);
        shownBytes = Math.max(shownBytes, loadedBytes);
        // un archivo vacío no tiene avance que contar
        if (totalBytes > 0) {
            onProgress?.(shownBytes, totalBytes);
        }
    };

    // 1. el folio: uno nuevo, o el del intento anterior y hasta dónde llegó
    let folio = transferId;
    if (folio) {
        const offsetResponse = await sendWithRetries(() => send(`${patchUrl}${encodeURIComponent(folio)}`, null, 'HEAD', {}), retryDelays, signal);
        const serverOffset = Number.parseInt(offsetResponse.headers.get(CHUNK_HEADER.offset) ?? '', 10);
        confirmedBytes = storedBytesOf(pieces, Number.isNaN(serverOffset) ? 0 : serverOffset);
    } else {
        const firstRequest = new FormData();
        // los metadatos de FilePond van en el campo del archivo, como los manda FilePond
        if (metadata && typeof metadata === 'object') {
            firstRequest.append(fieldName, JSON.stringify(metadata));
        }
        const transferResponse = await sendWithRetries(() => send(url, firstRequest, 'POST', {[CHUNK_HEADER.length]: totalBytes}), retryDelays, signal);
        folio = (await transferResponse.text()).trim();
        if (!folio) {
            throw new UploadFailure(UPLOAD_FAILURE.noTransferId, transferResponse);
        }
        onTransferId?.(folio);
    }
    showProgress(0);

    // 2. los trozos que faltan, uno tras otro: el siguiente sale cuando el servidor confirmó el anterior
    for (const piece of pieces) {
        const isAlreadyStored = piece.end > piece.offset && piece.end <= confirmedBytes;
        if (isAlreadyStored) {
            continue;
        }
        const pieceHeaders = {
            [CHUNK_HEADER.contentType]: CHUNK_CONTENT_TYPE,
            [CHUNK_HEADER.offset]: piece.offset,
            [CHUNK_HEADER.length]: totalBytes,
            [CHUNK_HEADER.name]: fileName,
        };
        await sendWithRetries(
            () => send(`${patchUrl}${encodeURIComponent(folio)}`, file.slice(piece.offset, piece.end, CHUNK_CONTENT_TYPE), 'PATCH', pieceHeaders,
                (percent, transfer) => showProgress(transfer.loaded)),
            retryDelays,
            signal,
        );
        confirmedBytes = piece.end;
        showProgress(0);
    }
    return folio;
}

/**
 * El ApiError de una subida que no salió, para las vistas que leen el error de la casa (el cargador mini enseña el motivo del
 * servidor: el primer error por campo o su detail).
 *
 * @param {unknown} failure
 * @param {((body: any, response: Response) => any)|undefined} toProblem
 * @returns {Promise<ApiError>}
 */
async function apiErrorOfFailure(failure, toProblem) {
    if (failure?.reason === UPLOAD_FAILURE.noTransferId) {
        const message = translateToolkit('common', 'upload.pond.noTransferId');
        return new ApiError({status: failure.response?.status ?? OFFLINE_STATUS, problem: {title: message, detail: message}});
    }
    if (failure?.reason === UPLOAD_FAILURE.rejected && failure.response) {
        return new ApiError({status: failure.response.status, problem: await problemOfResponse(failure.response, toProblem)});
    }
    if (failure?.reason !== UPLOAD_FAILURE.noResponse) {
        // no es de la red ni del servidor: un error de programación, que se anota para encontrarlo
        log.error('La subida por trozos falló sin respuesta del servidor', failure);
    }
    return new ApiError({status: OFFLINE_STATUS});
}

/**
 * La subida por trozos para el cargador mini (upload de FileUploadInput y FormFileUploadField) o para una pantalla propia:
 * regresa esa función upload. Todo va por trozos (un archivo chico va en un solo trozo); si solo los grandes deben ir por
 * trozos, la pantalla elige: upload={(file, options) => (file.size > LIMITE ? porTrozos : subidaNormal)(file, options)}.
 *
 *   const uploadBackup = createChunkedUpload({url: '/upload', patchUrl: '/upload?patch=', chunkSize: '1 MB'});
 *   <FileUploadInput label="Respaldo" value={fileId} onChange={setFileId} upload={uploadBackup} />
 *
 * Al terminar regresa {id: folio} (idOf lo lee por omisión). Con todo enviado la barra llega a 100 % y el renglón dice
 * «Procesando» hasta que el servidor guarda el último trozo. Los errores son ApiError: el renglón enseña el motivo del
 * servidor (con toProblem, también el de un backend que no contesta RFC 9457). Cancelar termina en AbortError.
 *
 * @param {object} options
 * @param {string} options.url a dónde va el POST que pide el folio
 * @param {string} [options.patchUrl] a dónde va cada trozo, con el folio pegado al final; por omisión url + '?patch='
 * @param {number|string} [options.chunkSize] en bytes o con unidades ('1 MB'); por omisión 5 MB, el de FilePond
 * @param {number[]|null} [options.chunkRetryDelays] esperas entre reintentos de un trozo (ms); null o [] = sin reintentos
 * @param {Record<string, string>} [options.headers] van en todas las peticiones, como texto normal (viajan en UTF-8)
 * @param {boolean} [options.withCredentials]
 * @param {(body: any, response: Response) => any} [options.toProblem] el error del backend a la forma RFC 9457
 * @param {UploadSendRequest} [options.sendRequest] cómo viaja cada petición; por omisión uploadWithProgress de la casa
 * @param {string} [options.fieldName] el campo del primer POST; por omisión 'file'
 * @param {object|null} [options.metadata] lo que viaja en ese campo en JSON, como los metadatos de FilePond
 * @returns {(file: File, options?: {signal?: AbortSignal, onUploadProgress?: (transfer: {loaded: number, total: number}) => void}) => Promise<{id: string}>}
 */
export function createChunkedUpload({url, patchUrl, chunkSize = DEFAULT_CHUNK_SIZE, chunkRetryDelays = DEFAULT_CHUNK_RETRY_DELAYS, headers = {},
    withCredentials = false, toProblem, sendRequest = uploadWithProgress, fieldName = 'file', metadata = null}) {
    const chunkBytes = parseFileSize(chunkSize);
    const piecesUrl = patchUrl ?? defaultPatchUrlOf(url);
    return (file, {signal, onUploadProgress} = {}) => new Promise((resolve, reject) => {
        const running = startChunkedUpload({
            file, fileName: file.name, fieldName, metadata, url, patchUrl: piecesUrl, withCredentials, chunkSize: chunkBytes,
            headers: {'Accept-Language': toolkitSettings().language, ...headers}, retryDelays: chunkRetryDelays, sendRequest,
            holdBeforeFull: false, onProgress: (loaded, total) => onUploadProgress?.({loaded, total}),
        });
        signal?.addEventListener('abort', () => running.abort(), {once: true});
        if (signal?.aborted) {
            running.abort();
        }
        running.done.then(
            (folio) => resolve({id: folio}),
            async (failure) => reject(failure?.name === 'AbortError' ? failure : await apiErrorOfFailure(failure, toProblem)),
        );
    });
}
