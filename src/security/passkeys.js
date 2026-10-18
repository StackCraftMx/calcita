// Llaves de acceso (passkeys, WebAuthn) desde el navegador: crear una con la huella, el rostro o el PIN del equipo, y
// firmar con ella el reto del servidor para entrar. Envuelve @simplewebauthn/browser, que habla el mismo JSON (base64url)
// que las librerías de servidor (py_webauthn, @simplewebauthn/server, web-auth/webauthn-lib de PHP), y traduce sus errores
// a lo que una persona entiende.
//
// El servidor pone las reglas: arma las opciones (el reto, quién es el sitio, qué llaves acepta) y revisa la respuesta.
// Aquí solo se habla con el navegador; quien llama trae las opciones y manda la respuesta.
//
//   const credential = await createPasskey(await api.get('/security/passkeys/registration-options'));
//   await api.post('/security/passkeys', {name, credential});
//
// Si la persona cancela (cerró el aviso del sistema o no eligió ninguna llave), el error trae cancelled: true y no hay nada
// que enseñar.
//
// Funciones que no renderizan: function (regla de la casa).
import {browserSupportsWebAuthn, startAuthentication, startRegistration} from '@simplewebauthn/browser';

import {translateToolkit} from '@/toolkit/toolkitSettings.js';

// el nombre del error del navegador → el texto para la persona (namespace security, passkeys.*)
const MESSAGE_KEY_BY_ERROR_NAME = Object.freeze({
    // canceló, se venció el tiempo o no eligió ninguna llave
    NotAllowedError: 'cancelled',
    AbortError: 'cancelled',
    InvalidStateError: 'alreadyRegistered',
    // la página no está en la dirección para la que el servidor arma las llaves
    SecurityError: 'wrongDomain',
});
const CANCELLED_KEY = 'cancelled';

/** ¿El navegador sabe usar llaves de acceso? */
export function passkeysSupported() {
    return browserSupportsWebAuthn();
}

/**
 * El error del navegador en palabras de la persona, con cancelled: true si solo canceló.
 *
 * @param {unknown} error
 * @returns {Error & {cancelled: boolean}}
 */
function explainPasskeyError(error) {
    const errorName = error?.name === 'WebAuthnError' ? error?.cause?.name : (error?.name ?? error?.cause?.name);
    const messageKey = MESSAGE_KEY_BY_ERROR_NAME[errorName] ?? 'failed';
    return Object.assign(new Error(translateToolkit('security', `passkeys.${messageKey}`)), {cancelled: messageKey === CANCELLED_KEY, cause: error});
}

/**
 * Crea una llave de acceso nueva con las opciones del servidor. Regresa lo que hay que mandarle para que la guarde.
 *
 * @param {object} options las opciones de registro del servidor (PublicKeyCredentialCreationOptionsJSON)
 * @returns {Promise<object>} la respuesta del navegador (RegistrationResponseJSON)
 * @throws {Error & {cancelled: boolean}} con el mensaje ya traducido
 */
export async function createPasskey(options) {
    try {
        return await startRegistration({optionsJSON: options});
    } catch (error) {
        throw explainPasskeyError(error);
    }
}

/**
 * Firma el reto del servidor con una llave. Sin allowCredentials en las opciones, el navegador ofrece las que tenga.
 *
 * @param {object} options las opciones de entrada del servidor (PublicKeyCredentialRequestOptionsJSON)
 * @returns {Promise<object>} la respuesta del navegador (AuthenticationResponseJSON)
 * @throws {Error & {cancelled: boolean}} con el mensaje ya traducido
 */
export async function signWithPasskey(options) {
    try {
        return await startAuthentication({optionsJSON: options});
    } catch (error) {
        throw explainPasskeyError(error);
    }
}
