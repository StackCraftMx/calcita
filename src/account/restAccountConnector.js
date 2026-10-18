// El conector de la cuenta para un backend REST que sigue este contrato (llaves en snake_case, errores RFC 9457). Si el
// backend lo sigue, conectar la cuenta es una línea:
//
//   export const accountConnector = createRestAccountConnector(apiClient);
//
// Si alguna ruta se llama distinto, se cambia en `paths`; si alguna respuesta tiene otra forma, se reemplaza esa función:
//
//   export const accountConnector = {...createRestAccountConnector(apiClient), signIn: async (credentials) => …};
//
// El contrato (las rutas por omisión, ACCOUNT_REST_PATHS):
//
//   GET    /auth/session                          → {user, roles, abilities, labels} | 401 si nadie está dentro
//   POST   /auth/sign-in        {email, password, remember}   → {second_step: {methods} | null}
//   POST   /auth/second-step    {method, code}                → 204   (method: totp | recovery_code)
//   GET    /auth/second-step/passkey-options                  → opciones de WebAuthn para firmar
//   POST   /auth/second-step/passkey   {credential}           → 204
//   POST   /auth/sign-out                                     → 204
//   POST   /auth/forgot-password       {email}                → 204 (igual exista o no el correo)
//   POST   /auth/reset-password        {token, new_password}  → 204
//   PUT    /account             {name, phone}                 → {message?}
//   PUT    /account/password    {current_password, new_password} → 204
//   GET    /account/security                                  → el estado de la verificación (abajo)
//   POST   /account/security/totp                             → {secret, qr_image_url}
//   POST   /account/security/totp/confirm      {code}         → {security, recovery_codes?}
//   DELETE /account/security/totp             {password}     → {security}
//   GET    /account/security/passkeys/registration-options    → opciones de WebAuthn para crear
//   POST   /account/security/passkeys          {name, credential} → {security, recovery_codes?}
//   DELETE /account/security/passkeys/{id}     {password}     → {security}
//   POST   /account/security/recovery-codes    {password}     → {security, recovery_codes}
//   GET    /account/sessions                                  → [{id, browser, platform, is_mobile, started_at, network, is_current}]
//   POST   /account/sessions/close-others                     → {closed}
//   GET    /account/activity                                  → [{id, kind, occurred_at, device, network}]
//
// El estado de la verificación: {is_enabled, enabled_at, passkeys: [{id, name, created_at, last_used_at}],
// totp: {is_enabled, enabled_at}, recovery_codes_remaining}. Las opciones y la firma de WebAuthn viajan tal cual (las arma
// y las revisa la librería del servidor: py_webauthn, @simplewebauthn/server, web-auth/webauthn-lib).
//
// Funciones puras, no renderizan: function (regla de la casa). Pruebas en restAccountConnector.test.js.

/** Las rutas del contrato; se pegan a la baseUrl del cliente (/api + /auth/session). */
export const ACCOUNT_REST_PATHS = Object.freeze({
    session: '/auth/session',
    signIn: '/auth/sign-in',
    secondStep: '/auth/second-step',
    secondStepPasskeyOptions: '/auth/second-step/passkey-options',
    secondStepPasskey: '/auth/second-step/passkey',
    signOut: '/auth/sign-out',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    profile: '/account',
    password: '/account/password',
    security: '/account/security',
    totp: '/account/security/totp',
    totpConfirm: '/account/security/totp/confirm',
    passkeyRegistrationOptions: '/account/security/passkeys/registration-options',
    passkeys: '/account/security/passkeys',
    recoveryCodes: '/account/security/recovery-codes',
    sessions: '/account/sessions',
    closeOtherSessions: '/account/sessions/close-others',
    activity: '/account/activity',
});

// cómo se llama cada método del segundo paso en el contrato (snake_case) y en las pantallas (SECOND_STEP_METHOD)
const SECOND_STEP_METHOD_IN_API = Object.freeze({passkey: 'passkey', totp: 'totp', recoveryCode: 'recovery_code'});
const SECOND_STEP_METHOD_FROM_API = Object.freeze({passkey: 'passkey', totp: 'totp', recovery_code: 'recoveryCode'});

/**
 * El estado de la verificación, del contrato a camelCase.
 *
 * @param {object} response
 * @returns {import('@/account/accountConnector.js').AccountSecurity}
 */
export function securityFromResponse(response) {
    return {
        isEnabled: Boolean(response.is_enabled),
        enabledAt: response.enabled_at ?? null,
        passkeys: (response.passkeys ?? []).map((passkey) => ({
            id: passkey.id, name: passkey.name, createdAt: passkey.created_at, lastUsedAt: passkey.last_used_at ?? null,
        })),
        totp: {isEnabled: Boolean(response.totp?.is_enabled), enabledAt: response.totp?.enabled_at ?? null},
        recoveryCodesRemaining: response.recovery_codes_remaining ?? 0,
    };
}

/**
 * Lo que regresa un cambio de seguridad: {security, recovery_codes?} → {security, recoveryCodes?}.
 *
 * @param {object} response
 * @returns {import('@/account/accountConnector.js').AccountSecurityChange}
 */
export function securityChangeFromResponse(response) {
    return {security: securityFromResponse(response.security), recoveryCodes: response.recovery_codes ?? undefined};
}

/**
 * @param {{get: Function, post: Function, put: Function, delete: Function}} apiClient el de createApiClient
 * @param {{paths?: Partial<Record<keyof typeof ACCOUNT_REST_PATHS, string>>}} [options] las rutas que se llaman distinto
 * @returns {import('@/account/accountConnector.js').AccountConnector}
 */
export function createRestAccountConnector(apiClient, {paths = {}} = {}) {
    const path = {...ACCOUNT_REST_PATHS, ...paths};

    return {
        loadSession: async () => {
            try {
                // sin el aviso de «sesión vencida»: aquí que no haya sesión es una respuesta normal
                return await apiClient.get(path.session, {skipUnauthenticatedHandler: true});
            } catch (error) {
                if (error?.isUnauthenticated) {
                    return null;
                }
                throw error;
            }
        },
        signIn: async ({email, password, remember}) => {
            const response = await apiClient.post(path.signIn, {email, password, remember}, {skipUnauthenticatedHandler: true});
            const methods = response?.second_step?.methods;
            return {secondStep: methods ? {methods: methods.map((method) => SECOND_STEP_METHOD_FROM_API[method] ?? method)} : null};
        },
        signInSecondStep: async ({method, code}) => {
            await apiClient.post(path.secondStep, {method: SECOND_STEP_METHOD_IN_API[method] ?? method, code}, {skipUnauthenticatedHandler: true});
        },
        secondStepPasskeyOptions: () => apiClient.get(path.secondStepPasskeyOptions, {skipUnauthenticatedHandler: true}),
        signInWithPasskey: async (credential) => {
            await apiClient.post(path.secondStepPasskey, {credential}, {skipUnauthenticatedHandler: true});
        },
        signOut: async () => {
            await apiClient.post(path.signOut, undefined, {skipUnauthenticatedHandler: true});
        },
        requestPasswordReset: async ({email}) => {
            await apiClient.post(path.forgotPassword, {email});
        },
        resetPassword: async ({token, newPassword}) => {
            await apiClient.post(path.resetPassword, {token, new_password: newPassword});
        },
        // todo lo del formulario viaja: name, phone y los campos propios de ProfileScreen (extraFields) con sus nombres
        updateProfile: async (profile) => (await apiClient.put(path.profile, profile)) ?? {},
        changePassword: async ({currentPassword, newPassword}) => {
            await apiClient.put(path.password, {current_password: currentPassword, new_password: newPassword});
        },
        loadSecurity: async () => securityFromResponse(await apiClient.get(path.security)),
        startTotp: async () => {
            const response = await apiClient.post(path.totp);
            return {secret: response.secret, qrImageUrl: response.qr_image_url ?? null};
        },
        confirmTotp: async (code) => securityChangeFromResponse(await apiClient.post(path.totpConfirm, {code})),
        disableTotp: async (password) => securityChangeFromResponse(await apiClient.delete(path.totp, {body: {password}})),
        passkeyRegistrationOptions: () => apiClient.get(path.passkeyRegistrationOptions),
        savePasskey: async ({name, credential}) => securityChangeFromResponse(await apiClient.post(path.passkeys, {name, credential})),
        removePasskey: async ({passkeyId, password}) => securityChangeFromResponse(
            await apiClient.delete(`${path.passkeys}/${encodeURIComponent(passkeyId)}`, {body: {password}}),
        ),
        regenerateRecoveryCodes: async (password) => securityChangeFromResponse(await apiClient.post(path.recoveryCodes, {password})),
        listSessions: async () => (await apiClient.get(path.sessions)).map((session) => ({
            id: session.id, browser: session.browser, platform: session.platform, isMobile: Boolean(session.is_mobile),
            startedAt: session.started_at, network: session.network, isCurrent: Boolean(session.is_current),
        })),
        closeOtherSessions: async () => (await apiClient.post(path.closeOtherSessions))?.closed ?? 0,
        listActivity: async () => (await apiClient.get(path.activity)).map((event) => ({
            id: event.id, kind: event.kind, occurredAt: event.occurred_at, device: event.device, network: event.network,
        })),
    };
}
