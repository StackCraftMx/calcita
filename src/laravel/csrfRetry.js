// 419 de Laravel (la cookie XSRF-TOKEN venció, p. ej. la sesión del servidor expiró con la pantalla abierta): se pide
// una cookie nueva y se repite la MISMA petición UNA sola vez.
//
// Vive aparte de api.js para probarlo con node --test (csrfRetry.test.js) sin navegador. api.js lo engancha en el
// interceptor de respuesta del cliente único.
//
// OJO: la bandera va en el config de axios de ESA petición. Si la repetición vuelve a responder 419, la bandera ya
// está puesta y el error sigue su camino: sin ella, un servidor que siempre responde 419 sería un ciclo infinito.
// El 419 no gasta intentos del límite de login: la revisión CSRF corre antes que throttle:login.
//
// Función pura, no renderiza: function (regla de la casa). Solo importa lo que recibe.

export const CSRF_TOKEN_MISMATCH_STATUS = 419;

/**
 * Arma el manejador del 419 para el interceptor de respuesta.
 *
 * @param {object} dependencies
 * @param {() => Promise<unknown>} dependencies.refreshCsrfToken GET auth/csrf-token (deja la cookie nueva)
 * @param {(config: object) => Promise<object>} dependencies.repeatRequest vuelve a mandar la petición con el mismo
 *     cliente
 * @param {(config: object) => void} [dependencies.onRetry] para el log (sin datos personales)
 * @returns {(error: {config?: object, response?: {status: number}}) => Promise<object|null>} la respuesta de la repetición, o null si no aplica
 */
export function createCsrfRetryHandler({refreshCsrfToken, repeatRequest, onRetry}) {
    return async function retryAfterCsrfRefresh(error) {
        const {config, response} = error ?? {};

        // guard clause: no es un 419, no hay config que repetir, o ya se repitió una vez
        if (response?.status !== CSRF_TOKEN_MISMATCH_STATUS || !config || config.retriedAfterCsrfRefresh) {
            return null;
        }

        config.retriedAfterCsrfRefresh = true;
        onRetry?.(config);
        await refreshCsrfToken();
        return repeatRequest(config);
    };
}
