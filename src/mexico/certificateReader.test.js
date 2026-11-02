// Pruebas de la lectura del certificado (.cer). Sin navegador: pnpm test. El certificado es de mentira, hecho con openssl con
// la forma de una e.firma de persona moral (RFC genérico de pruebas del SAT y una CURP inventada).
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {CERTIFICATE_STATUS, certificateStatusOf, readCertificate} from '@/mexico/certificateReader.js';

const SAMPLE_CERTIFICATE = Buffer.from('MIIDrzCCApcCFDMwMDAxMDAwMDAwNDAwMDAyNDM0MA0GCSqGSIb3DQEBCwUAMIGTMSQwIgYDVQQDDBtFTVBSRVNBIERFIEVKRU1QTE8gU0EgREUgQ1YxJDAiBgNVBAoMG0VNUFJFU0EgREUgRUpFTVBMTyBTQSBERSBDVjElMCMGA1UELQwcQUFBMDEwMTAxQUFBIC8gWEFYWDAxMDEwMTAwMDEeMBwGA1UEBRMVIC8gTUFQQTg1MDEwMUhERlJSTjAzMB4XDTI2MTEwMjA0NTYzMFoXDTMwMTEwMjA0NTYzMFowgZMxJDAiBgNVBAMMG0VNUFJFU0EgREUgRUpFTVBMTyBTQSBERSBDVjEkMCIGA1UECgwbRU1QUkVTQSBERSBFSkVNUExPIFNBIERFIENWMSUwIwYDVQQtDBxBQUEwMTAxMDFBQUEgLyBYQVhYMDEwMTAxMDAwMR4wHAYDVQQFExUgLyBNQVBBODUwMTAxSERGUlJOMDMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDekDEBO432EAsm+C50fDYoRjUHxkZ4IifCFdBNvdTDJp0dnvn2sme5qL33AFmar7cP1S4E2K4vhL8VB6hv6/UQHCXlcc8YY11ZjerZIBcrckwALpq6KvIX4wUAMEYxGVDXCJQ6GM6EhkrXqpsdRN8HLSc7MiAvBelyESmwQG/QxSq90sj1HdtOUOMux5Y9XGlgWFlUD60LHFm+1ZVlXkgp5pp2iIrioqCAFg+PKwA5Rl/LhbUy7YRiocRiEfOtZS2dPjV9y6xF9hzuEHfaJUEewAZ3KJIe62hON3rjJYtvOZkd8yWXOmwknOluM79tR54KFwqIpHtO0UlUfs3uj/qNAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAM0TKg3AmZWaSaInoFinbN/hs/KT+zXqd3NEl2Aj1bzHry3EKJ0Vof40ERsQeW6R9NgIaIkyzBqI9qQBBQzslLXzWJVEZw8pO7PNLMEOCPlIH167Swouii0nN3OZYOKEHYihEN37GvTydkHcbHntLw6P548MPF945i1r0V0Sqf7/whPlqRQWYURNIOi9XhtJIbyX9XyCiEt0H78GyU5gQh8iXLT0np8wMLBcIF6rTTfJGhGBXP7CmquziTyfgmg3SP+1q6lOpi13ZKO0jbsPJRKn0pCg1hK8gXqtsNeKyixApose9IHgcqoi2xvkySCl0++9Cxx5gjQqhzbsZIATo5E=', 'base64');

test('lee el RFC de la empresa y el del representante, su CURP, el nombre y el número de certificado', () => {
    const certificate = readCertificate(new Uint8Array(SAMPLE_CERTIFICATE));
    assert.equal(certificate.rfc, 'AAA010101AAA');
    assert.equal(certificate.representativeRfc, 'XAXX010101000');
    assert.equal(certificate.curp, null);
    assert.equal(certificate.representativeCurp, 'MAPA850101HDFRRN03');
    assert.equal(certificate.name, 'EMPRESA DE EJEMPLO SA DE CV');
    assert.equal(certificate.certificateNumber, '30001000000400002434');
    assert.equal(certificate.branch, null);
});

test('la vigencia y en qué está', () => {
    const certificate = readCertificate(SAMPLE_CERTIFICATE.buffer.slice(SAMPLE_CERTIFICATE.byteOffset, SAMPLE_CERTIFICATE.byteOffset + SAMPLE_CERTIFICATE.length));
    assert.match(certificate.validFrom, /^\d{4}-\d{2}-\d{2}T/);
    assert.ok(Date.parse(certificate.validTo) > Date.parse(certificate.validFrom));
    assert.equal(certificateStatusOf(certificate, Date.parse(certificate.validFrom) - 1), CERTIFICATE_STATUS.notYetValid);
    assert.equal(certificateStatusOf(certificate, Date.parse(certificate.validFrom) + 1), CERTIFICATE_STATUS.valid);
    assert.equal(certificateStatusOf(certificate, Date.parse(certificate.validTo) + 1), CERTIFICATE_STATUS.expired);
});

test('un archivo que no es certificado truena con su motivo', () => {
    assert.throws(() => readCertificate(new TextEncoder().encode('esto no es un certificado')), /no es un certificado/);
});
