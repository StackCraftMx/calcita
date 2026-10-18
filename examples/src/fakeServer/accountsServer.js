// Lo que respondería el API de la sesión, de la cuenta y de los perfiles: entrar y salir, «¿olvidó su contraseña?»,
// cambiarla, guardar los datos propios y los permisos de cada perfil.
//
// La sesión se guarda en el navegador (como la cookie de un backend real): al recargar se sigue dentro. Sin nada guardado
// entra administración, para que los ejemplos abran directo y con todo el menú; «Salir» la cierra de verdad y lleva a
// iniciar sesión, donde se entra con los otros perfiles.
//
// OJO, son ejemplos: cualquier contraseña escrita sirve con un correo de la lista, y los botones «Entrar como…» entran sin
// contraseña. Un backend de verdad compara contra la contraseña cifrada y limita los intentos.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {ApiError} from '@/fakeServer/ApiError.js';
import {ABILITIES, fakeProfiles, fakeUsers} from '@/fakeServer/fakeAccounts.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {inServerLanguage, serverTextOf} from '@/fakeServer/serverMessages.js';
import {recordAccountEvent, startSecondStepIfNeeded} from '@/fakeServer/securityServer.js';
import {SIGNED_OUT, rememberSession, signedInUserIdOf} from '@/fakeServer/sessionCookie.js';

const HTTP_STATUS = Object.freeze({unauthorized: 401, conflict: 409, unprocessable: 422});
/**
 * Un perfil como lo manda el API: su nombre en el idioma activo y cuántas personas lo tienen.
 *
 * @param {object} profile
 * @returns {{key: string, name: string, description: string, abilities: string[], is_locked: boolean, users_count: number}}
 */
function profileResponseOf(profile) {
    return {
        key: profile.key,
        name: inServerLanguage(profile.names),
        description: inServerLanguage(profile.descriptions),
        abilities: [...profile.abilities],
        is_locked: profile.isLocked,
        users_count: fakeUsers.filter((user) => user.profileKey === profile.key).length,
    };
}

/**
 * Lo que manda GET auth/session: la persona, su perfil y sus permisos; null si nadie está dentro.
 *
 * @returns {Promise<{user: object, profile: object, abilities: string[], roles: string[]}|null>}
 */
export async function getSession() {
    const userId = signedInUserIdOf();
    const user = fakeUsers.find((candidate) => candidate.id === userId);
    // guard clause: nadie dentro
    if (!user) {
        return null;
    }
    const profile = fakeProfiles.find((candidate) => candidate.key === user.profileKey);
    const position = inServerLanguage(user.positions);
    return {
        user: {id: user.id, name: user.name, email: user.email, phone: user.phone, subtitle: `${position} · ${serverTextOf('accounts.store')}`},
        profile: {key: profile.key, name: inServerLanguage(profile.names)},
        abilities: [...profile.abilities],
        roles: [profile.key],
    };
}

/**
 * Entrar con correo y contraseña (POST auth/sign-in).
 *
 * @param {{email: string, password: string}} credentials
 * @returns {Promise<{secondStep: {methods: string[]}}|null>} con verificación en dos pasos, los métodos del segundo paso
 */
export async function signIn({email, password}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const user = fakeUsers.find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase());
    // el mismo mensaje si el correo no existe o la contraseña no es: decir cuál falló le confirma a cualquiera qué correos sí
    if (!user || !password) {
        if (user) {
            recordAccountEvent(user.id, 'signInFailed');
        }
        throw new ApiError({
            status: HTTP_STATUS.unauthorized,
            problem: {
                status: HTTP_STATUS.unauthorized, code: 'invalid_credentials',
                title: serverTextOf('accounts.signInFailedTitle'), detail: serverTextOf('accounts.signInFailed'),
            },
        });
    }
    return startSecondStepIfNeeded(user.id);
}

/**
 * Las personas de los ejemplos con su perfil, para los botones de «Entrar como…» (solo existe en los ejemplos).
 *
 * @returns {Array<{userId: string, name: string, profileName: string}>}
 */
export function demoPeopleOf() {
    return fakeUsers.map((user) => ({
        userId: user.id,
        name: user.name,
        profileName: inServerLanguage(fakeProfiles.find((profile) => profile.key === user.profileKey).names),
    }));
}

/**
 * El atajo de los ejemplos: entrar como una de las personas sin escribir contraseña.
 *
 * @param {string} userId
 * @returns {Promise<{secondStep: {methods: string[]}}|null>} con verificación en dos pasos, también se pide el segundo paso
 */
export async function signInAs(userId) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    return startSecondStepIfNeeded(userId);
}

/** Salir (POST auth/sign-out). */
export async function signOut() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const userId = signedInUserIdOf();
    if (userId) {
        recordAccountEvent(userId, 'signedOut');
    }
    rememberSession(SIGNED_OUT);
}

/**
 * Pedir el enlace para elegir una contraseña nueva (POST auth/forgot-password). Contesta igual exista o no el correo.
 *
 * @returns {Promise<void>}
 */
export async function requestPasswordReset() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
}

/**
 * Elegir la contraseña nueva desde el enlace del correo (POST auth/reset-password).
 *
 * @returns {Promise<void>}
 */
export async function resetPassword() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
}

/**
 * Cambiar la contraseña desde «Mi perfil» (PUT auth/password).
 *
 * @returns {Promise<void>}
 */
export async function changePassword() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    recordAccountEvent(signedInUserIdOf(), 'passwordChanged');
}

/**
 * Guardar los datos propios (PUT account): el nombre y el teléfono.
 *
 * @param {{name: string, phone: string}} account
 * @returns {Promise<{message: string}>}
 */
export async function updateMyAccount({name, phone}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    // los errores de cada campo, como los manda el backend: {campo: [mensajes]}
    const errors = {};
    if (!name?.trim()) {
        errors.name = [serverTextOf('accounts.nameRequired')];
    }
    if (phone && !PHONE_PATTERN.test(phone)) {
        errors.phone = [serverTextOf('accounts.phoneInvalid')];
    }
    if (Object.keys(errors).length > 0) {
        throw new ApiError({
            status: HTTP_STATUS.unprocessable,
            problem: {status: HTTP_STATUS.unprocessable, code: 'validation_failed', title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors},
        });
    }
    const user = fakeUsers.find((candidate) => candidate.id === signedInUserIdOf());
    user.name = name.trim();
    user.phone = phone ?? '';
    return {message: serverTextOf('accounts.accountSaved')};
}

/**
 * Los perfiles con sus permisos (GET profiles).
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<object[]>}
 */
export async function listProfiles(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return fakeProfiles.map(profileResponseOf);
}

/**
 * Guardar los permisos de un perfil (PUT profiles/{key}/abilities). Solo se guardan permisos que existen.
 *
 * @param {string} profileKey
 * @param {string[]} abilities
 * @returns {Promise<{profile: object, message: string}>}
 */
export async function saveProfileAbilities(profileKey, abilities) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const profile = fakeProfiles.find((candidate) => candidate.key === profileKey);
    if (profile.isLocked) {
        throw new ApiError({
            status: HTTP_STATUS.conflict,
            problem: {status: HTTP_STATUS.conflict, code: 'profile_locked', title: serverTextOf('accounts.profileLockedTitle'), detail: serverTextOf('accounts.profileLocked')},
        });
    }
    const knownAbilities = new Set(Object.values(ABILITIES));
    profile.abilities = abilities.filter((ability) => knownAbilities.has(ability));
    return {profile: profileResponseOf(profile), message: serverTextOf('accounts.profileSaved', {name: inServerLanguage(profile.names)})};
}
