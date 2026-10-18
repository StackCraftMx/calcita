// El error de cualquier petición al servidor, con la misma forma siempre: un error del servidor (RFC 9457), una red caída
// o un archivo que llegó cortado. Así la pantalla tiene UNA forma de error que enseñar y no dos.
//
// El mensaje ya viene en el idioma de la persona: si el servidor lo mandó traducido (title y detail en el idioma de
// Accept-Language) se usa tal cual; si no (sin red, un 502 del proxy en HTML, una respuesta en otro idioma), el texto
// genérico del paquete según el status (problems.js).
//
// Lo usan los formularios (applyServerProblem: los errores de un 422 van a su campo), toastProblem, la tabla, las
// descargas y la subida de archivos.
//
// Una clase porque es un Error (trae su pila y `instanceof ApiError` funciona); lo demás del paquete son funciones.
import {problemMessage, problemTitle} from '@/problems.js';

/** Los status que la pantalla suele tratar distinto, con su nombre. */
export const API_ERROR_STATUS = Object.freeze({
    // no hubo respuesta: red caída, servidor apagado o se acabó el tiempo
    offline: 0,
    unauthenticated: 401,
    forbidden: 403,
    notFound: 404,
    // el registro no está en el estado que la acción necesita (p. ej. cerrar un mes que no está completo)
    conflict: 409,
    // la liga ya venció, ya se usó o no existe
    gone: 410,
    validation: 422,
    tooManyRequests: 429,
});

export class ApiError extends Error {
    /**
     * @param {object} details
     * @param {number} details.status el status HTTP; 0 si no hubo respuesta
     * @param {object|null} [details.problem] el cuerpo RFC 9457 del servidor ({title, detail, code, errors, request_id})
     * @param {boolean} [details.translatedByServer] false si la respuesta llegó en otro idioma que el pedido
     * @param {number|null} [details.retryAfterSeconds] 429: los segundos del header Retry-After
     */
    constructor({status, problem = null, translatedByServer = true, retryAfterSeconds = null}) {
        super(problemMessage(problem, status, {translatedByServer}));
        this.name = 'ApiError';
        this.status = status;
        this.problem = problem ?? {};
        this.code = problem?.code ?? (status === API_ERROR_STATUS.offline ? 'offline' : null);
        this.title = problemTitle(problem, status, {translatedByServer});
        // el id con que el servidor guardó el error en su bitácora: lo que se le pasa a soporte
        this.requestId = problem?.request_id ?? null;
        this.retryAfterSeconds = retryAfterSeconds;
    }

    /** No hubo respuesta del servidor (red caída, servidor apagado, se acabó el tiempo). */
    get isOffline() {
        return this.status === API_ERROR_STATUS.offline;
    }

    /** Sin sesión, o se venció mientras se usaba la app. */
    get isUnauthenticated() {
        return this.status === API_ERROR_STATUS.unauthenticated;
    }

    /** El registro no está en el estado que la acción necesita. */
    get isConflict() {
        return this.status === API_ERROR_STATUS.conflict;
    }

    /** La liga venció, ya se usó o no existe. */
    get isGone() {
        return this.status === API_ERROR_STATUS.gone;
    }

    /** Errores de un formulario: los mensajes por campo van en problem.errors (fieldErrorsOf). */
    get isValidation() {
        return this.status === API_ERROR_STATUS.validation;
    }
}
