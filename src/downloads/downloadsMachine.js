// Lista de descargas de la sesión (el «administrador de descargas», sin Redux).
//
// Cada descarga vive así:
//
//   STARTED ──▶ downloading ──PROGRESSED──▶ downloading
//                   │
//                   ├── COMPLETED ──▶ completed ─┐
//                   ├── FAILED ─────▶ failed ────┼── CLEAR_FINISHED ──▶ (sale de la lista)
//                   └── CANCELED ───▶ canceled ──┘
//
// Por qué una máquina y no un useState: la lista la alimentan varias pantallas a la vez (quien descarga) y la lee un
// solo panel (DownloadManager); una descarga que ya terminó no puede volver a «descargando» por un aviso de progreso
// que llegó tarde. Lo prueba downloadsMachine.test.js.
//
// Pura: solo importa xstate. Quien descarga de verdad es startDownload (downloadQueue.js); el paquete no conoce el API.
import {assign, setup} from 'xstate';

/** Estatus de una descarga; son los que pinta el panel (con su texto en common:downloads.statuses). */
export const DOWNLOAD_STATUS = Object.freeze({
    downloading: 'downloading',
    completed: 'completed',
    failed: 'failed',
    canceled: 'canceled',
});

/**
 * Cambia una sola descarga de la lista, y solo si sigue descargando (las terminadas ya no cambian).
 *
 * @param {Array<object>} downloads
 * @param {string} downloadId
 * @param {object} changes
 * @returns {Array<object>}
 */
function updateActiveDownload(downloads, downloadId, changes) {
    return downloads.map((download) => (
        download.id === downloadId && download.status === DOWNLOAD_STATUS.downloading ? {...download, ...changes} : download
    ));
}

export const downloadsMachine = setup({}).createMachine({
    id: 'downloads',
    context: {
        // la más nueva primero
        downloads: [],
    },
    on: {
        STARTED: {
            actions: assign({
                downloads: ({context, event}) => [
                    {
                        id: event.id,
                        label: event.label,
                        // xlsx, csv o pdf: el panel pinta el ícono del tipo de archivo (null si quien descarga no lo dice)
                        format: event.format ?? null,
                        fileName: null,
                        status: DOWNLOAD_STATUS.downloading,
                        loadedBytes: 0,
                        totalBytes: null,
                        errorMessage: null,
                    },
                    ...context.downloads,
                ],
            }),
        },
        PROGRESSED: {
            actions: assign({
                downloads: ({context, event}) => updateActiveDownload(context.downloads, event.id, {
                    loadedBytes: event.loadedBytes,
                    // un archivo que se arma al vuelo (el log) no dice su tamaño: se queda en null y la barra no tiene fin
                    totalBytes: event.totalBytes ?? null,
                }),
            }),
        },
        COMPLETED: {
            actions: assign({
                downloads: ({context, event}) => updateActiveDownload(context.downloads, event.id, {
                    status: DOWNLOAD_STATUS.completed,
                    fileName: event.fileName,
                }),
            }),
        },
        FAILED: {
            actions: assign({
                downloads: ({context, event}) => updateActiveDownload(context.downloads, event.id, {
                    status: DOWNLOAD_STATUS.failed,
                    errorMessage: event.errorMessage ?? null,
                }),
            }),
        },
        CANCELED: {
            actions: assign({
                downloads: ({context, event}) => updateActiveDownload(context.downloads, event.id, {status: DOWNLOAD_STATUS.canceled}),
            }),
        },
        CLEAR_FINISHED: {
            actions: assign({
                downloads: ({context}) => context.downloads.filter((download) => download.status === DOWNLOAD_STATUS.downloading),
            }),
        },
    },
});
