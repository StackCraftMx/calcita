// Las reglas de los códigos y la contraseña de la verificación en dos pasos, aparte para probarlas sin navegador.
//
// Los topes son la forma del código con su separador: «123 456» son 7 y «ABCDE-FGHJK» son 11. Antes de mandarlo al
// servidor se le quitan los espacios (el de la app) y se deja en mayúsculas (el de recuperación).
//
// Funciones puras, no renderizan: function (regla de la casa).

export const TOTP_CODE_MIN_LENGTH = 6;
export const TOTP_CODE_MAX_LENGTH = 7;
export const RECOVERY_CODE_MIN_LENGTH = 10;
export const RECOVERY_CODE_MAX_LENGTH = 11;
export const PASSKEY_NAME_MAX_LENGTH = 60;
// la contraseña actual no lleva mínimo: es la que ya tiene; solo el tope para no mandar textos enormes
export const CURRENT_PASSWORD_MAX_LENGTH = 128;

/** «123456» o «123 456». */
export const TOTP_CODE_PATTERN = /^\d{3}\s?\d{3}$/;
/** «ABCDE-FGHJK» o «ABCDEFGHJK». */
export const RECOVERY_CODE_PATTERN = /^[A-Za-z0-9]{5}-?[A-Za-z0-9]{5}$/;

/**
 * El código de la app como lo espera el servidor: los 6 dígitos sin espacios.
 *
 * @param {string} code
 * @returns {string}
 */
export function normalizeTotpCode(code) {
    return String(code ?? '').replace(/\s/g, '');
}

/**
 * El código de recuperación como lo espera el servidor: en mayúsculas y con su guion (ABCDE-FGHJK).
 *
 * @param {string} code
 * @returns {string}
 */
export function normalizeRecoveryCode(code) {
    const compact = String(code ?? '').replace(/[\s-]/g, '').toUpperCase();
    return compact.length === RECOVERY_CODE_MIN_LENGTH ? `${compact.slice(0, 5)}-${compact.slice(5)}` : compact;
}
