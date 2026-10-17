// Lo que respondería el API al recibir archivos: importar un Excel (lo abre de verdad y cuenta sus renglones), recibir
// varios adjuntos de un jalón y recibir cada adjunto por su cuenta (el «server» de FilePond).
//
// La subida avanza como una de verdad (sendLikeNetwork) y después «procesa» un momento, sin porcentaje, como hace un
// servidor después de recibir el cuerpo.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {formatFileSize} from '@stackcraftmx/calcita';

import {ApiError} from '@/fakeServer/ApiError.js';
import {NETWORK_DELAY_MILLISECONDS, sendLikeNetwork, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

const HTTP_STATUS = Object.freeze({unprocessable: 422});
// lo que tarda en viajar el cuerpo de una subida (el resto es «procesando»)
const SENDING_MILLISECONDS = 2000;
const PROCESSING_MILLISECONDS = 1200;
// el servidor revisa el tipo por su cuenta: no confía en lo que ya revisó el navegador
const EXCEL_EXTENSION = /\.xlsx$/i;
// el servidor acepta adjuntos más chicos de lo que deja elegir la pantalla, para ver su error dentro de la tarjeta
const ATTACHMENT_MAX_BYTES = 1_000_000;
// los pasos de la barra de cada adjunto en el modo server de FilePond
const ATTACHMENT_STEPS = 8;
const ATTACHMENT_STEP_MILLISECONDS = 250;

/**
 * El 422 con el error en el campo del archivo, como lo mandaría Laravel.
 *
 * @param {string} message
 * @returns {ApiError}
 */
function fileProblemOf(message) {
    return new ApiError({
        status: HTTP_STATUS.unprocessable,
        problem: {
            status: HTTP_STATUS.unprocessable, code: 'invalid_file',
            title: serverTextOf('validation.title'), detail: message, errors: {archivo: [message]},
        },
    });
}

/**
 * POST /imports/payments: importa un Excel. Lo abre con ExcelJS y regresa cuántos renglones trae cada hoja.
 *
 * @param {{file: File}} input lo que manda la pantalla
 * @param {(percent: number) => void} onProgress
 * @param {AbortSignal} signal
 * @returns {Promise<{fileName: string, sheets: Array<{name: string, rows: number}>, totalRows: number}>}
 */
export async function importPaymentsFile({file}, onProgress, signal) {
    await sendLikeNetwork(SENDING_MILLISECONDS, onProgress, signal);
    await waitLikeNetwork(PROCESSING_MILLISECONDS, signal);

    if (!EXCEL_EXTENSION.test(file.name)) {
        throw fileProblemOf(serverTextOf('uploads.notExcel'));
    }

    // ExcelJS se carga solo aquí, al importar: la pantalla no lo espera
    const {default: ExcelJS} = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.load(await file.arrayBuffer());
    } catch {
        throw fileProblemOf(serverTextOf('uploads.unreadable'));
    }

    const sheets = workbook.worksheets.map((worksheet) => ({name: worksheet.name, rows: worksheet.actualRowCount}));
    return {fileName: file.name, sheets, totalRows: sheets.reduce((sum, sheet) => sum + sheet.rows, 0)};
}

/**
 * POST /attachments: recibe varios adjuntos en un solo envío.
 *
 * @param {{files: File[]}} input
 * @param {(percent: number) => void} onProgress
 * @param {AbortSignal} signal
 * @returns {Promise<{count: number, totalBytes: number}>}
 */
export async function uploadAttachments({files}, onProgress, signal) {
    await sendLikeNetwork(SENDING_MILLISECONDS, onProgress, signal);
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return {count: files.length, totalBytes: files.reduce((sum, file) => sum + file.size, 0)};
}

/**
 * El «server» de FilePond para subir cada adjunto por su cuenta: la misma forma que createPondServer del paquete, pero
 * sin petición de verdad. Cada archivo avanza su barra y el servidor rechaza lo que pasa de 1 MB con su mensaje.
 */
export const attachmentPondServer = Object.freeze({
    process: (fieldName, file, metadata, load, error, progress, abort) => {
        let step = 0;
        const timer = setInterval(() => {
            step += 1;
            progress(true, Math.round((file.size * step) / ATTACHMENT_STEPS), file.size);
            if (step < ATTACHMENT_STEPS) {
                return;
            }
            clearInterval(timer);
            if (file.size > ATTACHMENT_MAX_BYTES) {
                error(serverTextOf('uploads.attachmentTooLarge', {max: formatFileSize(ATTACHMENT_MAX_BYTES)}));
                return;
            }
            // el id con que el servidor guarda el archivo
            load(`attachment-${file.name}`);
        }, ATTACHMENT_STEP_MILLISECONDS);

        return {
            abort: () => {
                clearInterval(timer);
                abort();
            },
        };
    },
    revert: (serverId, load) => load(),
});
