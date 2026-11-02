// Lo mínimo para leer un archivo DER (el formato binario de los certificados .cer): cada pieza es etiqueta, largo y
// contenido, y las que agrupan (SEQUENCE, SET) traen piezas adentro. No valida firmas ni descifra nada: solo lee.
//
// Lo usa certificateReader.js para sacar del .cer de la e.firma el RFC, el nombre, el número de certificado y la vigencia.
// Va aquí en lugar de una librería (las de certificados pesan cientos de kB) porque leer es poco: lo que cuesta es descifrar
// la llave, y eso no se hace aquí.
//
// Puro (sin React): se prueba con node junto con certificateReader.test.js.
//
// Genérico del paquete: function (regla de la casa).

/** Las etiquetas DER que se leen. */
export const DER_TAG = Object.freeze({
    integer: 0x02,
    objectIdentifier: 0x06,
    utf8String: 0x0c,
    printableString: 0x13,
    teletexString: 0x14,
    ia5String: 0x16,
    utcTime: 0x17,
    generalizedTime: 0x18,
    bmpString: 0x1e,
    sequence: 0x30,
    set: 0x31,
});
// el bit que dice que la pieza agrupa otras (SEQUENCE, SET, los [0] explícitos)
const CONSTRUCTED_BIT = 0x20;
// el bit alto del primer byte del largo: los siguientes N bytes dicen el largo
const LONG_LENGTH_BIT = 0x80;
const LOW_SEVEN_BITS = 0x7f;
const OID_BASE = 128;
const OID_FIRST_ARC_DIVISOR = 40;

/**
 * Una pieza DER y, si agrupa otras, sus piezas.
 *
 * @param {Uint8Array} bytes
 * @param {number} [offset]
 * @returns {{tag: number, content: Uint8Array, end: number, children: Array<object>|null}}
 */
export function readDerNode(bytes, offset = 0) {
    const tag = bytes[offset];
    let length = bytes[offset + 1];
    let contentStart = offset + 2;
    if (length & LONG_LENGTH_BIT) {
        const lengthBytes = length & LOW_SEVEN_BITS;
        length = 0;
        for (let index = 0; index < lengthBytes; index += 1) {
            length = (length * 256) + bytes[contentStart + index];
        }
        contentStart += lengthBytes;
    }
    const end = contentStart + length;
    if (tag === undefined || end > bytes.length) {
        throw new Error('El archivo no es un certificado: se cortó a media pieza');
    }
    const content = bytes.subarray(contentStart, end);
    let children = null;
    if (tag & CONSTRUCTED_BIT) {
        children = [];
        for (let childOffset = 0; childOffset < content.length;) {
            const child = readDerNode(content, childOffset);
            children.push(child);
            childOffset = child.end;
        }
    }
    return {tag, content, end, children};
}

/**
 * Un identificador de objeto (OID) como se escribe: '2.5.4.45'.
 *
 * @param {Uint8Array} content
 * @returns {string}
 */
export function objectIdentifierOf(content) {
    const arcs = [Math.floor(content[0] / OID_FIRST_ARC_DIVISOR), content[0] % OID_FIRST_ARC_DIVISOR];
    let value = 0;
    for (const byte of content.subarray(1)) {
        value = (value * OID_BASE) + (byte & LOW_SEVEN_BITS);
        if (!(byte & LONG_LENGTH_BIT)) {
            arcs.push(value);
            value = 0;
        }
    }
    return arcs.join('.');
}

/**
 * El texto de una pieza de texto (UTF-8, imprimible, latin-1 o UTF-16 de los nombres con acentos).
 *
 * @param {{tag: number, content: Uint8Array}} node
 * @returns {string}
 */
export function derTextOf({tag, content}) {
    if (tag === DER_TAG.bmpString) {
        return new TextDecoder('utf-16be').decode(content);
    }
    if (tag === DER_TAG.teletexString) {
        return new TextDecoder('latin1').decode(content);
    }
    return new TextDecoder('utf-8').decode(content);
}

/**
 * Una fecha de certificado como instante ISO: UTCTime 'AAMMDDhhmmssZ' (de 1950 a 2049) o GeneralizedTime 'AAAAMMDDhhmmssZ'.
 *
 * @param {{tag: number, content: Uint8Array}} node
 * @returns {string} '2030-11-02T04:56:30.000Z'
 */
export function derTimeOf(node) {
    const text = derTextOf(node);
    const fullYearText = node.tag === DER_TAG.utcTime
        ? `${Number(text.slice(0, 2)) < 50 ? '20' : '19'}${text}`
        : text;
    const [year, month, day, hour, minute, second] = [0, 4, 6, 8, 10, 12].map((start, index) => Number(fullYearText.slice(start, index === 0 ? 4 : start + 2)));
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second)).toISOString();
}
