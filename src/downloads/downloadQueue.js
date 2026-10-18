// Arranca descargas y las anota en la lista que pinta DownloadManager (el administrador de descargas).
//
// Uso (desde un módulo, que es quien conoce el API):
//   startDownload({
//       label: t('detail.downloadLog'),
//       request: (transferOptions) => ingestionApi.downloadProcessingLog(batchId, transferOptions),
//       onCompleted: () => refreshPeriods(),
//   });
//
// startDownload no espera a que termine quien la llama: el diálogo de confirmación se cierra en cuanto la descarga entra
// a la lista y la persona sigue trabajando mientras baja (el log más grande tarda ~30 s). El panel (tipo Google Drive) es
// el ÚNICO lugar que avisa: avance, lista y error con su texto del API (RFC 9457). Sin aviso aparte, para no avisar dos
// veces lo mismo.
//
// Una sola lista para toda la app (un actor de módulo, como el cliente de createApiClient): la llenan varias pantallas y
// la lee un solo panel montado en la raíz de la aplicación.
//
// Funciones puras del paquete, no renderizan: function (regla de la casa). No conoce el API: el archivo lo pide la
// `request` que le pasan.
import {createActor} from 'xstate';

import {DOWNLOAD_STATUS, downloadsMachine} from '@/downloads/downloadsMachine.js';
import {saveBlob} from '@/files.js';
import {newIdentifier} from '@/identifiers.js';

export const downloadsActor = createActor(downloadsMachine).start();

// cómo cancelar cada descarga en curso; vive fuera del contexto de la máquina porque un AbortController no es un dato
const abortControllerByDownloadId = new Map();

/**
 * Descarga un archivo con avance en el panel, lo guarda en disco y avisa al terminar.
 *
 * @param {object} options
 * @param {string} options.label ya traducido; lo que se ve en el panel mientras todavía no se sabe el nombre del
 *     archivo
 * @param {'xlsx'|'csv'|'pdf'} [options.format] para el ícono del tipo de archivo en el panel
 * @param {(transferOptions: {signal: AbortSignal, onDownloadProgress: (progress: {loaded: number, total?: number|null}) => void}) => Promise<{blob: Blob, fileName: string}>} options.request
 * @param {(fileName: string) => void} [options.onCompleted] p. ej. volver a pedir la tabla (si la descarga cambia algo
 *     en el servidor)
 * @returns {Promise<string>} id de la descarga; la promesa se cumple cuando termina (bien, mal o cancelada), nunca falla
 */
export async function startDownload({label, format, request, onCompleted}) {
    const downloadId = newIdentifier();
    const abortController = new AbortController();
    abortControllerByDownloadId.set(downloadId, abortController);
    downloadsActor.send({type: 'STARTED', id: downloadId, label, format});

    try {
        const {blob, fileName} = await request({
            signal: abortController.signal,
            // la petición avisa cada pedazo que llega; total viene en null cuando el servidor arma el archivo al vuelo (sin
            // Content-Length) y el panel enseña lo que lleva en vez del porcentaje
            onDownloadProgress: (progressEvent) => downloadsActor.send({
                type: 'PROGRESSED', id: downloadId, loadedBytes: progressEvent.loaded, totalBytes: progressEvent.total,
            }),
        });
        saveBlob(blob, fileName);
        downloadsActor.send({type: 'COMPLETED', id: downloadId, fileName});
        onCompleted?.(fileName);
    } catch (error) {
        // OJO: cancelar también llega aquí como error (el AbortError del navegador); se distingue por la señal, no por el
        // tipo de error, porque cada `request` del proyecto puede tronar con el suyo
        if (abortController.signal.aborted) {
            downloadsActor.send({type: 'CANCELED', id: downloadId});
        } else {
            // el mensaje ya viene traducido del API (ApiError con el detail de RFC 9457)
            downloadsActor.send({type: 'FAILED', id: downloadId, errorMessage: error?.message ?? null});
        }
    } finally {
        abortControllerByDownloadId.delete(downloadId);
    }

    return downloadId;
}

/**
 * Cancela una descarga en curso (el panel la marca como cancelada).
 *
 * @param {string} downloadId
 */
export function cancelDownload(downloadId) {
    abortControllerByDownloadId.get(downloadId)?.abort();
}

/** Quita del panel todas las descargas terminadas (completadas, fallidas o canceladas). */
export function clearFinishedDownloads() {
    downloadsActor.send({type: 'CLEAR_FINISHED'});
}

/**
 * ¿Cuántas siguen descargando? Decide el resumen del panel y si se puede cerrar.
 *
 * @param {Array<object>} downloads
 * @returns {number}
 */
export function countActiveDownloads(downloads) {
    return downloads.filter((download) => download.status === DOWNLOAD_STATUS.downloading).length;
}
