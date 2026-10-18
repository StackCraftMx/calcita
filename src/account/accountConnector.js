// El conector de la cuenta: lo ÚNICO que un proyecto escribe para tener entrar (con su segundo paso), «¿Olvidó su
// contraseña?», elegir una contraseña nueva, Mi perfil y su seguridad (@stackcraftmx/calcita/account). Las pantallas solo
// llaman estas funciones; cada una habla con el backend del proyecto.
//
// Tres formas de tenerlo:
//   - createRestAccountConnector(apiClient): si el backend sigue el contrato REST (restAccountConnector.js), ya está;
//   - createDemoAccountConnector() de @stackcraftmx/calcita/account-demo: todo en la memoria del navegador, para arrancar
//     sin backend;
//   - uno propio: un objeto con estas funciones, o el REST con las que no coincidan cambiadas ({...rest, signIn: …}).
//
// Cada función regresa una promesa y, si el servidor dice que no, truena con un ApiError (RFC 9457): la pantalla enseña su
// mensaje, y lo de cada campo en su campo. Las llaves van en camelCase: la traducción desde el backend va en el conector.
//
// Funciones puras, no renderizan: function (regla de la casa). Pruebas en accountConnector.test.js.

/**
 * Quien está dentro, como lo pintan la barra y Mi perfil.
 *
 * @typedef {object} AccountUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [subtitle] el renglón bajo el nombre (puesto · sucursal)
 * @property {string} [phone]
 * @property {string} [avatarUrl]
 */

/**
 * La sesión: quién está dentro y sus permisos (los lee createAccessChecker).
 *
 * @typedef {object} AccountSession
 * @property {AccountUser} user
 * @property {string[]} [roles]
 * @property {string[]} [abilities]
 * @property {string[]} [labels] sus perfiles o etiquetas, ya traducidos (salen como chips en Mi perfil)
 */

/**
 * El estado de la verificación en dos pasos (el que pinta TwoStepVerificationCard).
 *
 * @typedef {object} AccountSecurity
 * @property {boolean} isEnabled
 * @property {string|null} [enabledAt]
 * @property {Array<{id: string, name: string, createdAt: string, lastUsedAt?: string|null}>} passkeys
 * @property {{isEnabled: boolean, enabledAt?: string|null}} totp
 * @property {number} recoveryCodesRemaining
 */

/**
 * Lo que regresa un cambio de seguridad: el estado nuevo y, si se generaron, los códigos de recuperación (se enseñan una
 * sola vez).
 *
 * @typedef {object} AccountSecurityChange
 * @property {AccountSecurity} security
 * @property {string[]} [recoveryCodes]
 */

/**
 * Un equipo donde la cuenta está abierta.
 *
 * @typedef {object} AccountDeviceSession
 * @property {string} id
 * @property {string|null} [browser]
 * @property {string|null} [platform]
 * @property {boolean} [isMobile]
 * @property {string} startedAt instante ISO
 * @property {string|null} [network] a medias (187.190.x.x), nunca la IP completa
 * @property {boolean} [isCurrent]
 */

/**
 * Un renglón de la bitácora de la cuenta.
 *
 * @typedef {object} AccountEvent
 * @property {string} id
 * @property {string} kind uno de ACCOUNT_EVENT_KIND
 * @property {string} occurredAt instante ISO
 * @property {string|null} [device]
 * @property {string|null} [network]
 */

/**
 * El conector completo.
 *
 * @typedef {object} AccountConnector
 * @property {() => Promise<AccountSession|null>} loadSession quién está dentro; null si nadie
 * @property {(credentials: {email: string, password: string, remember: boolean}) => Promise<{secondStep: {methods: string[]}|null}>} signIn
 *     con verificación en dos pasos regresa los métodos del segundo paso (SECOND_STEP_METHOD); sin ella, secondStep null
 *     y ya está dentro
 * @property {(input: {method: string, code: string}) => Promise<void>} signInSecondStep el código de la app (totp) o uno
 *     de recuperación (recoveryCode)
 * @property {() => Promise<object>} secondStepPasskeyOptions las opciones de WebAuthn para firmar (JSON del servidor)
 * @property {(credential: any) => Promise<void>} signInWithPasskey la firma del navegador (JSON de WebAuthn)
 * @property {() => Promise<void>} signOut
 * @property {(input: {email: string}) => Promise<void>} requestPasswordReset contesta igual exista o no el correo
 * @property {(input: {token: string, newPassword: string}) => Promise<void>} resetPassword desde el enlace del correo
 * @property {(input: {name: string, phone: string} & Record<string, any>) => Promise<{message?: string}|void>} updateProfile name, phone y
 *     los campos propios de ProfileScreen (extraFields)
 * @property {(input: {currentPassword?: string, newPassword: string}) => Promise<void>} changePassword
 * @property {() => Promise<AccountSecurity>} loadSecurity
 * @property {() => Promise<{secret: string, qrImageUrl?: string|null}>} startTotp una clave nueva (todavía sin activar)
 * @property {(code: string) => Promise<AccountSecurityChange>} confirmTotp
 * @property {(password: string) => Promise<AccountSecurityChange>} disableTotp
 * @property {() => Promise<object>} passkeyRegistrationOptions las opciones de WebAuthn para crear una llave
 * @property {(input: {name: string, credential: any}) => Promise<AccountSecurityChange>} savePasskey
 * @property {(input: {passkeyId: string, password: string}) => Promise<AccountSecurityChange>} removePasskey
 * @property {(password: string) => Promise<AccountSecurityChange>} regenerateRecoveryCodes
 * @property {() => Promise<AccountDeviceSession[]>} listSessions
 * @property {() => Promise<number>} closeOtherSessions cuántas cerró
 * @property {() => Promise<AccountEvent[]>} listActivity de lo más nuevo a lo más viejo
 * @property {() => Promise<string|null>} [demoTotpCode] SOLO en la demostración: el código que enseñaría la app ahorita
 *     (con él sale el botón «Usar el código de ejemplo»)
 */

/** Las funciones que todo conector trae (demoTotpCode es opcional: solo la demostración). */
export const ACCOUNT_CONNECTOR_FUNCTIONS = Object.freeze([
    'loadSession', 'signIn', 'signInSecondStep', 'secondStepPasskeyOptions', 'signInWithPasskey', 'signOut', 'requestPasswordReset',
    'resetPassword', 'updateProfile', 'changePassword', 'loadSecurity', 'startTotp', 'confirmTotp', 'disableTotp',
    'passkeyRegistrationOptions', 'savePasskey', 'removePasskey', 'regenerateRecoveryCodes', 'listSessions', 'closeOtherSessions',
    'listActivity',
]);

/**
 * Las funciones que le faltan al conector (un error de quien lo escribió: se avisa al arrancar, no al picar un botón).
 *
 * @param {object|null|undefined} connector
 * @returns {string[]}
 */
export function missingConnectorFunctionsOf(connector) {
    return ACCOUNT_CONNECTOR_FUNCTIONS.filter((name) => typeof connector?.[name] !== 'function');
}
