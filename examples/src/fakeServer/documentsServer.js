// Lo que respondería el API de documentos (POST /documents y GET /documents/{id}): recibe UN archivo, lo guarda y regresa
// su id; el formulario manda después ese id con lo demás. Así trabaja el cargador mini (FileUploadInput): sube en cuanto se
// elige, con su avance.
//
// Revisa lo mismo que la pantalla (tipo y peso) y además lo que solo puede ver el servidor: que un PDF de verdad sea PDF.
// La subida va al ritmo de una red lenta (velocidad fija) para que se vea el avance, la velocidad y lo que falta. Con la
// misma llave (idempotencyKey) regresa el mismo id: si la red se cae a media subida y se repite, no quedan dos copias.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {formatFileSize} from '@stackcraftmx/calcita';

import {ApiError} from '@/fakeServer/ApiError.js';
import {deliverLikeNetwork, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

const HTTP_STATUS = Object.freeze({notFound: 404, unprocessable: 422});
// lo que acepta: PDF o foto, hasta 5 MB (la pantalla revisa lo mismo antes de subir)
const DOCUMENT_MAX_BYTES = 5_000_000;
const DOCUMENT_EXTENSION = /\.(pdf|jpe?g|png)$/i;
const PDF_EXTENSION = /\.pdf$/i;
// un PDF empieza con «%PDF»: lo que no, se renombró o está dañado
const PDF_SIGNATURE = '%PDF';
// la red de mentira: 400 kB por segundo, en pasos de un cuarto de segundo, y lo que tarda en revisarlo
const BYTES_PER_SECOND = 400_000;
const PROGRESS_STEP_MILLISECONDS = 250;
const MINIMUM_SENDING_MILLISECONDS = 1500;
const PROCESSING_MILLISECONDS = 600;
const DOWNLOAD_MILLISECONDS = 600;

// los documentos subidos, en la memoria de esta pestaña: id → {file}; y llave → id
const storedDocuments = new Map();
const documentIdByKey = new Map();
let nextDocumentNumber = 1;

const problemOf = (detail) => new ApiError({
    status: HTTP_STATUS.unprocessable,
    problem: {status: HTTP_STATUS.unprocessable, title: serverTextOf('validation.title'), detail, errors: {file: [detail]}},
});

/**
 * POST /documents: sube un documento.
 *
 * @param {File} file
 * @param {{signal: AbortSignal, idempotencyKey: string, onUploadProgress: (transfer: {loaded: number, total: number}) => void}} options
 * @returns {Promise<{id: string, name: string, size: number}>}
 */
export async function uploadDocument(file, {signal, idempotencyKey, onUploadProgress}) {
    // el cuerpo viaja poco a poco: tarda según el peso, como en una red lenta
    const sendingMilliseconds = Math.max(MINIMUM_SENDING_MILLISECONDS, (file.size / BYTES_PER_SECOND) * 1000);
    const steps = Math.max(1, Math.round(sendingMilliseconds / PROGRESS_STEP_MILLISECONDS));
    for (let step = 1; step <= steps; step += 1) {
        await waitLikeNetwork(sendingMilliseconds / steps, signal);
        onUploadProgress({loaded: Math.round((file.size * step) / steps), total: file.size});
    }
    await waitLikeNetwork(PROCESSING_MILLISECONDS, signal);

    if (documentIdByKey.has(idempotencyKey)) {
        const repeated = storedDocuments.get(documentIdByKey.get(idempotencyKey));
        return {id: documentIdByKey.get(idempotencyKey), name: repeated.name, size: repeated.size};
    }
    if (!DOCUMENT_EXTENSION.test(file.name)) {
        throw problemOf(serverTextOf('documents.invalidType'));
    }
    if (file.size > DOCUMENT_MAX_BYTES) {
        throw problemOf(serverTextOf('documents.tooLarge', {max: formatFileSize(DOCUMENT_MAX_BYTES)}));
    }
    if (PDF_EXTENSION.test(file.name) && (await file.slice(0, PDF_SIGNATURE.length).text()) !== PDF_SIGNATURE) {
        throw problemOf(serverTextOf('documents.notPdf'));
    }

    const id = `document-${nextDocumentNumber}`;
    nextDocumentNumber += 1;
    storedDocuments.set(id, file);
    documentIdByKey.set(idempotencyKey, id);
    return {id, name: file.name, size: file.size};
}

/**
 * GET /documents/{id}: baja un documento que ya se subió (para revisarlo antes de enviar).
 *
 * @param {string} documentId
 * @param {{signal: AbortSignal, onDownloadProgress: Function}} transferOptions las que pasa startDownload
 * @returns {Promise<{blob: Blob, fileName: string}>}
 */
export async function downloadUploadedDocument(documentId, transferOptions) {
    const file = storedDocuments.get(documentId);
    if (!file) {
        throw new ApiError({status: HTTP_STATUS.notFound, problem: {title: serverTextOf('documents.notFoundTitle'), detail: serverTextOf('documents.notFound')}});
    }
    await deliverLikeNetwork(file, transferOptions, DOWNLOAD_MILLISECONDS);
    return {blob: file, fileName: file.name};
}

/**
 * ¿Ese id es de un documento que de verdad se subió? (lo revisa quien recibe el formulario)
 *
 * @param {string} documentId
 * @returns {boolean}
 */
export function isUploadedDocument(documentId) {
    return storedDocuments.has(documentId);
}

/**
 * El nombre y el peso de un documento que ya se subió, para enseñarlo al editar (null si no existe).
 *
 * @param {string} documentId
 * @returns {{name: string, size: number}|null}
 */
export function uploadedDocumentOf(documentId) {
    const file = storedDocuments.get(documentId);
    return file ? {name: file.name, size: file.size} : null;
}
