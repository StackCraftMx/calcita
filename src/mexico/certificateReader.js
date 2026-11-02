// Lo que dice el certificado (.cer) de una e.firma o de un sello digital del SAT, leído en el navegador sin subirlo: el RFC,
// la CURP, el nombre, el número de certificado y desde cuándo y hasta cuándo vale.
//
// Dónde lo pone el SAT en el certificado:
//   RFC        x500UniqueIdentifier (2.5.4.45): «RFC» o, en persona moral, «RFC de la empresa / RFC del representante»
//   CURP       serialNumber (2.5.4.5): «CURP» o « / CURP del representante» (la empresa no tiene)
//   nombre     commonName (2.5.4.3); la razón social también en organizationName (2.5.4.10)
//   número     el número de serie del certificado, que el SAT escribe con 20 dígitos en texto (30001000000400002434)
//   sucursal   organizationalUnitName (2.5.4.11): lo traen los sellos digitales (CSD), no la e.firma
//
// No revisa la firma del SAT ni descifra la llave (.key): eso es del servidor o de onVerifyKey en EfirmaFields.
//
// Puro (sin React): se prueba con node (certificateReader.test.js).
//
// Genérico del paquete: function (regla de la casa).
import {DER_TAG, derTextOf, derTimeOf, objectIdentifierOf, readDerNode} from '@/mexico/derReader.js';

// los nombres que se leen del certificado
const NAME_OIDS = Object.freeze({
    '2.5.4.3': 'commonName',
    '2.5.4.10': 'organizationName',
    '2.5.4.11': 'organizationalUnitName',
    '2.5.4.45': 'uniqueIdentifier',
    '2.5.4.5': 'serialNumber',
    '1.2.840.113549.1.9.1': 'email',
});
const IDENTIFIER_SEPARATOR = '/';
// el [0] explícito de la versión: si está, el número de serie es la segunda pieza
const EXPLICIT_VERSION_TAG = 0xa0;
const ASCII_DIGIT_ZERO = 0x30;
const ASCII_DIGIT_NINE = 0x39;

/**
 * Los nombres de un «Name» de X.509 (una lista de conjuntos de OID y valor), por su nombre de NAME_OIDS.
 *
 * @param {object} nameNode
 * @returns {Record<string, string>}
 */
function namesOf(nameNode) {
    const names = {};
    for (const relativeName of nameNode.children ?? []) {
        for (const attribute of relativeName.children ?? []) {
            const [oidNode, valueNode] = attribute.children ?? [];
            const key = NAME_OIDS[objectIdentifierOf(oidNode.content)];
            if (key && valueNode) {
                names[key] = derTextOf(valueNode).trim();
            }
        }
    }
    return names;
}

/**
 * El número de certificado como lo escribe el SAT: sus bytes son dígitos en texto. Si no lo son, en hexadecimal.
 *
 * @param {Uint8Array} serialBytes
 * @returns {string}
 */
function certificateNumberOf(serialBytes) {
    const isDigitText = serialBytes.length > 0 && serialBytes.every((byte) => byte >= ASCII_DIGIT_ZERO && byte <= ASCII_DIGIT_NINE);
    if (isDigitText) {
        return new TextDecoder('utf-8').decode(serialBytes);
    }
    return [...serialBytes].map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Las partes «propia / del representante» de un campo del SAT.
 *
 * @param {string|undefined} text
 * @returns {{own: string|null, representative: string|null}}
 */
function identifierPartsOf(text) {
    const [own = '', representative = ''] = (text ?? '').split(IDENTIFIER_SEPARATOR).map((part) => part.trim());
    return {own: own || null, representative: representative || null};
}

/**
 * Lee un certificado .cer (DER).
 *
 * @param {ArrayBuffer|Uint8Array} certificateBytes
 * @returns {{rfc: string|null, representativeRfc: string|null, curp: string|null, representativeCurp: string|null, name: string|null, organization: string|null, branch: string|null, email: string|null, certificateNumber: string, validFrom: string, validTo: string, issuer: string|null}}
 */
export function readCertificate(certificateBytes) {
    const bytes = certificateBytes instanceof Uint8Array ? certificateBytes : new Uint8Array(certificateBytes);
    const certificate = readDerNode(bytes);
    const toBeSigned = certificate.children?.[0];
    if (certificate.tag !== DER_TAG.sequence || toBeSigned?.tag !== DER_TAG.sequence) {
        throw new Error('El archivo no es un certificado');
    }
    const parts = toBeSigned.children;
    const firstIndex = parts[0].tag === EXPLICIT_VERSION_TAG ? 1 : 0;
    // número de serie, algoritmo, emisor, vigencia y titular, en ese orden
    const [serialNode, , issuerNode, validityNode, subjectNode] = parts.slice(firstIndex);
    const subject = namesOf(subjectNode);
    const issuer = namesOf(issuerNode);
    const rfcParts = identifierPartsOf(subject.uniqueIdentifier);
    const curpParts = identifierPartsOf(subject.serialNumber);

    return {
        rfc: rfcParts.own,
        representativeRfc: rfcParts.representative,
        curp: curpParts.own,
        representativeCurp: curpParts.representative,
        name: subject.commonName ?? null,
        organization: subject.organizationName ?? null,
        branch: subject.organizationalUnitName ?? null,
        email: subject.email ?? null,
        certificateNumber: certificateNumberOf(serialNode.content),
        validFrom: derTimeOf(validityNode.children[0]),
        validTo: derTimeOf(validityNode.children[1]),
        issuer: issuer.organizationName ?? issuer.commonName ?? null,
    };
}

/**
 * ¿En qué está el certificado en este momento?
 *
 * @param {{validFrom: string, validTo: string}} certificate
 * @param {number} [now] milisegundos (Date.now())
 * @returns {'notYetValid'|'valid'|'expired'}
 */
export function certificateStatusOf({validFrom, validTo}, now = Date.now()) {
    if (now < Date.parse(validFrom)) {
        return CERTIFICATE_STATUS.notYetValid;
    }
    return now > Date.parse(validTo) ? CERTIFICATE_STATUS.expired : CERTIFICATE_STATUS.valid;
}

/** En qué está un certificado: aún no vale, vale o ya venció. */
export const CERTIFICATE_STATUS = Object.freeze({notYetValid: 'notYetValid', valid: 'valid', expired: 'expired'});
