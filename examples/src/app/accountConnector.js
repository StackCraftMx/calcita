// El conector de la cuenta de los ejemplos: las pantallas de @stackcraftmx/calcita/account (entrar, segundo paso, Mi perfil
// y su seguridad) le hablan al servidor de mentira de los ejemplos a través de este objeto. Es lo ÚNICO que un proyecto
// escribe para tener la cuenta completa; con un backend que siga el contrato REST bastaría
// createRestAccountConnector(apiClient).
//
// El servidor de mentira responde como ese contrato (snake_case): las traducciones a camelCase son las del paquete
// (securityFromResponse, securityChangeFromResponse). La sesión trae además el perfil (lo usa la pantalla de perfiles).
//
// Funciones que no renderizan: function (regla de la casa).
import {securityChangeFromResponse, securityFromResponse} from '@stackcraftmx/calcita/account';

import * as accountsServer from '@/fakeServer/accountsServer.js';
import * as securityServer from '@/fakeServer/securityServer.js';

/** @type {import('@stackcraftmx/calcita/account').AccountConnector} */
export const accountConnector = {
    loadSession: async () => {
        const session = await accountsServer.getSession();
        // el nombre del perfil sale como chip en Mi perfil
        return session && {...session, labels: [session.profile.name]};
    },
    signIn: async (credentials) => (await accountsServer.signIn(credentials)) ?? {secondStep: null},
    signInSecondStep: ({method, code}) => (method === 'totp' ? securityServer.secondStepTotp(code) : securityServer.secondStepRecoveryCode(code)),
    secondStepPasskeyOptions: () => securityServer.secondStepPasskeyOptions(),
    signInWithPasskey: (credential) => securityServer.secondStepPasskey(credential),
    signOut: () => accountsServer.signOut(),
    requestPasswordReset: (input) => accountsServer.requestPasswordReset(input),
    resetPassword: (input) => accountsServer.resetPassword(input),
    updateProfile: (input) => accountsServer.updateMyAccount(input),
    changePassword: (input) => accountsServer.changePassword(input),
    loadSecurity: async () => securityFromResponse(await securityServer.getSecurity()),
    startTotp: async () => {
        const setup = await securityServer.startTotp();
        return {secret: setup.secret, qrImageUrl: setup.qr_image_url};
    },
    confirmTotp: async (code) => securityChangeFromResponse(await securityServer.confirmTotp(code)),
    disableTotp: async (password) => securityChangeFromResponse(await securityServer.disableTotp(password)),
    passkeyRegistrationOptions: () => securityServer.passkeyRegistrationOptions(),
    savePasskey: async ({name, credential}) => securityChangeFromResponse(await securityServer.addPasskey(name, credential)),
    removePasskey: async ({passkeyId, password}) => securityChangeFromResponse(await securityServer.removePasskey(passkeyId, password)),
    regenerateRecoveryCodes: async (password) => securityChangeFromResponse(await securityServer.regenerateRecoveryCodes(password)),
    listSessions: async () => (await securityServer.listSessions()).map((session) => ({
        id: session.id, browser: session.browser, platform: session.platform, isMobile: session.is_mobile,
        startedAt: session.started_at, network: session.network, isCurrent: session.is_current,
    })),
    closeOtherSessions: async () => (await securityServer.closeOtherSessions()).closed,
    listActivity: async () => (await securityServer.listActivity()).map((event) => ({
        id: event.id, kind: event.kind, occurredAt: event.occurred_at, device: event.device, network: event.network,
    })),
    // solo de los ejemplos: el atajo del código de la app (sin él no sale el botón «Usar el código de ejemplo»)
    demoTotpCode: () => securityServer.demoTotpCode(),
};
