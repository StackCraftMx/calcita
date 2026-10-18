// Lo que respondería el API de cuentas: la sesión, entrar, salir, «¿olvidó su contraseña?» y cambiar la contraseña. La
// sesión vive en este navegador (localStorage), como la cookie que pondría el backend.
//
// OJO, servidor de mentira: no guarda ni revisa contraseñas (entra quien escriba el correo de la cuenta de ejemplo). El
// backend de verdad sí; aquí solo se simula lo que responde, con los mismos errores (RFC 9457).
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {ApiError} from '@stackcraftmx/calcita';

import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverText.js';

const HTTP_STATUS = Object.freeze({unauthorized: 401});
// la «cookie» de la sesión, con el nombre de la app para no chocar con otra en el mismo navegador
const SESSION_STORAGE_KEY = '__APP_SLUG__:session';
// la persona de ejemplo (datos inventados): lo que mandaría el backend de quien entró
const DEMO_ACCOUNT = Object.freeze({
    user: {id: 'user-demo', name: 'Ana Martínez Ruiz', email: 'ana.martinez@ejemplo.com', subtitle: 'Administración'},
    roles: ['admin'],
    abilities: [],
});
const MESSAGES = Object.freeze({
    wrongCredentialsTitle: {es: 'No pudo entrar', en: 'You could not sign in'},
    wrongCredentials: {es: 'El correo o la contraseña no coinciden.', en: 'The email or the password do not match.'},
});

/** ¿Hay sesión en este navegador? Si el almacenamiento está bloqueado, no. */
function hasStoredSession() {
    try {
        return window.localStorage.getItem(SESSION_STORAGE_KEY) === DEMO_ACCOUNT.user.id;
    } catch {
        return false;
    }
}

/** Guarda o quita la sesión de este navegador. */
function rememberSession(isSignedIn) {
    try {
        if (isSignedIn) {
            window.localStorage.setItem(SESSION_STORAGE_KEY, DEMO_ACCOUNT.user.id);
        } else {
            window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
    } catch {
        // almacenamiento bloqueado: la sesión dura lo que dure la pestaña
    }
}

/** GET auth/session: quién está dentro, o null. */
export async function getSession() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    return hasStoredSession() ? structuredClone(DEMO_ACCOUNT) : null;
}

/** POST auth/sign-in. Un correo que no es el de la cuenta de ejemplo responde 401, como el backend. */
export async function signIn({email}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    if (email.trim().toLowerCase() !== DEMO_ACCOUNT.user.email) {
        throw new ApiError({
            status: HTTP_STATUS.unauthorized,
            problem: {title: serverTextOf(MESSAGES.wrongCredentialsTitle), detail: serverTextOf(MESSAGES.wrongCredentials)},
        });
    }
    rememberSession(true);
}

/** Solo del servidor de mentira: entra con la cuenta de ejemplo sin escribir nada (el botón de la pantalla de entrar). */
export async function signInAsDemo() {
    await signIn({email: DEMO_ACCOUNT.user.email});
}

/** POST auth/sign-out. */
export async function signOut() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    rememberSession(false);
}

/**
 * POST auth/forgot-password: siempre responde que sí, tenga o no cuenta el correo, para no decirle a nadie qué correos
 * tienen cuenta. El formulario dice «revise su correo».
 */
export async function requestPasswordReset() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
}

/** PUT auth/password: el formulario dice que ya cambió. */
export async function changePassword() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
}
