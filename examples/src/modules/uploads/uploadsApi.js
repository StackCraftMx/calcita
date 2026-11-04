// Las llamadas del ejemplo de subir archivos al API (aquí, al servidor de mentira).
//
// Con un backend de verdad, downloadPaymentsTemplate pide la plantilla con la petición de la casa (como una descarga), y
// importPaymentsFile y uploadAttachments arman su FormData y suben con uploadWithProgress del
// paquete (la misma firma: lo de la pantalla, onProgress y la señal para cancelar), y attachmentPondServer se cambia por
// createPondServer({url}) de @stackcraftmx/calcita/filepond.
//
// backupPondServer y uploadBackupInPieces ya son los de la casa, por trozos: con un backend de verdad solo se les quita
// sendRequest.
import {createChunkedUpload} from '@stackcraftmx/calcita';
import {createPondServer} from '@stackcraftmx/calcita/filepond';

import {sendBackupRequest} from '@/fakeServer/backupsServer.js';

export {attachmentPondServer, downloadPaymentsTemplate, importPaymentsFile, uploadAttachments} from '@/fakeServer/uploadsServer.js';
export {BACKUP_MAX_BYTES, BACKUP_SERVER_EVENT, subscribeToBackupServer} from '@/fakeServer/backupsServer.js';

/**
 * El error de un backend a la manera de Laravel ({message, errors}) en la forma RFC 9457 que lee la casa: title y detail con
 * el primer motivo (o el mensaje general si no trae motivos) y los errores por campo tal cual. La tarjeta de FilePond enseña
 * el title; el renglón del cargador mini, el primer error por campo.
 *
 * @param {{message?: string, errors?: Record<string, string[]>}} body
 * @returns {{title?: string, detail?: string, errors?: Record<string, string[]>}}
 */
export function laravelProblemOf(body) {
    const reason = Object.values(body.errors ?? {}).flat()[0] ?? body.message;
    return {title: reason, detail: reason, errors: body.errors};
}

/** El respaldo sube por trozos: el folio con un POST y cada trozo con su PATCH a /api/backups?patch=<folio>. */
export const backupPondServer = createPondServer({
    url: '/api/backups',
    patchUrl: '/api/backups?patch=',
    toProblem: laravelProblemOf,
    sendRequest: sendBackupRequest,
});

/** Lo mismo para el cargador mini: la función upload de cada renglón, en trozos de 1 MB. */
export const uploadBackupInPieces = createChunkedUpload({
    url: '/api/backups',
    patchUrl: '/api/backups?patch=',
    chunkSize: '1 MB',
    chunkRetryDelays: [500, 1000],
    toProblem: laravelProblemOf,
    sendRequest: sendBackupRequest,
});
