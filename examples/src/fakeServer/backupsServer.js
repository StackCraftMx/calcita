// Lo que respondería el API que recibe respaldos POR TROZOS, con el protocolo de trozos de FilePond: el POST aparta un folio,
// cada PATCH guarda su trozo en su lugar y el HEAD dice hasta dónde llegó. Como hacen algunos servidores de verdad, este
// espera medio segundo después de guardar cada trozo: así se ve que la barra no dice 100 % antes de tiempo.
//
// Contesta como fetch (un Response) y con la forma de uploadWithProgress: la pantalla lo pasa en sendRequest de
// createPondServer. Con un backend de verdad, sendRequest se quita y todo lo demás se queda igual.
//
// Además:
//   - rechaza al pedir el folio un respaldo de más de 20 MB, con el error a la manera de Laravel ({message, errors}): la
//     pantalla lo lee con toProblem;
//   - el tercer trozo de cada respaldo falla UNA vez (503, «el servidor se cayó»): se ve que el trozo se reintenta solo y que
//     la barra no regresa;
//   - avisa lo que va pasando (subscribeToBackupServer), para que el ejemplo enseñe qué recibió el servidor.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {formatFileSize} from '@stackcraftmx/calcita';

import {waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

const HTTP_STATUS = Object.freeze({ok: 200, noContent: 204, notFound: 404, unprocessable: 422, unavailable: 503});
/** Lo más que acepta el servidor por respaldo. */
export const BACKUP_MAX_BYTES = 20_000_000;
// lo que tarda en viajar cada trozo y lo que espera el servidor después de guardarlo
const PIECE_TRAVEL_MILLISECONDS = 300;
const PIECE_PAUSE_MILLISECONDS = 500;
const PIECE_TRAVEL_STEPS = 5;
// el trozo que falla una vez en cada respaldo (contando desde 0): el tercero
const FAILING_PIECE_NUMBER = 2;

/** Lo que el servidor va avisando, para el registro del ejemplo. */
export const BACKUP_SERVER_EVENT = Object.freeze({
    folio: 'folio',
    piece: 'piece',
    failed: 'failed',
    stored: 'stored',
    rejected: 'rejected',
});

// los respaldos en curso, por folio: lo que pesa, cómo se llama y qué trozos ya guardó
const backups = new Map();
const listeners = new Set();
let folioCounter = 0;

/**
 * Una respuesta JSON (Response.json no existe en los iPhone de antes de iOS 17).
 *
 * @param {object} body
 * @param {number} status
 * @returns {Response}
 */
function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {status, headers: {'Content-Type': 'application/json'}});
}

/**
 * Avisa a quien escucha (el registro del ejemplo).
 *
 * @param {object} event
 */
function announce(event) {
    for (const listener of listeners) {
        listener(event);
    }
}

/**
 * Escucha lo que va pasando en el servidor. Regresa la función para dejar de escuchar.
 *
 * @param {(event: object) => void} listener
 * @returns {() => void}
 */
export function subscribeToBackupServer(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/**
 * Un header que viajó en UTF-8 byte por byte (como los manda Calcita por trozos), de vuelta a texto.
 *
 * @param {string|undefined} value
 * @returns {string}
 */
function textOfHeader(value) {
    return new TextDecoder().decode(Uint8Array.from(value ?? '', (character) => character.charCodeAt(0)));
}

/**
 * Hasta dónde está guardado un respaldo sin huecos: lo que diría el HEAD.
 *
 * @param {{pieces: Map<number, number>}} backup
 * @returns {number}
 */
function storedOffsetOf(backup) {
    let offset = 0;
    while (backup.pieces.has(offset) && backup.pieces.get(offset) > 0) {
        offset += backup.pieces.get(offset);
    }
    return offset;
}

/**
 * Un cuerpo que viaja poco a poco, con su avance en bytes como uploadWithProgress.
 *
 * @param {Blob|null} body
 * @param {Function|undefined} onProgress
 * @param {AbortSignal} signal
 * @returns {Promise<void>}
 */
async function travel(body, onProgress, signal) {
    const size = body?.size ?? 0;
    for (let step = 1; step <= PIECE_TRAVEL_STEPS; step += 1) {
        await waitLikeNetwork(PIECE_TRAVEL_MILLISECONDS / PIECE_TRAVEL_STEPS, signal);
        const loaded = Math.round((size * step) / PIECE_TRAVEL_STEPS);
        onProgress?.(size > 0 ? Math.round((loaded / size) * 100) : 100, {loaded, total: size});
    }
}

/**
 * El folio: aparta el lugar del respaldo o lo rechaza si pesa de más.
 *
 * @param {Record<string, string>} headers
 * @returns {Response}
 */
function startBackup(headers) {
    const totalBytes = Number(headers['Upload-Length']);
    if (totalBytes > BACKUP_MAX_BYTES) {
        const message = serverTextOf('backups.tooLarge', {max: formatFileSize(BACKUP_MAX_BYTES)});
        announce({type: BACKUP_SERVER_EVENT.rejected, message});
        return jsonResponse({message: serverTextOf('backups.invalid'), errors: {backup: [message]}}, HTTP_STATUS.unprocessable);
    }
    folioCounter += 1;
    const folio = `respaldo-${folioCounter}`;
    backups.set(folio, {totalBytes, fileName: null, pieces: new Map(), patchCount: 0});
    announce({type: BACKUP_SERVER_EVENT.folio, folio, totalBytes});
    return new Response(folio, {status: HTTP_STATUS.ok, headers: {'Content-Type': 'text/plain'}});
}

/**
 * Guarda un trozo en su lugar; con el último, el respaldo queda completo.
 *
 * @param {string} folio
 * @param {Blob} body
 * @param {Record<string, string>} headers
 * @param {AbortSignal} signal
 * @returns {Promise<Response>}
 */
async function storePiece(folio, body, headers, signal) {
    const backup = backups.get(folio);
    if (!backup) {
        return new Response(null, {status: HTTP_STATUS.notFound});
    }
    const pieceNumber = backup.patchCount;
    backup.patchCount += 1;
    // el tercer trozo falla una sola vez: el reintento del mismo trozo ya entra
    if (pieceNumber === FAILING_PIECE_NUMBER) {
        announce({type: BACKUP_SERVER_EVENT.failed, folio, offset: Number(headers['Upload-Offset'])});
        return new Response(serverTextOf('backups.unavailable'), {status: HTTP_STATUS.unavailable});
    }
    const offset = Number(headers['Upload-Offset']);
    backup.fileName = textOfHeader(headers['Upload-Name']);
    backup.pieces.set(offset, body.size);
    // lo que tarda el servidor después de guardar el trozo
    await waitLikeNetwork(PIECE_PAUSE_MILLISECONDS, signal);
    const storedBytes = storedOffsetOf(backup);
    announce({type: BACKUP_SERVER_EVENT.piece, folio, offset, size: body.size, storedBytes, totalBytes: backup.totalBytes});
    if (storedBytes < backup.totalBytes) {
        return new Response(null, {status: HTTP_STATUS.noContent});
    }
    backups.delete(folio);
    announce({type: BACKUP_SERVER_EVENT.stored, folio, fileName: backup.fileName, totalBytes: backup.totalBytes});
    return jsonResponse({message: serverTextOf('backups.stored'), file_id: folio}, HTTP_STATUS.ok);
}

/**
 * La petición al servidor de respaldos, con la forma de uploadWithProgress: POST /backups (el folio), PATCH
 * /backups?patch=<folio> (cada trozo) y HEAD /backups?patch=<folio> (hasta dónde llegó).
 *
 * @param {string} url
 * @param {FormData|Blob|null} body
 * @param {{method: string, headers: Record<string, string>, signal: AbortSignal, onProgress?: Function}} options
 * @returns {Promise<Response>}
 */
export async function sendBackupRequest(url, body, {method, headers, signal, onProgress}) {
    const folio = new URL(url, 'https://ejemplo.invalid').searchParams.get('patch');
    if (method === 'POST') {
        await waitLikeNetwork(PIECE_TRAVEL_MILLISECONDS, signal);
        return startBackup(headers);
    }
    if (method === 'HEAD') {
        await waitLikeNetwork(PIECE_TRAVEL_MILLISECONDS, signal);
        const backup = backups.get(folio);
        return new Response(null, {status: backup ? HTTP_STATUS.ok : HTTP_STATUS.notFound, headers: {'Upload-Offset': String(backup ? storedOffsetOf(backup) : 0)}});
    }
    await travel(body, onProgress, signal);
    return storePiece(folio, body, headers, signal);
}
