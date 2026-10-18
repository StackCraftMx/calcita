// La «cookie» de la sesión del servidor de mentira: quién está dentro. Se guarda en el navegador, como la cookie de un
// backend real: al recargar se sigue dentro. Sin nada guardado entra administración (los ejemplos abren directo y con todo
// el menú); «Salir» la cierra de verdad.
//
// La usan las cuentas (entrar y salir) y la seguridad (el segundo paso termina de entrar).
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {DEFAULT_SIGNED_IN_USER_ID, fakeUsers} from '@/fakeServer/fakeAccounts.js';

const SESSION_STORAGE_KEY = 'calcita-examples:session';
/** Lo que se guarda al salir. */
export const SIGNED_OUT = 'signed-out';

/**
 * Quién está dentro según la «cookie» (sin almacenamiento, el de omisión).
 *
 * @returns {string|null} el id, o null si salió
 */
export function signedInUserIdOf() {
    try {
        const storedValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (storedValue === SIGNED_OUT) {
            return null;
        }
        return fakeUsers.some((user) => user.id === storedValue) ? storedValue : DEFAULT_SIGNED_IN_USER_ID;
    } catch {
        return DEFAULT_SIGNED_IN_USER_ID;
    }
}

/**
 * @param {string} value el id de quien entra, o SIGNED_OUT
 */
export function rememberSession(value) {
    try {
        window.localStorage.setItem(SESSION_STORAGE_KEY, value);
    } catch {
        // almacenamiento bloqueado: la sesión dura lo que la pestaña
    }
}
