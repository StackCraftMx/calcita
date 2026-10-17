// La espera de una petición de verdad: sin ella, todo llega al instante y no se ven los estados de carga (el esqueleto de
// la tabla, el botón ocupado, el anillo de la descarga).
//
// Respeta la cancelación (AbortSignal) igual que axios o fetch: si la pantalla cancela, la espera se corta con un
// AbortError. ServerTable cancela la consulta anterior cuando la persona sigue escribiendo, y el panel de descargas
// cancela con su X.
//
// Funciones puras, sin React: function (regla de la casa).

/** Lo que tarda una consulta normal del servidor de mentira. */
export const NETWORK_DELAY_MILLISECONDS = 400;

/**
 * Espera como si la respuesta viniera de la red.
 *
 * @param {number} milliseconds
 * @param {AbortSignal} [signal]
 * @returns {Promise<void>} se cumple al terminar la espera; falla con AbortError si la cancelan
 */
export function waitLikeNetwork(milliseconds, signal) {
    return new Promise((resolve, reject) => {
        const abortError = () => new DOMException('La pantalla canceló la petición', 'AbortError');
        // guard clause: ya venía cancelada
        if (signal?.aborted) {
            reject(abortError());
            return;
        }

        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', cancel);
            resolve();
        }, milliseconds);

        function cancel() {
            clearTimeout(timer);
            reject(abortError());
        }

        signal?.addEventListener('abort', cancel, {once: true});
    });
}

// en cuántos pedazos llega un archivo: los que avisan su avance al panel de descargas
const DOWNLOAD_CHUNKS = 20;
// en cuántos pasos viaja una subida: cada uno avisa su porcentaje
const UPLOAD_STEPS = 10;
const PERCENT = 100;

/**
 * Una subida que avanza poco a poco, como uploadWithProgress con un servidor de verdad: avisa de 10 % en 10 % hasta
 * 100 % y se corta si la cancelan.
 *
 * @param {number} milliseconds lo que tarda en viajar todo el cuerpo
 * @param {(percent: number) => void} [onProgress]
 * @param {AbortSignal} [signal]
 * @returns {Promise<void>}
 */
export async function sendLikeNetwork(milliseconds, onProgress, signal) {
    for (let step = 1; step <= UPLOAD_STEPS; step += 1) {
        await waitLikeNetwork(milliseconds / UPLOAD_STEPS, signal);
        onProgress?.((step * PERCENT) / UPLOAD_STEPS);
    }
}

/**
 * Entrega un archivo poco a poco, como una descarga de verdad: avisa el avance con onDownloadProgress (la forma de
 * axios: {loaded, total}) y se corta si la cancelan.
 *
 * @param {Blob} blob el archivo ya armado
 * @param {{signal: AbortSignal, onDownloadProgress: Function}} transferOptions las que pasa startDownload
 * @param {number} milliseconds lo que tarda en total
 * @returns {Promise<void>}
 */
export async function deliverLikeNetwork(blob, {signal, onDownloadProgress}, milliseconds) {
    for (let chunk = 1; chunk <= DOWNLOAD_CHUNKS; chunk += 1) {
        await waitLikeNetwork(milliseconds / DOWNLOAD_CHUNKS, signal);
        onDownloadProgress?.({loaded: Math.round((blob.size * chunk) / DOWNLOAD_CHUNKS), total: blob.size});
    }
}
