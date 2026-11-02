// Qué versión de un aviso aceptó la persona EN ESTE NAVEGADOR (el de cookies, por ejemplo). Se guarda la versión y no un
// «sí»: al cambiar el aviso (versión nueva) se vuelve a preguntar.
//
// OJO: el navegador puede negar el almacenamiento (ventana privada, sitio bloqueado): entonces se pregunta otra vez en cada
// visita, sin tronar. Lo que debe quedar registrado de verdad (aceptar los términos) va al servidor, no aquí.
//
// Funciones del navegador, sin React: function (regla de la casa). Pruebas en consentStorage.test.js.

/**
 * La versión aceptada; null si no hay o no se puede leer.
 *
 * @param {string} storageKey
 * @param {Storage} [storage] por omisión, el localStorage del navegador
 * @returns {string|null}
 */
export function acceptedVersionOf(storageKey, storage = globalThis.localStorage) {
    try {
        return storage?.getItem(storageKey) ?? null;
    } catch {
        return null;
    }
}

/**
 * Anota la versión aceptada; si el navegador no deja, no pasa nada (se volverá a preguntar).
 *
 * @param {string} storageKey
 * @param {string} version
 * @param {Storage} [storage]
 */
export function rememberAcceptedVersion(storageKey, version, storage = globalThis.localStorage) {
    try {
        storage?.setItem(storageKey, version);
    } catch {
        // sin almacenamiento: se pregunta en la siguiente visita
    }
}
