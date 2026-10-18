// Los códigos de 6 dígitos de una app autenticadora (TOTP, RFC 6238): los mismos que calcula Google Authenticator con la
// clave que se escaneó. En un proyecto real esto lo hace el servidor (pyotp, otplib, spomky-labs/otphp); aquí lo usa el
// conector de demostración (y el servidor de mentira de los ejemplos) para que la verificación funcione con la app de verdad.
//
// El código sale de la clave y de la hora: HMAC-SHA1 de los «pasos» de 30 segundos desde 1970, recortado a 6 dígitos.
// Al revisar se acepta el paso de antes y el de después: el reloj del teléfono puede ir unos segundos desfasado.
//
// Funciones puras con crypto.subtle (navegador y node): function (regla de la casa).

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const CODE_DIGITS = 6;
// cuántos pasos de diferencia se aceptan al revisar (el de antes y el de después)
const ACCEPTED_DRIFT_STEPS = 1;
const SECRET_BYTES = 20;

/**
 * Bytes → base32 (la clave como la escribe la persona en su app).
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function base32Of(bytes) {
    let bits = '';
    for (const byte of bytes) {
        bits += byte.toString(2).padStart(8, '0');
    }
    let text = '';
    for (let start = 0; start < bits.length; start += 5) {
        text += BASE32_ALPHABET[parseInt(bits.slice(start, start + 5).padEnd(5, '0'), 2)];
    }
    return text;
}

/**
 * Base32 → bytes (sin espacios ni relleno).
 *
 * @param {string} text
 * @returns {Uint8Array}
 */
export function bytesOfBase32(text) {
    const bits = text.replace(/[\s=]/g, '').toUpperCase().split('')
        .map((character) => BASE32_ALPHABET.indexOf(character).toString(2).padStart(5, '0')).join('');
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = parseInt(bits.slice(index * 8, index * 8 + 8), 2);
    }
    return bytes;
}

/** Una clave nueva al azar, en base32. */
export function newTotpSecret() {
    return base32Of(crypto.getRandomValues(new Uint8Array(SECRET_BYTES)));
}

/**
 * El código de un paso de 30 segundos.
 *
 * @param {string} secret la clave en base32
 * @param {number} step los pasos de 30 segundos desde 1970
 * @param {number} [digits]
 * @returns {Promise<string>}
 */
async function codeOfStep(secret, step, digits = CODE_DIGITS) {
    const counter = new ArrayBuffer(8);
    new DataView(counter).setBigUint64(0, BigInt(step));
    const key = await crypto.subtle.importKey('raw', bytesOfBase32(secret), {name: 'HMAC', hash: 'SHA-1'}, false, ['sign']);
    const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', key, counter));
    // el recorte del RFC: 4 bytes desde la posición que dicen los últimos 4 bits
    const offset = hmac[hmac.length - 1] & 0x0f;
    const number = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
    return String(number % 10 ** digits).padStart(digits, '0');
}

/**
 * El código que enseña la app en ese momento.
 *
 * @param {string} secret la clave en base32
 * @param {number} [timeMilliseconds] por omisión, ahora
 * @param {number} [digits]
 * @returns {Promise<string>}
 */
export function totpCodeAt(secret, timeMilliseconds = Date.now(), digits = CODE_DIGITS) {
    return codeOfStep(secret, Math.floor(timeMilliseconds / 1000 / STEP_SECONDS), digits);
}

/**
 * ¿El código es el de ahora (o el de un paso antes o después)?
 *
 * @param {string} secret
 * @param {string} code los 6 dígitos
 * @param {number} [timeMilliseconds]
 * @returns {Promise<boolean>}
 */
export async function isValidTotpCode(secret, code, timeMilliseconds = Date.now()) {
    const currentStep = Math.floor(timeMilliseconds / 1000 / STEP_SECONDS);
    for (let drift = -ACCEPTED_DRIFT_STEPS; drift <= ACCEPTED_DRIFT_STEPS; drift += 1) {
        if (await codeOfStep(secret, currentStep + drift) === code) {
            return true;
        }
    }
    return false;
}

/**
 * La dirección otpauth:// que va en el QR: la app la lee y guarda la cuenta con su clave.
 *
 * @param {{secret: string, account: string, issuer: string}} details
 * @returns {string}
 */
export function otpauthUrlOf({secret, account, issuer}) {
    const label = encodeURIComponent(`${issuer}:${account}`);
    return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=${CODE_DIGITS}&period=${STEP_SECONDS}`;
}
