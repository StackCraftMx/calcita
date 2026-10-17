// A dónde regresar después de iniciar sesión.
//
// Si la sesión vence a media consulta, la persona vuelve a /iniciar-sesion?redirect=/pedidos?estado=pendiente
// y, al entrar, aterriza donde estaba.
//
// IMPORTANTE: el destino viene de la URL, así que cualquiera puede armar un enlace con él. Solo se aceptan rutas
// internas ("/algo"); "https://otro.sitio", "//otro.sitio" o "/\otro.sitio" se descartan. Sin esto, el login
// sería un redirector abierto para phishing.
//
// Funciones puras, no renderizan: function (regla de la casa).

export const REDIRECT_PARAM = 'redirect';

/**
 * La ruta si es interna y segura; null si no.
 *
 * @param {string|null|undefined} candidatePath
 * @returns {string|null}
 */
export function safeInternalPath(candidatePath) {
    if (typeof candidatePath !== 'string' || candidatePath.length === 0 || candidatePath.length > 2000) {
        return null;
    }
    // guard clause: tiene que empezar con una sola diagonal (// y /\ son URLs de otro dominio para el navegador)
    if (!candidatePath.startsWith('/') || candidatePath.startsWith('//') || candidatePath.startsWith('/\\')) {
        return null;
    }
    // guard clause: sin caracteres de control (un salto de línea puede partir la URL)
    if (/[\u0000-\u001f\u007f]/.test(candidatePath)) {
        return null;
    }
    return candidatePath;
}

/**
 * Lee el destino de ?redirect= ya validado.
 *
 * @param {string} search location.search
 * @returns {string|null}
 */
export function readRedirectParam(search) {
    return safeInternalPath(new URLSearchParams(search).get(REDIRECT_PARAM));
}

/**
 * Arma "/iniciar-sesion?redirect=<destino>" (sin parámetro si el destino no es seguro o es la misma entrada).
 *
 * @param {string} entryPath p. ej. '/iniciar-sesion'
 * @param {string} targetPath ruta que se intentó abrir
 */
export function withRedirect(entryPath, targetPath) {
    const safeTarget = safeInternalPath(targetPath);
    if (!safeTarget || safeTarget === '/' || safeTarget.startsWith(entryPath)) {
        return entryPath;
    }
    return `${entryPath}?${new URLSearchParams({[REDIRECT_PARAM]: safeTarget})}`;
}
