// La petición de la casa: TODO lo que habla con el servidor pasa por un cliente armado aquí, con fetch del navegador (sin
// axios ni otra librería). Lo que resuelve UNA vez y no en cada pantalla:
//   - Accept-Language con el idioma vigente de ToolkitProvider en CADA petición: el servidor responde title y detail ya
//     traducidos. Cambiar el idioma aplica a la siguiente petición sin recargar.
//   - errores como ApiError (ApiError.js): el problema RFC 9457 del servidor con el mensaje ya traducido; si la
//     respuesta llegó en otro idioma (un error que armó nginx), el texto genérico del paquete. Sin red o se acabó el
//     tiempo: un ApiError con status 0, la misma forma, para que la pantalla no tenga dos formas de error.
//   - cancelar NO es un error: el AbortError se relanza intacto (quien canceló ya sabe por qué).
//   - 401 (la sesión se venció a media consulta): avisa a onUnauthenticated, que normalmente lleva a iniciar sesión. Una
//     petición que espera el 401 (preguntar si hay sesión al arrancar, el login) pasa skipUnauthenticatedHandler.
//   - el aviso «Hay una versión nueva»: cada respuesta trae en un header qué compilación del front está publicada y se
//     le entrega a reportPublishedBuild.
//   - Laravel (Sanctum): con csrf, manda la cookie XSRF-TOKEN en su header (solo al mismo origen) y ante un 419 pide una
//     cookie nueva y repite la petición UNA vez.
//   - cuerpo objeto → JSON; FormData, Blob y URLSearchParams van tal cual (el navegador pone su boundary).
//   - descargas: el Blob y el nombre que mandó el servidor, con avance; un Excel que llegó cortado (el servidor falló a
//     media escritura después de responder 200) no se entrega.
//   - eventos hacia afuera, para lo que cada proyecto haga a su manera: onRequest (sale), onResponse (llegó, con su status
//     y cuánto tardó) y onError (CADA error en un solo lugar: Sentry, un aviso propio, una métrica). Cancelar no es error.
//     Si un evento del proyecto truena, la petición sigue y se anota en el registro.
//   - un backend que ya existe y contesta a su manera, sin cambiarlo: toProblem convierte su error a la forma RFC 9457
//     (Laravel manda {message, errors}) y mapResponse desenvuelve sus respuestas buenas ({data: …}).
//
//   const api = createApiClient({baseUrl: '/api/v1', onUnauthenticated: () => navigate('/sign-in')});
//   const orders = await api.get('/orders', {params: {page: 2}, signal});
//   await api.post('/orders', {customerId: 7});
//
// Se arma uno por proyecto (en su core) y las pantallas lo usan desde su *Api.js.
//
// Funciones puras, no renderizan: function (regla de la casa).
import {ApiError, API_ERROR_STATUS} from '@/api/ApiError.js';
import {XLSX_CONTENT_TYPE, fileNameFromContentDisposition, isCompleteZip} from '@/files.js';
import {CSRF_TOKEN_MISMATCH_STATUS} from '@/laravel/csrfRetry.js';
import {createLogger} from '@/observability/logger.js';
import {reportPublishedBuild} from '@/observability/publishedBuild.js';
import {DEFAULT_LANGUAGE, toolkitSettings} from '@/toolkit/toolkitSettings.js';

const log = createLogger('api');

/** Cómo se lee una respuesta que salió bien. */
export const API_RESPONSE_PARSE = Object.freeze({json: 'json', blob: 'blob', response: 'response'});

// Las consultas se cortan a los 60 s; las descargas van sin límite (0): el servidor arma el archivo mientras lo manda y
// uno grande no cabe en 60 s. No se queda colgada: se cancela desde el panel de descargas.
const DEFAULT_TIMEOUT_MILLISECONDS = 60_000;
const NO_TIMEOUT = 0;
const DEFAULT_PUBLISHED_BUILD_HEADER = 'X-Frontend-Build';
const NO_CONTENT_STATUS = 204;
const SERVER_ERROR_STATUS = 500;

/**
 * La dirección completa: la base del cliente más el camino, con los parámetros. Un camino que ya trae http(s) va tal cual.
 * Los parámetros vacíos (undefined, null) no viajan; una lista viaja repetida (estado=a&estado=b).
 *
 * @param {string} baseUrl
 * @param {string} path
 * @param {Record<string, unknown>} [params]
 * @returns {string}
 */
export function apiUrlOf(baseUrl, path, params) {
    const url = /^https?:/i.test(path) ? path : `${baseUrl}${path}`;
    const query = new URLSearchParams();
    for (const [name, value] of Object.entries(params ?? {})) {
        for (const item of [].concat(value)) {
            if (item !== undefined && item !== null) {
                query.append(name, String(item));
            }
        }
    }
    const queryText = query.toString();
    if (!queryText) {
        return url;
    }
    return `${url}${url.includes('?') ? '&' : '?'}${queryText}`;
}

/**
 * ¿El cuerpo va tal cual? FormData (archivos), Blob y URLSearchParams los arma el navegador con su propio tipo.
 *
 * @param {unknown} body
 * @returns {boolean}
 */
function isRawBody(body) {
    return (typeof FormData !== 'undefined' && body instanceof FormData)
        || (typeof Blob !== 'undefined' && body instanceof Blob)
        || body instanceof URLSearchParams
        || body instanceof ArrayBuffer;
}

/**
 * El valor de una cookie del navegador (la XSRF-TOKEN de Laravel), o null.
 *
 * @param {string} cookieName
 * @returns {string|null}
 */
function readCookie(cookieName) {
    if (typeof document === 'undefined') {
        return null;
    }
    const prefix = `${cookieName}=`;
    const cookie = document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix));
    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

/**
 * ¿La dirección es del mismo origen que la página? El token CSRF solo viaja al servidor propio: mandarlo a otro dominio
 * se lo regalaría.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isSameOrigin(url) {
    if (typeof window === 'undefined' || !/^https?:/i.test(url)) {
        return true;
    }
    return new URL(url).origin === window.location.origin;
}

/**
 * Retry-After en segundos: el estándar admite segundos o una fecha HTTP.
 *
 * @param {string|null} retryAfterHeader
 * @returns {number|null}
 */
export function retryAfterSecondsOf(retryAfterHeader) {
    if (!retryAfterHeader) {
        return null;
    }
    if (/^\d+$/.test(retryAfterHeader.trim())) {
        return Number(retryAfterHeader.trim());
    }
    const retryAt = Date.parse(retryAfterHeader);
    return Number.isNaN(retryAt) ? null : Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
}

/**
 * El cuerpo RFC 9457 de una respuesta de error, o null si no es JSON (un 502 del proxy en HTML).
 *
 * @param {Response} response
 * @returns {Promise<object|null>}
 */
/**
 * El problema RFC 9457 del cuerpo de error, pasado por el adaptador del proyecto (toProblem). Lo que no sea un objeto
 * cuenta como sin problema (se usa el texto genérico del paquete).
 *
 * @param {(body: any, response: Response) => any} toProblem
 * @param {object|null} body
 * @param {Response} response
 * @returns {object|null}
 */
function toProblemOrNull(toProblem, body, response) {
    const problem = body === null ? null : toProblem(body, response);
    return problem && typeof problem === 'object' && !Array.isArray(problem) ? problem : null;
}

async function readProblem(response) {
    try {
        const body = JSON.parse(await response.text());
        return body && typeof body === 'object' && !Array.isArray(body) ? body : null;
    } catch {
        return null;
    }
}

/**
 * La señal de la petición: la de quien la pidió (para cancelar) y la del tiempo máximo, juntas.
 *
 * @param {AbortSignal|undefined} signal
 * @param {number} timeoutMilliseconds 0 = sin límite
 * @returns {AbortSignal|undefined}
 */
function combinedSignalOf(signal, timeoutMilliseconds) {
    const signals = [signal, timeoutMilliseconds > 0 ? AbortSignal.timeout(timeoutMilliseconds) : null].filter(Boolean);
    if (signals.length < 2) {
        return signals[0];
    }
    return AbortSignal.any(signals);
}

/**
 * Lee el cuerpo de una descarga avisando cuánto lleva. total viene en null cuando el servidor arma el archivo al vuelo
 * (sin Content-Length).
 *
 * @param {Response} response
 * @param {((progress: {loaded: number, total: number|null}) => void)|undefined} onDownloadProgress
 * @returns {Promise<Blob>}
 */
async function readBlobWithProgress(response, onDownloadProgress) {
    if (!onDownloadProgress || !response.body) {
        return response.blob();
    }
    const total = Number(response.headers.get('content-length')) || null;
    const reader = response.body.getReader();
    const chunks = [];
    let loaded = 0;
    for (let part = await reader.read(); !part.done; part = await reader.read()) {
        chunks.push(part.value);
        loaded += part.value.byteLength;
        onDownloadProgress({loaded, total});
    }
    return new Blob(chunks, {type: response.headers.get('content-type') ?? ''});
}

/**
 * Lo que acepta cada petición.
 *
 * @typedef {object} ApiRequestOptions
 * @property {unknown} [body] objeto → JSON; FormData, Blob o URLSearchParams tal cual
 * @property {Record<string, unknown>} [params] los de la dirección (?page=2)
 * @property {AbortSignal} [signal] para cancelar
 * @property {Record<string, string>} [headers]
 * @property {'json'|'blob'|'response'} [parse] cómo se lee la respuesta (API_RESPONSE_PARSE); por omisión JSON
 * @property {boolean} [skipUnauthenticatedHandler] un 401 que se espera (¿hay sesión?, el login)
 * @property {number} [timeoutMilliseconds] el de esta petición
 */

/**
 * Lo que acepta una descarga.
 *
 * @typedef {object} ApiDownloadOptions
 * @property {Record<string, unknown>} [params]
 * @property {AbortSignal} [signal]
 * @property {(progress: {loaded: number, total: number|null}) => void} [onDownloadProgress]
 * @property {string} [fallbackFileName] si el servidor no manda el nombre
 * @property {number} [timeoutMilliseconds] por omisión sin límite
 */

/**
 * El cliente del proyecto: cada método regresa el JSON de la respuesta (null si vino vacía) o truena con un ApiError.
 *
 * @typedef {object} ApiClient
 * @property {(method: string, path: string, options?: ApiRequestOptions) => Promise<any>} request
 * @property {(path: string, options?: ApiRequestOptions) => Promise<any>} get
 * @property {(path: string, body?: unknown, options?: ApiRequestOptions) => Promise<any>} post
 * @property {(path: string, body?: unknown, options?: ApiRequestOptions) => Promise<any>} put
 * @property {(path: string, body?: unknown, options?: ApiRequestOptions) => Promise<any>} patch
 * @property {(path: string, options?: ApiRequestOptions) => Promise<any>} delete
 * @property {(path: string, options?: ApiDownloadOptions) => Promise<{blob: Blob, fileName: string}>} download
 */

/**
 * Arma el cliente del proyecto.
 *
 * @param {object} [options]
 * @param {string} [options.baseUrl] lo que va antes de cada camino, p. ej. '/api/v1'
 * @param {RequestCredentials} [options.credentials] 'same-origin' (por omisión, la cookie de sesión del mismo dominio) o
 *     'include' (un API en otro dominio con cookies)
 * @param {() => string|null|undefined} [options.getToken] con él cada petición lleva Authorization: Bearer; sin token, va
 *     sin el header (el servidor responde 401)
 * @param {Record<string, string>} [options.headers] los que van en todas las peticiones
 * @param {string|null} [options.publishedBuildHeader] el header con la compilación publicada; null para no leerlo
 * @param {{cookieName?: string, headerName?: string, refreshPath?: string}|null} [options.csrf] Laravel Sanctum:
 *     {refreshPath: '/auth/csrf-token'}; por omisión la cookie XSRF-TOKEN y el header X-XSRF-TOKEN
 * @param {number} [options.timeoutMilliseconds] el tiempo máximo de una consulta (0 = sin límite); por omisión 60 s
 * @param {(error: ApiError) => void} [options.onUnauthenticated] qué hacer con un 401 (normalmente ir a iniciar sesión)
 * @param {(request: {method: string, url: string}) => void} [options.onRequest] cada petición, al salir
 * @param {(response: {method: string, url: string, status: number, durationMilliseconds: number}) => void} [options.onResponse]
 *     cada respuesta, buena o mala, al llegar
 * @param {(error: ApiError, request: {method: string, url: string}) => void} [options.onError] cada error (sin red, 4xx, 5xx,
 *     una respuesta que no es JSON), en un solo lugar: Sentry, un aviso propio. Cancelar no es error
 * @param {(body: any, response: Response) => object|null} [options.toProblem] el error de un backend que no contesta en
 *     RFC 9457, a esa forma: (body) => ({title: body.message, errors: body.errors}). Por omisión el cuerpo tal cual
 * @param {(body: any, request: {method: string, url: string}) => any} [options.mapResponse] la respuesta buena de un backend
 *     que la envuelve: (body) => body.data. Por omisión tal cual
 * @param {typeof fetch} [options.fetch] para un servidor de mentira o para las pruebas; por omisión el del navegador
 * @returns {ApiClient}
 */
export function createApiClient({
    baseUrl = '',
    credentials = 'same-origin',
    getToken,
    headers: commonHeaders = {},
    publishedBuildHeader = DEFAULT_PUBLISHED_BUILD_HEADER,
    csrf = null,
    timeoutMilliseconds: defaultTimeoutMilliseconds = DEFAULT_TIMEOUT_MILLISECONDS,
    onUnauthenticated,
    onRequest,
    onResponse,
    onError,
    toProblem = (body) => body,
    mapResponse = (body) => body,
    fetch: fetchImplementation,
} = {}) {
    // un evento del proyecto que truena no tumba la petición: se anota y se sigue (nunca en silencio)
    const notify = (eventName, handler, ...eventArguments) => {
        try {
            handler?.(...eventArguments);
        } catch (error) {
            log.error(`el evento ${eventName} del proyecto tronó`, {message: error?.message});
        }
    };
    // OJO: se lee al pedir, no al armar el cliente: así un servidor de mentira que se conecta después también sirve
    const fetchOf = () => fetchImplementation ?? globalThis.fetch;
    const csrfCookieName = csrf?.cookieName ?? 'XSRF-TOKEN';
    const csrfHeaderName = csrf?.headerName ?? 'X-XSRF-TOKEN';

    /** Los headers de una petición: los comunes, el idioma vigente, el token y el CSRF. */
    const headersOf = (url, body, extraHeaders) => {
        const headers = {
            Accept: 'application/json',
            'Accept-Language': toolkitSettings().language ?? DEFAULT_LANGUAGE,
            ...commonHeaders,
            ...extraHeaders,
        };
        if (body !== undefined && !isRawBody(body)) {
            headers['Content-Type'] = 'application/json';
        }
        const token = getToken?.();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        const csrfToken = csrf && isSameOrigin(url) ? readCookie(csrfCookieName) : null;
        if (csrfToken) {
            headers[csrfHeaderName] = csrfToken;
        }
        return headers;
    };

    /** La petición al servidor, ya con su respuesta o con el ApiError de «sin respuesta». */
    const send = async (method, url, {body, signal, headers, timeoutMilliseconds}) => {
        const finalHeaders = headersOf(url, body, headers);
        try {
            return await fetchOf()(url, {
                method,
                headers: finalHeaders,
                body: body === undefined || isRawBody(body) ? body : JSON.stringify(body),
                credentials,
                signal: combinedSignalOf(signal, timeoutMilliseconds),
            });
        } catch (error) {
            // cancelar no es un error de negocio: quien canceló ya sabe por qué
            if (signal?.aborted) {
                throw error;
            }
            const reason = error?.name === 'TimeoutError' ? 'se acabó el tiempo' : 'la petición no llegó al servidor';
            log.error(reason, {method, url, cause: error?.name});
            throw new ApiError({status: API_ERROR_STATUS.offline});
        }
    };

    /**
     * Cualquier petición.
     *
     * @param {string} method 'GET', 'POST', 'PUT', 'PATCH' o 'DELETE'
     * @param {string} path relativo a baseUrl (o completo con http)
     * @param {object} [options]
     * @param {unknown} [options.body] objeto → JSON; FormData, Blob o URLSearchParams tal cual
     * @param {Record<string, unknown>} [options.params] los de la dirección (?page=2)
     * @param {AbortSignal} [options.signal] para cancelar
     * @param {Record<string, string>} [options.headers]
     * @param {'json'|'blob'|'response'} [options.parse] cómo se lee la respuesta (API_RESPONSE_PARSE); por omisión JSON
     * @param {boolean} [options.skipUnauthenticatedHandler] un 401 que se espera (¿hay sesión?, el login)
     * @param {number} [options.timeoutMilliseconds] el de esta petición
     * @returns {Promise<any>} el JSON (null si vino vacío o 204), el Blob o la Response
     */
    const request = async (method, path, options = {}) => {
        const url = apiUrlOf(baseUrl, path, options.params);
        try {
            return await requestOnce(method, url, options);
        } catch (error) {
            // cada error del servidor (o sin red) sale por onError; cancelar no es error
            if (error instanceof ApiError) {
                notify('onError', onError, error, {method, url});
            }
            throw error;
        }
    };

    const requestOnce = async (method, url, {
        body, signal, headers, parse = API_RESPONSE_PARSE.json, skipUnauthenticatedHandler = false,
        timeoutMilliseconds = defaultTimeoutMilliseconds,
    } = {}) => {
        notify('onRequest', onRequest, {method, url});
        const startedAt = Date.now();
        let response = await send(method, url, {body, signal, headers, timeoutMilliseconds});

        // 419 de Laravel: la cookie CSRF venció; se pide una nueva y se repite la MISMA petición una sola vez
        if (response.status === CSRF_TOKEN_MISMATCH_STATUS && csrf?.refreshPath) {
            log.info('token CSRF vencido: se renueva y se reintenta', {method, url});
            await send('GET', apiUrlOf(baseUrl, csrf.refreshPath), {signal, timeoutMilliseconds});
            response = await send(method, url, {body, signal, headers, timeoutMilliseconds});
        }

        notify('onResponse', onResponse, {method, url, status: response.status, durationMilliseconds: Date.now() - startedAt});

        // cada respuesta (también las de error) dice qué compilación del front está publicada
        if (publishedBuildHeader) {
            reportPublishedBuild(response.headers.get(publishedBuildHeader));
        }

        if (!response.ok) {
            const problem = toProblemOrNull(toProblem, await readProblem(response), response);
            // un error que armó otro (nginx) puede llegar en otro idioma: ahí se usa el texto genérico del paquete
            const requestedLanguage = headersOf(url, undefined, headers)['Accept-Language'];
            const responseLanguage = response.headers.get('content-language');
            const apiError = new ApiError({
                status: response.status,
                problem,
                translatedByServer: !responseLanguage || responseLanguage.startsWith(requestedLanguage),
                retryAfterSeconds: retryAfterSecondsOf(response.headers.get('retry-after')),
            });
            // los 4xx son parte del flujo (un 422 es un formulario, un 401 al arrancar es «sin sesión»); los 5xx no
            log[response.status >= SERVER_ERROR_STATUS ? 'error' : 'debug'](`${method} ${url} → ${response.status}`, {
                code: apiError.code, requestId: apiError.requestId ?? response.headers.get('x-request-id'),
            });
            if (apiError.isUnauthenticated && !skipUnauthenticatedHandler) {
                onUnauthenticated?.(apiError);
            }
            throw apiError;
        }

        if (parse === API_RESPONSE_PARSE.response) {
            return response;
        }
        if (parse === API_RESPONSE_PARSE.blob) {
            return response.blob();
        }
        if (response.status === NO_CONTENT_STATUS) {
            return null;
        }
        // un 200 con el cuerpo vacío pasa de verdad; JSON.parse('') tronaría
        const text = await response.text();
        if (!text) {
            return null;
        }
        let json;
        try {
            json = JSON.parse(text);
        } catch {
            // un 200 que no es JSON: casi siempre la página de la app que respondió en lugar del API (el camino está mal)
            log.error(`${method} ${url} respondió algo que no es JSON`, {contentType: response.headers.get('content-type')});
            throw new ApiError({status: SERVER_ERROR_STATUS});
        }
        return mapResponse(json, {method, url});
    };

    /**
     * Descarga un archivo: el Blob y el nombre que mandó el servidor, con avance. Un Excel cortado no se entrega.
     *
     * @param {string} path
     * @param {object} [options]
     * @param {Record<string, unknown>} [options.params]
     * @param {AbortSignal} [options.signal]
     * @param {(progress: {loaded: number, total: number|null}) => void} [options.onDownloadProgress]
     * @param {string} [options.fallbackFileName] si el servidor no manda el nombre
     * @param {number} [options.timeoutMilliseconds] por omisión sin límite
     * @returns {Promise<{blob: Blob, fileName: string}>}
     * @throws {ApiError} status 500 si un Excel llegó incompleto
     */
    const download = async (path, {params, signal, onDownloadProgress, fallbackFileName = 'descarga', timeoutMilliseconds = NO_TIMEOUT} = {}) => {
        const response = await request('GET', path, {params, signal, parse: API_RESPONSE_PARSE.response, timeoutMilliseconds});
        const blob = await readBlobWithProgress(response, onDownloadProgress);
        const fileName = fileNameFromContentDisposition(response.headers.get('content-disposition'), fallbackFileName);
        // el tipo puede traer parámetros después del «;» (charset): solo cuenta lo de antes
        const contentType = String(response.headers.get('content-type') ?? '').split(';')[0].trim();
        if (contentType === XLSX_CONTENT_TYPE && !(await isCompleteZip(blob))) {
            const requestId = response.headers.get('x-request-id');
            log.error(`GET ${path} → el Excel llegó incompleto: el servidor falló a media escritura`, {requestId, fileName});
            throw new ApiError({status: SERVER_ERROR_STATUS, problem: {request_id: requestId}});
        }
        return {blob, fileName};
    };

    return {
        request,
        get: (path, options) => request('GET', path, options),
        post: (path, body, options) => request('POST', path, {...options, body}),
        put: (path, body, options) => request('PUT', path, {...options, body}),
        patch: (path, body, options) => request('PATCH', path, {...options, body}),
        delete: (path, options) => request('DELETE', path, options),
        download,
    };
}
