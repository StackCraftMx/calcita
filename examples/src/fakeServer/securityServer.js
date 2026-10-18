// Lo que respondería el API de la seguridad de la cuenta: la verificación en dos pasos (app autenticadora, llaves de acceso
// y códigos de recuperación), el segundo paso al entrar, las sesiones abiertas y la bitácora.
//
// Funciona de verdad con su teléfono: la clave de la app autenticadora es real (sale en un QR que su app puede escanear) y
// el código de 6 dígitos se revisa con el mismo cálculo que usa un servidor (el de @stackcraftmx/calcita/account-demo). Las llaves de acceso también le
// hablan al navegador de verdad (Touch ID, Face ID, Windows Hello); lo que este servidor NO hace es revisar la firma de la
// llave, que un servidor real revisa con su librería (py_webauthn, @simplewebauthn/server, web-auth/webauthn-lib).
//
// OJO, son ejemplos: la contraseña que confirma quitar protección sirve cualquiera que se escriba, como al entrar. Todo
// vive en la memoria de la pestaña: al recargar, la verificación vuelve a estar apagada.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import QRCode from 'qrcode';

import {ApiError} from '@/fakeServer/ApiError.js';
import {fakeUsers} from '@/fakeServer/fakeAccounts.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';
import {rememberSession, signedInUserIdOf} from '@/fakeServer/sessionCookie.js';
// los códigos de la app autenticadora: el mismo cálculo del conector de demostración del paquete
import {isValidTotpCode, newTotpSecret, otpauthUrlOf, totpCodeAt} from '@stackcraftmx/calcita/account-demo';

const HTTP_STATUS = Object.freeze({unauthorized: 401, locked: 423, unprocessable: 422});
// quién emite la cuenta en la app autenticadora (lo que se ve arriba del código)
const TOTP_ISSUER = 'Calcita';
const QR_WIDTH_PIXELS = 400;
// los códigos de recuperación: 10, de la forma ABCDE-FGHJK, sin letras que se confunden (I, O, 0, 1)
const RECOVERY_CODE_COUNT = 10;
const RECOVERY_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// el segundo paso: cuántos códigos equivocados se aceptan y cuánto tiempo hay para escribirlo
const SECOND_STEP_ATTEMPTS = 5;
const SECOND_STEP_MINUTES = 5;
const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
const PASSKEY_TIMEOUT_MILLISECONDS = 60_000;
const CHALLENGE_BYTES = 32;
const ES256 = -7;
const RS256 = -257;
// las formas del segundo paso (las mismas de SECOND_STEP_METHOD del paquete)
const METHOD = Object.freeze({passkey: 'passkey', totp: 'totp', recoveryCode: 'recoveryCode'});

// el estado de cada cuenta, en la memoria de la pestaña
const securityByUserId = new Map();
// la persona que ya puso su contraseña y le falta el segundo paso
let pendingSecondStep = null;

/** Bytes → base64url (como viajan los retos y los ids de WebAuthn). */
function base64UrlOf(bytes) {
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomChallenge() {
    return base64UrlOf(crypto.getRandomValues(new Uint8Array(CHALLENGE_BYTES)));
}

/**
 * Este equipo según su user agent, como lo resumiría el servidor: el navegador, el sistema y si es teléfono.
 *
 * @returns {{browser: string, platform: string, isMobile: boolean}}
 */
function thisDevice() {
    const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
    const browser = /Edg\//.test(userAgent) ? 'Edge' : /Firefox\//.test(userAgent) ? 'Firefox' : /Chrome\//.test(userAgent) ? 'Chrome'
        : /Safari\//.test(userAgent) ? 'Safari' : null;
    const platform = /iPhone|iPad/.test(userAgent) ? 'iOS' : /Android/.test(userAgent) ? 'Android' : /Mac OS X/.test(userAgent) ? 'macOS'
        : /Windows/.test(userAgent) ? 'Windows' : /Linux/.test(userAgent) ? 'Linux' : null;
    return {browser, platform, isMobile: /iPhone|Android.*Mobile/.test(userAgent)};
}

/**
 * El estado de seguridad de una cuenta (se arma la primera vez, con su bitácora y sus sesiones de ejemplo).
 *
 * @param {string} userId
 * @returns {object}
 */
function securityOf(userId) {
    if (!securityByUserId.has(userId)) {
        const now = Date.now();
        const device = thisDevice();
        const deviceName = `${device.browser ?? 'Navegador'} · ${device.platform ?? '—'}`;
        securityByUserId.set(userId, {
            totp: null,
            pendingTotpSecret: null,
            passkeys: [],
            recoveryCodes: [],
            enabledAt: null,
            pendingChallenge: null,
            sessions: [
                {id: 'session-this', ...device, startedAt: new Date(now - 2 * MILLISECONDS_PER_HOUR).toISOString(), network: '187.190.x.x', isCurrent: true},
                {id: 'session-phone', browser: 'Safari', platform: 'iOS', isMobile: true,
                    startedAt: new Date(now - 26 * MILLISECONDS_PER_HOUR).toISOString(), network: '201.141.x.x', isCurrent: false},
                {id: 'session-office', browser: 'Edge', platform: 'Windows', isMobile: false,
                    startedAt: new Date(now - 5 * 24 * MILLISECONDS_PER_HOUR).toISOString(), network: '189.203.x.x', isCurrent: false},
            ],
            // del más nuevo al más viejo
            events: [
                {id: 'event-3', kind: 'signedIn', occurredAt: new Date(now - 2 * MILLISECONDS_PER_HOUR).toISOString(), device: deviceName, network: '187.190.x.x'},
                {id: 'event-2', kind: 'signInFailed', occurredAt: new Date(now - 30 * MILLISECONDS_PER_HOUR).toISOString(), device: 'Firefox · Windows', network: '177.230.x.x'},
                {id: 'event-1', kind: 'passwordChanged', occurredAt: new Date(now - 3 * 24 * MILLISECONDS_PER_HOUR).toISOString(), device: 'Safari · iOS', network: '201.141.x.x'},
            ],
        });
    }
    return securityByUserId.get(userId);
}

/**
 * Anota algo en la bitácora de la cuenta (desde este equipo).
 *
 * @param {string|null} userId
 * @param {string} kind ACCOUNT_EVENT_KIND del paquete
 */
export function recordAccountEvent(userId, kind) {
    if (!userId) {
        return;
    }
    const device = thisDevice();
    securityOf(userId).events.unshift({
        id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        kind,
        occurredAt: new Date().toISOString(),
        device: `${device.browser ?? 'Navegador'} · ${device.platform ?? '—'}`,
        network: '187.190.x.x',
    });
}

/** ¿La cuenta tiene verificación en dos pasos? Con la app o con al menos una llave. */
function isSecondFactorOn(security) {
    return Boolean(security.totp) || security.passkeys.length > 0;
}

/** Diez códigos nuevos, de la forma ABCDE-FGHJK. */
function newRecoveryCodes() {
    return Array.from({length: RECOVERY_CODE_COUNT}, () => {
        const characters = Array.from(crypto.getRandomValues(new Uint8Array(10)), (byte) => RECOVERY_CODE_ALPHABET[byte % RECOVERY_CODE_ALPHABET.length]);
        return `${characters.slice(0, 5).join('')}-${characters.slice(5).join('')}`;
    });
}

/**
 * El estado como lo manda el API (snake_case, como un backend).
 *
 * @param {object} security
 * @returns {object}
 */
function securityResponseOf(security) {
    return {
        is_enabled: isSecondFactorOn(security),
        enabled_at: security.enabledAt,
        passkeys: security.passkeys.map(({id, name, createdAt, lastUsedAt}) => ({id, name, created_at: createdAt, last_used_at: lastUsedAt})),
        totp: {is_enabled: Boolean(security.totp), enabled_at: security.totp?.enabledAt ?? null},
        recovery_codes_remaining: security.recoveryCodes.length,
    };
}

/** Quien está dentro, o 401. */
function currentUserIdOrFail() {
    const userId = signedInUserIdOf();
    if (!userId) {
        throw new ApiError({status: HTTP_STATUS.unauthorized, problem: {title: serverTextOf('security.noSessionTitle'), detail: serverTextOf('security.noSession')}});
    }
    return userId;
}

/** La contraseña que confirma quitar protección: en los ejemplos sirve cualquiera que se escriba. */
function checkPassword(password) {
    if (!password) {
        throw new ApiError({
            status: HTTP_STATUS.unprocessable,
            problem: {title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors: {password: [serverTextOf('security.passwordRequired')]}},
        });
    }
}

/**
 * Activa la verificación la primera vez que se prende algo: anota desde cuándo y, si no hay códigos, los genera.
 *
 * @returns {string[]|undefined} los códigos nuevos (se enseñan una sola vez)
 */
function turnOnIfFirstFactor(userId, security, wasOn) {
    if (wasOn) {
        return undefined;
    }
    security.enabledAt = new Date().toISOString();
    security.recoveryCodes = newRecoveryCodes();
    recordAccountEvent(userId, 'twoStepEnabled');
    return [...security.recoveryCodes];
}

/** Al apagar lo último, la verificación se apaga y los códigos dejan de servir. */
function turnOffIfNoFactorLeft(userId, security) {
    if (isSecondFactorOn(security)) {
        return;
    }
    security.enabledAt = null;
    security.recoveryCodes = [];
    recordAccountEvent(userId, 'twoStepDisabled');
}

// ─── «Mi perfil»: la verificación en dos pasos ───

/** GET security. */
export async function getSecurity() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    return securityResponseOf(securityOf(currentUserIdOrFail()));
}

/** POST security/totp: una clave nueva y su QR (todavía no se activa: falta confirmar con un código). */
export async function startTotp() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const userId = currentUserIdOrFail();
    const security = securityOf(userId);
    security.pendingTotpSecret = newTotpSecret();
    const account = fakeUsers.find((user) => user.id === userId).email;
    const qrImageUrl = await QRCode.toDataURL(otpauthUrlOf({secret: security.pendingTotpSecret, account, issuer: TOTP_ISSUER}), {margin: 1, width: QR_WIDTH_PIXELS});
    return {secret: security.pendingTotpSecret, qr_image_url: qrImageUrl};
}

/**
 * El código que enseña ahorita la app con la clave por activar (solo existe en los ejemplos: el atajo para quien no tiene
 * la app). Con la verificación ya activa, el de su clave.
 *
 * @returns {Promise<string|null>}
 */
export async function demoTotpCode() {
    const userId = pendingSecondStep?.userId ?? signedInUserIdOf();
    const security = userId ? securityOf(userId) : null;
    const secret = security?.pendingTotpSecret ?? security?.totp?.secret;
    return secret ? totpCodeAt(secret) : null;
}

/** POST security/totp/confirm: con el código bueno, la app queda activa. */
export async function confirmTotp(code) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const userId = currentUserIdOrFail();
    const security = securityOf(userId);
    if (!security.pendingTotpSecret || !(await isValidTotpCode(security.pendingTotpSecret, code))) {
        throw new ApiError({
            status: HTTP_STATUS.unprocessable,
            problem: {title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors: {code: [serverTextOf('security.wrongCode')]}},
        });
    }
    const wasOn = isSecondFactorOn(security);
    security.totp = {secret: security.pendingTotpSecret, enabledAt: new Date().toISOString()};
    security.pendingTotpSecret = null;
    const recoveryCodes = turnOnIfFirstFactor(userId, security, wasOn);
    return {security: securityResponseOf(security), recovery_codes: recoveryCodes};
}

/** DELETE security/totp (pide la contraseña). */
export async function disableTotp(password) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    checkPassword(password);
    const userId = currentUserIdOrFail();
    const security = securityOf(userId);
    security.totp = null;
    turnOffIfNoFactorLeft(userId, security);
    return {security: securityResponseOf(security)};
}

/** GET security/passkeys/registration-options: las opciones para crear una llave (el navegador las usa tal cual). */
export async function passkeyRegistrationOptions() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const userId = currentUserIdOrFail();
    const security = securityOf(userId);
    const user = fakeUsers.find((candidate) => candidate.id === userId);
    security.pendingChallenge = randomChallenge();
    return {
        challenge: security.pendingChallenge,
        rp: {name: TOTP_ISSUER, id: window.location.hostname},
        user: {id: base64UrlOf(new TextEncoder().encode(userId)), name: user.email, displayName: user.name},
        pubKeyCredParams: [{type: 'public-key', alg: ES256}, {type: 'public-key', alg: RS256}],
        timeout: PASSKEY_TIMEOUT_MILLISECONDS,
        attestation: 'none',
        // las que ya tiene: el navegador avisa si la persona intenta registrar la misma otra vez
        excludeCredentials: security.passkeys.map((passkey) => ({id: passkey.credentialId, type: 'public-key'})),
        authenticatorSelection: {residentKey: 'preferred', userVerification: 'preferred'},
    };
}

/** POST security/passkeys: guarda la llave que creó el navegador (un servidor real revisa su firma aquí). */
export async function addPasskey(name, credential) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const userId = currentUserIdOrFail();
    const security = securityOf(userId);
    const wasOn = isSecondFactorOn(security);
    security.passkeys.push({
        id: `passkey-${Date.now()}`,
        credentialId: credential.id,
        name: name || serverTextOf('security.defaultPasskeyName', {number: security.passkeys.length + 1}),
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
    });
    security.pendingChallenge = null;
    recordAccountEvent(userId, 'passkeyAdded');
    const recoveryCodes = turnOnIfFirstFactor(userId, security, wasOn);
    return {security: securityResponseOf(security), recovery_codes: recoveryCodes};
}

/** DELETE security/passkeys/{id} (pide la contraseña). */
export async function removePasskey(passkeyId, password) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    checkPassword(password);
    const userId = currentUserIdOrFail();
    const security = securityOf(userId);
    security.passkeys = security.passkeys.filter((passkey) => passkey.id !== passkeyId);
    recordAccountEvent(userId, 'passkeyRemoved');
    turnOffIfNoFactorLeft(userId, security);
    return {security: securityResponseOf(security)};
}

/** POST security/recovery-codes (pide la contraseña): los de antes dejan de servir. */
export async function regenerateRecoveryCodes(password) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    checkPassword(password);
    const userId = currentUserIdOrFail();
    const security = securityOf(userId);
    security.recoveryCodes = newRecoveryCodes();
    recordAccountEvent(userId, 'recoveryCodesGenerated');
    return {security: securityResponseOf(security), recovery_codes: [...security.recoveryCodes]};
}

// ─── «Mi perfil»: las sesiones abiertas y la bitácora ───

/** GET sessions: los equipos donde la cuenta está abierta (la red a medias, nunca la IP completa). */
export async function listSessions() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    return securityOf(currentUserIdOrFail()).sessions.map((session) => ({
        id: session.id, browser: session.browser, platform: session.platform, is_mobile: session.isMobile,
        started_at: session.startedAt, network: session.network, is_current: session.isCurrent,
    }));
}

/** POST sessions/close-others: este equipo sigue dentro. */
export async function closeOtherSessions() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const userId = currentUserIdOrFail();
    const security = securityOf(userId);
    const closed = security.sessions.filter((session) => !session.isCurrent).length;
    security.sessions = security.sessions.filter((session) => session.isCurrent);
    if (closed > 0) {
        recordAccountEvent(userId, 'sessionsClosed');
    }
    return {closed};
}

/** GET activity: la bitácora de la cuenta, de lo más nuevo a lo más viejo. */
export async function listActivity() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    return securityOf(currentUserIdOrFail()).events.map(({id, kind, occurredAt, device, network}) => ({id, kind, occurred_at: occurredAt, device, network}));
}

// ─── El segundo paso al entrar ───

/**
 * Después de la contraseña: con verificación en dos pasos, se pide el segundo paso y todavía no se está dentro; sin ella,
 * se entra.
 *
 * @param {string} userId
 * @returns {{secondStep: {methods: string[]}}|null}
 */
export function startSecondStepIfNeeded(userId) {
    const security = securityOf(userId);
    if (!isSecondFactorOn(security)) {
        rememberSession(userId);
        recordAccountEvent(userId, 'signedIn');
        return null;
    }
    pendingSecondStep = {userId, expiresAt: Date.now() + SECOND_STEP_MINUTES * MILLISECONDS_PER_MINUTE, attemptsLeft: SECOND_STEP_ATTEMPTS};
    const methods = [
        ...(security.passkeys.length > 0 ? [METHOD.passkey] : []),
        ...(security.totp ? [METHOD.totp] : []),
        ...(security.recoveryCodes.length > 0 ? [METHOD.recoveryCode] : []),
    ];
    return {secondStep: {methods}};
}

/** Quien está a medio entrar, o 401 si se venció el tiempo (hay que volver a escribir la contraseña). */
function pendingUserOrFail() {
    if (!pendingSecondStep || Date.now() > pendingSecondStep.expiresAt) {
        pendingSecondStep = null;
        throw new ApiError({status: HTTP_STATUS.unauthorized, problem: {code: 'second_step_expired', title: serverTextOf('security.expiredTitle'), detail: serverTextOf('security.expired')}});
    }
    return pendingSecondStep.userId;
}

/** Un código equivocado: resta un intento; sin intentos, la cuenta se bloquea (423) y hay que empezar de nuevo. */
function failSecondStep(userId) {
    pendingSecondStep.attemptsLeft -= 1;
    recordAccountEvent(userId, 'signInFailed');
    if (pendingSecondStep.attemptsLeft <= 0) {
        pendingSecondStep = null;
        throw new ApiError({status: HTTP_STATUS.locked, problem: {code: 'account_locked', title: serverTextOf('security.lockedTitle'), detail: serverTextOf('security.locked')}});
    }
    throw new ApiError({
        status: HTTP_STATUS.unauthorized,
        problem: {code: 'invalid_code', title: serverTextOf('security.wrongCodeTitle'), detail: serverTextOf('security.wrongCode'), remaining_attempts: pendingSecondStep.attemptsLeft},
    });
}

/** Terminar de entrar. */
function finishSignIn(userId, kind = 'signedIn') {
    pendingSecondStep = null;
    rememberSession(userId);
    recordAccountEvent(userId, kind);
}

/** POST auth/second-step/totp. */
export async function secondStepTotp(code) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const userId = pendingUserOrFail();
    const security = securityOf(userId);
    if (!security.totp || !(await isValidTotpCode(security.totp.secret, code))) {
        failSecondStep(userId);
    }
    finishSignIn(userId);
}

/** POST auth/second-step/recovery-code: cada código sirve una sola vez. */
export async function secondStepRecoveryCode(code) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const userId = pendingUserOrFail();
    const security = securityOf(userId);
    if (!security.recoveryCodes.includes(code)) {
        failSecondStep(userId);
    }
    security.recoveryCodes = security.recoveryCodes.filter((unusedCode) => unusedCode !== code);
    finishSignIn(userId, 'recoveryCodeUsed');
}

/** GET auth/second-step/passkey-options: el reto para firmar con una de sus llaves. */
export async function secondStepPasskeyOptions() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const security = securityOf(pendingUserOrFail());
    security.pendingChallenge = randomChallenge();
    return {
        challenge: security.pendingChallenge,
        rpId: window.location.hostname,
        allowCredentials: security.passkeys.map((passkey) => ({id: passkey.credentialId, type: 'public-key'})),
        userVerification: 'preferred',
        timeout: PASSKEY_TIMEOUT_MILLISECONDS,
    };
}

/** POST auth/second-step/passkey: la llave tiene que ser una de las de la cuenta (un servidor real revisa la firma). */
export async function secondStepPasskey(credential) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const userId = pendingUserOrFail();
    const security = securityOf(userId);
    const passkey = security.passkeys.find((candidate) => candidate.credentialId === credential?.id);
    if (!passkey) {
        failSecondStep(userId);
    }
    passkey.lastUsedAt = new Date().toISOString();
    finishSignIn(userId);
}
