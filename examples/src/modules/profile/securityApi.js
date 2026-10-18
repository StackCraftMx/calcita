// Las llamadas de la seguridad de «Mi perfil», con los datos ya en la forma de las tarjetas del framework (camelCase): el
// servidor responde como un backend (snake_case) y aquí se traduce una sola vez.
//
// Las llaves de acceso se crean aquí con createPasskey (@stackcraftmx/calcita/passkeys): el navegador pide la huella, el
// rostro o el PIN, y la respuesta se manda al servidor.
//
// Funciones que no renderizan: function (regla de la casa).
import {createPasskey} from '@stackcraftmx/calcita/passkeys';

import * as securityServer from '@/fakeServer/securityServer.js';

export {demoTotpCode} from '@/fakeServer/securityServer.js';

/** El estado de la verificación como lo pide TwoStepVerificationCard. */
function securityOf(response) {
    return {
        isEnabled: response.is_enabled,
        enabledAt: response.enabled_at,
        passkeys: response.passkeys.map((passkey) => ({id: passkey.id, name: passkey.name, createdAt: passkey.created_at, lastUsedAt: passkey.last_used_at})),
        totp: {isEnabled: response.totp.is_enabled, enabledAt: response.totp.enabled_at},
        recoveryCodesRemaining: response.recovery_codes_remaining,
    };
}

/** Lo que regresa una acción: el estado nuevo y, si hubo, los códigos de recuperación (se enseñan una sola vez). */
function resultOf(response) {
    return {security: securityOf(response.security), recoveryCodes: response.recovery_codes};
}

export async function loadSecurity() {
    return securityOf(await securityServer.getSecurity());
}

/** Las acciones de TwoStepVerificationCard. */
export const securityActions = {
    addPasskey: async (name) => {
        const credential = await createPasskey(await securityServer.passkeyRegistrationOptions());
        return resultOf(await securityServer.addPasskey(name, credential));
    },
    removePasskey: async (passkey, password) => resultOf(await securityServer.removePasskey(passkey.id, password)),
    startTotp: async () => {
        const setup = await securityServer.startTotp();
        return {secret: setup.secret, qrImageUrl: setup.qr_image_url};
    },
    confirmTotp: async (code) => resultOf(await securityServer.confirmTotp(code)),
    disableTotp: async (password) => resultOf(await securityServer.disableTotp(password)),
    regenerateRecoveryCodes: async (password) => resultOf(await securityServer.regenerateRecoveryCodes(password)),
};

/** Las sesiones abiertas como las pide SessionsCard. */
export async function loadSessions() {
    const sessions = await securityServer.listSessions();
    return sessions.map((session) => ({
        id: session.id, browser: session.browser, platform: session.platform, isMobile: session.is_mobile,
        startedAt: session.started_at, network: session.network, isCurrent: session.is_current,
    }));
}

/** Cierra las sesiones de los demás equipos; regresa cuántas cerró. */
export async function closeOtherSessions() {
    return (await securityServer.closeOtherSessions()).closed;
}

/** La bitácora como la pide ActivityLog. */
export async function loadActivity() {
    const events = await securityServer.listActivity();
    return events.map((event) => ({id: event.id, kind: event.kind, occurredAt: event.occurred_at, device: event.device, network: event.network}));
}
