// La espera de una petición de verdad: sin ella, todo llega al instante y no se ven los estados de carga (el esqueleto de
// la lista, el botón ocupado).
//
// Respeta la cancelación (AbortSignal) igual que fetch: si la pantalla se cierra a media carga y cancela su consulta, la
// espera se corta con un AbortError.
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
