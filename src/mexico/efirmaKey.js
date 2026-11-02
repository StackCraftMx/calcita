// Abrir la llave privada (.key) de una e.firma con su contraseña y comprobar que es la del certificado (.cer), en el
// navegador y sin mandar nada a ningún lado.
//
// Va con jsrsasign porque la llave del SAT viene cifrada (PKCS#8 con PBES2 y 3DES) y el navegador no trae 3DES. Se carga
// hasta que se usa (import dinámico): la pantalla no la baja al abrir, solo al picar «Revisar».
//
// Los motivos de un «no» se distinguen (EFIRMA_KEY_PROBLEM): el archivo no es una llave, la contraseña no la abre, o la
// llave abre pero es de otro certificado.
//
// Genérico del paquete: function (regla de la casa). Pruebas en efirmaKey.test.js.
import {objectIdentifierOf, readDerNode} from '@/mexico/derReader.js';

/** Por qué no pasó la llave. */
export const EFIRMA_KEY_PROBLEM = Object.freeze({notKey: 'notKey', wrongPassword: 'wrongPassword', otherCertificate: 'otherCertificate'});

// el algoritmo con que se cifra una llave PKCS#8 (PBES2): así empieza un .key del SAT
const PBES2_OBJECT_IDENTIFIER = '1.2.840.113549.1.5.13';
const HEXADECIMAL_RADIX = 16;

/** Un «no» de la llave, con su motivo (reason es uno de EFIRMA_KEY_PROBLEM). */
export class EfirmaKeyError extends Error {
    /**
     * @param {string} reason EFIRMA_KEY_PROBLEM
     */
    constructor(reason) {
        super(`La e.firma no pasó: ${reason}`);
        this.name = 'EfirmaKeyError';
        this.reason = reason;
    }
}

/**
 * Los bytes como texto hexadecimal (lo que pide jsrsasign).
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function hexOf(bytes) {
    return Array.from(bytes, (byte) => byte.toString(HEXADECIMAL_RADIX).padStart(2, '0')).join('');
}

/**
 * ¿Los bytes son una llave PKCS#8 cifrada con PBES2? (sin abrirla)
 *
 * @param {Uint8Array} keyBytes
 * @returns {boolean}
 */
function isEncryptedPrivateKey(keyBytes) {
    try {
        const algorithm = readDerNode(keyBytes).children?.[0]?.children?.[0];
        return Boolean(algorithm) && objectIdentifierOf(algorithm.content) === PBES2_OBJECT_IDENTIFIER;
    } catch {
        return false;
    }
}

/**
 * Abre la llave con la contraseña y la compara con el certificado. Si todo está bien no regresa nada; si no, truena con
 * EfirmaKeyError y su motivo.
 *
 * @param {{certificateBytes: ArrayBuffer|Uint8Array, keyBytes: ArrayBuffer|Uint8Array, password: string}} efirma
 * @returns {Promise<void>}
 */
export async function verifyEfirmaKey({certificateBytes, keyBytes, password}) {
    const key = keyBytes instanceof Uint8Array ? keyBytes : new Uint8Array(keyBytes);
    const certificate = certificateBytes instanceof Uint8Array ? certificateBytes : new Uint8Array(certificateBytes);
    if (!isEncryptedPrivateKey(key)) {
        throw new EfirmaKeyError(EFIRMA_KEY_PROBLEM.notKey);
    }
    // jsrsasign se publica como CommonJS: según el empaquetador llega en default o suelta
    const jsrsasignModule = await import('jsrsasign');
    const {KEYUTIL, KJUR, X509} = jsrsasignModule.default ?? jsrsasignModule;

    let privateKey;
    try {
        privateKey = KEYUTIL.getKey(KJUR.asn1.ASN1Util.getPEMStringFromHex(hexOf(key), 'ENCRYPTED PRIVATE KEY'), password);
    } catch {
        // con otra contraseña el descifrado da basura y jsrsasign no la reconoce como llave
        throw new EfirmaKeyError(EFIRMA_KEY_PROBLEM.wrongPassword);
    }
    const x509 = new X509();
    x509.readCertHex(hexOf(certificate));
    // la llave es la del certificado si su módulo RSA es el mismo que el de la llave pública del certificado
    if (!x509.getPublicKey().n?.equals(privateKey.n)) {
        throw new EfirmaKeyError(EFIRMA_KEY_PROBLEM.otherCertificate);
    }
}
