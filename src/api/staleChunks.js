// Sobrevivir a una publicación con la app abierta.
//
// El síntoma (Chrome): «Failed to fetch dynamically imported module: …/assets/orders-LUgRFrRF.js».
//
// Qué pasó: cada pantalla viaja en su propio archivo con la huella de su contenido en el nombre. Al publicar, los nombres
// cambian y los viejos se borran. Quien tenía la app abierta sigue con el índice anterior en memoria: en cuanto entra a
// una pantalla que no había abierto, pide un archivo que ya no existe. No es un error de red ni de la persona; le pasa a
// cualquiera que tenga la pestaña abierta durante una publicación.
//
// Qué se hace: recargar UNA vez. La página nueva trae los nombres nuevos y la persona ve un parpadeo en lugar de una
// pantalla rota. El candado contra el ciclo es la hora de la última recarga en sessionStorage: si se recargó hace menos de
// RELOAD_COOLDOWN_MILLISECONDS, el error sigue su camino (un archivo que de verdad falta dejaría la pestaña recargándose
// para siempre). La ventana es corta a propósito: otra publicación media hora después se tiene que poder recuperar igual.
//
//   lazy: () => import('./OrdersPage.jsx').catch(recoverFromStaleChunk)
//
// Con react-router, withChunkRecovery(routes) de /react-router lo pone en todas las rutas lazy.
//
// Funciones puras, no renderizan: function (regla de la casa).
import {createLogger} from '@/observability/logger.js';

const log = createLogger('chunks');

const RELOAD_STORAGE_KEY = 'calcita:chunkReloadAt';
const RELOAD_COOLDOWN_MILLISECONDS = 15_000;

// Cada navegador lo redacta distinto: Chromium «Failed to fetch dynamically imported module», Firefox «error loading
// dynamically imported module», Safari «Importing a module script failed».
const STALE_CHUNK_MESSAGES = Object.freeze([
    'failed to fetch dynamically imported module',
    'error loading dynamically imported module',
    'importing a module script failed',
    'failed to load module script',
]);

/**
 * ¿El error es un archivo de pantalla que ya no existe (se publicó otra versión), y no otra cosa?
 *
 * @param {unknown} error
 * @returns {boolean}
 */
export function isStaleChunkError(error) {
    const message = String(error?.message ?? error ?? '').toLowerCase();
    return STALE_CHUNK_MESSAGES.some((knownMessage) => message.includes(knownMessage));
}

/** ¿Ya se recargó por esto hace poco? Sin sessionStorage no hay candado: mejor recargar una vez que dejar la pantalla rota. */
function reloadedRecently() {
    try {
        const reloadedAt = Number(window.sessionStorage.getItem(RELOAD_STORAGE_KEY) ?? 0);
        return reloadedAt > 0 && Date.now() - reloadedAt < RELOAD_COOLDOWN_MILLISECONDS;
    } catch {
        return false;
    }
}

function markReload() {
    try {
        window.sessionStorage.setItem(RELOAD_STORAGE_KEY, String(Date.now()));
    } catch {
        // almacenamiento bloqueado: se recarga igual, solo sin candado
    }
}

/**
 * Lo que va en el .catch() de un import dinámico: si el archivo es de una versión vieja, recarga una vez; si no, deja
 * pasar el error tal cual para que lo vea quien corresponda.
 *
 * @param {unknown} error
 * @returns {Promise<never>}
 */
export function recoverFromStaleChunk(error) {
    if (!isStaleChunkError(error)) {
        throw error;
    }
    if (reloadedRecently()) {
        // ya se recargó y volvió a fallar: no es una publicación, el archivo de verdad falta. Nunca fallar en silencio
        log.error('el archivo de la pantalla sigue sin cargar después de recargar', {cause: String(error)});
        throw error;
    }
    log.warn('archivo de una versión anterior: se recarga la página', {cause: String(error)});
    markReload();
    window.location.reload();
    // OJO: la promesa NUNCA se resuelve, a propósito: la página ya se está yendo y resolverla haría que se pintara un error
    // un instante antes de recargar
    return new Promise(() => {});
}
