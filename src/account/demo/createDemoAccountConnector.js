// El conector de la cuenta de DEMOSTRACIÓN (@stackcraftmx/calcita/account-demo): todo vive en el navegador, para arrancar
// un proyecto sin backend y ver las pantallas de la cuenta funcionando. Se cambia por el de verdad sin tocar las pantallas:
//
//   export const accountConnector = API_URL ? createRestAccountConnector(apiClient) : createDemoAccountConnector();
//
// Lo que hace de verdad: la clave de la app autenticadora es real (con toQrImageUrl sale en un QR que su app escanea) y el
// código de 6 dígitos se revisa con el mismo cálculo que un servidor (totp.js); las llaves de acceso le hablan al navegador
// de verdad (Touch ID, Face ID, Windows Hello). Lo que NO hace: revisar contraseñas (entra el correo de la cuenta con
// cualquiera) ni la firma de las llaves, que un servidor revisa con su librería.
//
// La sesión se recuerda en este navegador (localStorage); la seguridad vive en la memoria de la pestaña: al recargar, la
// verificación en dos pasos vuelve a estar apagada. Los mensajes salen en el idioma de la app, como los mandaría un backend.
//
// Funciones del servidor de demostración, sin React: function (regla de la casa). Pruebas en createDemoAccountConnector.test.js.
import {ApiError} from '@/api/ApiError.js';
import {isValidTotpCode, newTotpSecret, otpauthUrlOf, totpCodeAt} from '@/account/demo/totp.js';
import {translateToolkit} from '@/toolkit/toolkitSettings.js';

const HTTP_STATUS = Object.freeze({unauthorized: 401, unprocessable: 422, locked: 423});
// la persona de la demostración (datos inventados)
const DEMO_USER = Object.freeze({id: 'user-demo', name: 'Ana Martínez Ruiz', email: 'ana.martinez@ejemplo.com', subtitle: 'Administración', phone: ''});
const DEFAULT_STORAGE_KEY = 'calcita-demo:session';
// lo que tarda una respuesta: sin espera no se verían los botones ocupados
const DEFAULT_DELAY_MILLISECONDS = 400;
// quién emite la cuenta en la app autenticadora (lo que se ve arriba del código)
const DEFAULT_ISSUER = 'Calcita';
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
// los algoritmos de firma que se aceptan para las llaves (los números de COSE: ES256 y RS256)
const ES256 = -7;
const RS256 = -257;
// las formas del segundo paso (SECOND_STEP_METHOD de /forms)
const METHOD = Object.freeze({passkey: 'passkey', totp: 'totp', recoveryCode: 'recoveryCode'});
// la red como la enseñaría un servidor: a medias, nunca la IP completa
const THIS_NETWORK = '187.190.x.x';

/** Un mensaje del servidor de demostración en el idioma de la app. */
const messageOf = (key, values) => translateToolkit('account', `demo.server.${key}`, values);

/** Bytes → base64url (como viajan los retos y los ids de WebAuthn). */
function base64UrlOf(bytes) {
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Este equipo según su user agent, como lo resumiría el servidor. */
function thisDevice() {
    const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
    const browser = /Edg\//.test(userAgent) ? 'Edge' : /Firefox\//.test(userAgent) ? 'Firefox' : /Chrome\//.test(userAgent) ? 'Chrome'
        : /Safari\//.test(userAgent) ? 'Safari' : null;
    const platform = /iPhone|iPad/.test(userAgent) ? 'iOS' : /Android/.test(userAgent) ? 'Android' : /Mac OS X/.test(userAgent) ? 'macOS'
        : /Windows/.test(userAgent) ? 'Windows' : /Linux/.test(userAgent) ? 'Linux' : null;
    return {browser, platform, isMobile: /iPhone|Android.*Mobile/.test(userAgent)};
}

/** Diez códigos nuevos, de la forma ABCDE-FGHJK. */
function newRecoveryCodes() {
    return Array.from({length: RECOVERY_CODE_COUNT}, () => {
        const characters = Array.from(crypto.getRandomValues(new Uint8Array(10)), (byte) => RECOVERY_CODE_ALPHABET[byte % RECOVERY_CODE_ALPHABET.length]);
        return `${characters.slice(0, 5).join('')}-${characters.slice(5).join('')}`;
    });
}

/** El 422 con el error en su campo. */
function fieldError(field, message) {
    return new ApiError({
        status: HTTP_STATUS.unprocessable,
        problem: {title: messageOf('validationTitle'), detail: messageOf('validationDetail'), errors: {[field]: [message]}},
    });
}

/**
 * @param {object} [options]
 * @param {{id: string, name: string, email: string, subtitle?: string, phone?: string}} [options.user] la persona de la
 *     demostración; por omisión una inventada
 * @param {string[]} [options.roles]
 * @param {string[]} [options.abilities]
 * @param {string[]} [options.labels] sus perfiles, ya traducidos (chips en Mi perfil)
 * @param {string} [options.storageKey] dónde se recuerda la sesión en este navegador (con el nombre de la app)
 * @param {(otpauthUrl: string) => Promise<string>} [options.toQrImageUrl] el QR de la clave (p. ej. QRCode.toDataURL de
 *     la librería qrcode); sin él, la persona escribe la clave a mano en su app
 * @param {string} [options.issuer] el nombre que enseña la app autenticadora
 * @param {number} [options.delayMilliseconds] lo que tarda cada respuesta
 * @returns {import('@/account/accountConnector.js').AccountConnector}
 */
export function createDemoAccountConnector({
    user = DEMO_USER, roles = ['admin'], abilities = [], labels = [], storageKey = DEFAULT_STORAGE_KEY, toQrImageUrl,
    issuer = DEFAULT_ISSUER, delayMilliseconds = DEFAULT_DELAY_MILLISECONDS,
} = {}) {
    const profile = {...user};
    // la seguridad de la cuenta, en la memoria de la pestaña (con su bitácora y sus sesiones de ejemplo)
    const security = initialSecurity();
    // la persona ya puso su contraseña y le falta el segundo paso
    let pendingSecondStep = null;

    const wait = () => new Promise((resolve) => setTimeout(resolve, delayMilliseconds));

    function initialSecurity() {
        const now = Date.now();
        const device = thisDevice();
        const deviceName = `${device.browser ?? '—'} · ${device.platform ?? '—'}`;
        return {
            totp: null,
            pendingTotpSecret: null,
            passkeys: [],
            recoveryCodes: [],
            enabledAt: null,
            sessions: [
                {id: 'session-this', ...device, startedAt: new Date(now - 2 * MILLISECONDS_PER_HOUR).toISOString(), network: THIS_NETWORK, isCurrent: true},
                {id: 'session-phone', browser: 'Safari', platform: 'iOS', isMobile: true,
                    startedAt: new Date(now - 26 * MILLISECONDS_PER_HOUR).toISOString(), network: '201.141.x.x', isCurrent: false},
            ],
            // de lo más nuevo a lo más viejo
            events: [
                {id: 'event-2', kind: 'signedIn', occurredAt: new Date(now - 2 * MILLISECONDS_PER_HOUR).toISOString(), device: deviceName, network: THIS_NETWORK},
                {id: 'event-1', kind: 'signInFailed', occurredAt: new Date(now - 30 * MILLISECONDS_PER_HOUR).toISOString(), device: 'Firefox · Windows', network: '177.230.x.x'},
            ],
        };
    }

    // ─── la sesión en este navegador ───

    const isSignedIn = () => {
        try {
            return window.localStorage.getItem(storageKey) === profile.id;
        } catch {
            return false;
        }
    };
    const rememberSession = (signedIn) => {
        try {
            if (signedIn) {
                window.localStorage.setItem(storageKey, profile.id);
            } else {
                window.localStorage.removeItem(storageKey);
            }
        } catch {
            // almacenamiento bloqueado: la sesión dura lo que dure la pestaña
        }
    };
    const failIfSignedOut = () => {
        if (!isSignedIn()) {
            throw new ApiError({status: HTTP_STATUS.unauthorized, problem: {title: messageOf('noSessionTitle'), detail: messageOf('noSession')}});
        }
    };
    // lo que QUITA protección pide la contraseña; en la demostración sirve cualquiera que se escriba
    const failWithoutPassword = (password) => {
        if (!password) {
            throw fieldError('password', messageOf('passwordRequired'));
        }
    };

    // ─── la seguridad ───

    const recordEvent = (kind) => {
        const device = thisDevice();
        security.events.unshift({
            id: `event-${Date.now()}-${security.events.length}`, kind, occurredAt: new Date().toISOString(),
            device: `${device.browser ?? '—'} · ${device.platform ?? '—'}`, network: THIS_NETWORK,
        });
    };
    const isSecondFactorOn = () => Boolean(security.totp) || security.passkeys.length > 0;
    const securityNow = () => ({
        isEnabled: isSecondFactorOn(),
        enabledAt: security.enabledAt,
        passkeys: security.passkeys.map(({id, name, createdAt, lastUsedAt}) => ({id, name, createdAt, lastUsedAt})),
        totp: {isEnabled: Boolean(security.totp), enabledAt: security.totp?.enabledAt ?? null},
        recoveryCodesRemaining: security.recoveryCodes.length,
    });
    // la primera protección que se prende activa la verificación y genera los códigos (se enseñan una sola vez)
    const turnOnIfFirstFactor = (wasOn) => {
        if (wasOn) {
            return undefined;
        }
        security.enabledAt = new Date().toISOString();
        security.recoveryCodes = newRecoveryCodes();
        recordEvent('twoStepEnabled');
        return [...security.recoveryCodes];
    };
    // al quitar la última, la verificación se apaga y los códigos dejan de servir
    const turnOffIfNoFactorLeft = () => {
        if (!isSecondFactorOn()) {
            security.enabledAt = null;
            security.recoveryCodes = [];
            recordEvent('twoStepDisabled');
        }
    };

    // ─── el segundo paso ───

    const pendingOrFail = () => {
        if (!pendingSecondStep || Date.now() > pendingSecondStep.expiresAt) {
            pendingSecondStep = null;
            throw new ApiError({status: HTTP_STATUS.unauthorized, problem: {code: 'second_step_expired', title: messageOf('expiredTitle'), detail: messageOf('expired')}});
        }
    };
    // un código equivocado resta un intento; sin intentos se bloquea (423) y hay que empezar de nuevo
    const failSecondStep = () => {
        pendingSecondStep.attemptsLeft -= 1;
        recordEvent('signInFailed');
        if (pendingSecondStep.attemptsLeft <= 0) {
            pendingSecondStep = null;
            throw new ApiError({status: HTTP_STATUS.locked, problem: {code: 'account_locked', title: messageOf('lockedTitle'), detail: messageOf('locked')}});
        }
        throw new ApiError({
            status: HTTP_STATUS.unauthorized,
            problem: {code: 'invalid_code', title: messageOf('wrongCodeTitle'), detail: messageOf('wrongCode'), remaining_attempts: pendingSecondStep.attemptsLeft},
        });
    };
    const finishSignIn = (kind = 'signedIn') => {
        pendingSecondStep = null;
        rememberSession(true);
        recordEvent(kind);
    };
    const passkeyChallenge = () => base64UrlOf(crypto.getRandomValues(new Uint8Array(CHALLENGE_BYTES)));

    return {
        loadSession: async () => {
            await wait();
            return isSignedIn() ? {user: {...profile}, roles: [...roles], abilities: [...abilities], labels: [...labels]} : null;
        },
        signIn: async ({email}) => {
            await wait();
            if (email?.trim().toLowerCase() !== profile.email.toLowerCase()) {
                throw new ApiError({
                    status: HTTP_STATUS.unauthorized,
                    problem: {title: messageOf('wrongCredentialsTitle'), detail: messageOf('wrongCredentials', {email: profile.email})},
                });
            }
            if (!isSecondFactorOn()) {
                finishSignIn();
                return {secondStep: null};
            }
            pendingSecondStep = {expiresAt: Date.now() + SECOND_STEP_MINUTES * MILLISECONDS_PER_MINUTE, attemptsLeft: SECOND_STEP_ATTEMPTS};
            const methods = [
                ...(security.passkeys.length > 0 ? [METHOD.passkey] : []),
                ...(security.totp ? [METHOD.totp] : []),
                ...(security.recoveryCodes.length > 0 ? [METHOD.recoveryCode] : []),
            ];
            return {secondStep: {methods}};
        },
        signInSecondStep: async ({method, code}) => {
            await wait();
            pendingOrFail();
            if (method === METHOD.recoveryCode) {
                if (!security.recoveryCodes.includes(code)) {
                    failSecondStep();
                }
                // cada código sirve una sola vez
                security.recoveryCodes = security.recoveryCodes.filter((unusedCode) => unusedCode !== code);
                finishSignIn('recoveryCodeUsed');
                return;
            }
            if (!security.totp || !(await isValidTotpCode(security.totp.secret, code))) {
                failSecondStep();
            }
            finishSignIn();
        },
        secondStepPasskeyOptions: async () => {
            await wait();
            pendingOrFail();
            return {
                challenge: passkeyChallenge(), rpId: window.location.hostname, userVerification: 'preferred', timeout: PASSKEY_TIMEOUT_MILLISECONDS,
                allowCredentials: security.passkeys.map((passkey) => ({id: passkey.credentialId, type: 'public-key'})),
            };
        },
        signInWithPasskey: async (credential) => {
            await wait();
            pendingOrFail();
            const passkey = security.passkeys.find((candidate) => candidate.credentialId === credential?.id);
            if (!passkey) {
                failSecondStep();
            }
            passkey.lastUsedAt = new Date().toISOString();
            finishSignIn();
        },
        signOut: async () => {
            await wait();
            rememberSession(false);
        },
        requestPasswordReset: async () => {
            await wait();
        },
        resetPassword: async () => {
            await wait();
            recordEvent('passwordChanged');
        },
        updateProfile: async ({name, phone}) => {
            await wait();
            failIfSignedOut();
            if (!name?.trim()) {
                throw fieldError('name', messageOf('nameRequired'));
            }
            profile.name = name.trim();
            profile.phone = phone?.trim() ?? '';
            return {message: messageOf('profileSaved')};
        },
        changePassword: async () => {
            await wait();
            failIfSignedOut();
            recordEvent('passwordChanged');
        },
        loadSecurity: async () => {
            await wait();
            failIfSignedOut();
            return securityNow();
        },
        startTotp: async () => {
            await wait();
            failIfSignedOut();
            security.pendingTotpSecret = newTotpSecret();
            const otpauthUrl = otpauthUrlOf({secret: security.pendingTotpSecret, account: profile.email, issuer});
            return {secret: security.pendingTotpSecret, qrImageUrl: toQrImageUrl ? await toQrImageUrl(otpauthUrl) : null};
        },
        confirmTotp: async (code) => {
            await wait();
            failIfSignedOut();
            if (!security.pendingTotpSecret || !(await isValidTotpCode(security.pendingTotpSecret, code))) {
                throw fieldError('code', messageOf('wrongCode'));
            }
            const wasOn = isSecondFactorOn();
            security.totp = {secret: security.pendingTotpSecret, enabledAt: new Date().toISOString()};
            security.pendingTotpSecret = null;
            const recoveryCodes = turnOnIfFirstFactor(wasOn);
            return {security: securityNow(), recoveryCodes};
        },
        disableTotp: async (password) => {
            await wait();
            failIfSignedOut();
            failWithoutPassword(password);
            security.totp = null;
            turnOffIfNoFactorLeft();
            return {security: securityNow()};
        },
        passkeyRegistrationOptions: async () => {
            await wait();
            failIfSignedOut();
            return {
                challenge: passkeyChallenge(),
                rp: {name: issuer, id: window.location.hostname},
                user: {id: base64UrlOf(new TextEncoder().encode(profile.id)), name: profile.email, displayName: profile.name},
                pubKeyCredParams: [{type: 'public-key', alg: ES256}, {type: 'public-key', alg: RS256}],
                timeout: PASSKEY_TIMEOUT_MILLISECONDS,
                attestation: 'none',
                // las que ya tiene: el navegador avisa si la persona intenta registrar la misma otra vez
                excludeCredentials: security.passkeys.map((passkey) => ({id: passkey.credentialId, type: 'public-key'})),
                authenticatorSelection: {residentKey: 'preferred', userVerification: 'preferred'},
            };
        },
        savePasskey: async ({name, credential}) => {
            await wait();
            failIfSignedOut();
            const wasOn = isSecondFactorOn();
            security.passkeys.push({
                id: `passkey-${Date.now()}`, credentialId: credential?.id,
                name: name?.trim() || messageOf('defaultPasskeyName', {number: security.passkeys.length + 1}),
                createdAt: new Date().toISOString(), lastUsedAt: null,
            });
            recordEvent('passkeyAdded');
            const recoveryCodes = turnOnIfFirstFactor(wasOn);
            return {security: securityNow(), recoveryCodes};
        },
        removePasskey: async ({passkeyId, password}) => {
            await wait();
            failIfSignedOut();
            failWithoutPassword(password);
            security.passkeys = security.passkeys.filter((passkey) => passkey.id !== passkeyId);
            recordEvent('passkeyRemoved');
            turnOffIfNoFactorLeft();
            return {security: securityNow()};
        },
        regenerateRecoveryCodes: async (password) => {
            await wait();
            failIfSignedOut();
            failWithoutPassword(password);
            security.recoveryCodes = newRecoveryCodes();
            recordEvent('recoveryCodesGenerated');
            return {security: securityNow(), recoveryCodes: [...security.recoveryCodes]};
        },
        listSessions: async () => {
            await wait();
            failIfSignedOut();
            return security.sessions.map((session) => ({...session}));
        },
        closeOtherSessions: async () => {
            await wait();
            failIfSignedOut();
            const closed = security.sessions.filter((session) => !session.isCurrent).length;
            security.sessions = security.sessions.filter((session) => session.isCurrent);
            if (closed > 0) {
                recordEvent('sessionsClosed');
            }
            return closed;
        },
        listActivity: async () => {
            await wait();
            failIfSignedOut();
            return security.events.map((event) => ({...event}));
        },
        // solo de la demostración: el código que enseñaría la app ahorita, con la clave por activar o la ya activa
        demoTotpCode: async () => {
            const secret = security.pendingTotpSecret ?? security.totp?.secret;
            return secret ? totpCodeAt(secret) : null;
        },
    };
}
