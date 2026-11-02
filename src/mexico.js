// México (@stackcraftmx/calcita/mexico): las claves que se escriben en casi cualquier sistema (RFC, CURP, CLABE) con su
// dígito verificador y sus reglas de yup, la e.firma (el .cer se lee en el navegador y la llave se abre con su contraseña,
// también en el navegador) y la factura electrónica (CFDI 3.3 y 4.0) leída del XML. Son estándares nacionales del SAT,
// RENAPO y Banxico, no reglas de un cliente. El certificado y el XML se leen con lo que trae el paquete; abrir la llave pide
// jsrsasign (3DES, que el navegador no trae), que se baja hasta que se usa.
//
//   isValidRfc('SAT970701NN3') · Yup.string().test(clabeRule()) · readCfdi(xmlText) · <EfirmaFields onVerifyKey={api.verifyEfirma} />
export {
    RFC_KIND, clabeCheckDigitOf, curpCheckDigitOf, isValidClabe, isValidCurp, isValidRfc, rfcCheckDigitOf, rfcKindOf,
} from '@/mexico/mexicoIdentifiers.js';
export {clabeRule, curpRule, rfcRule} from '@/mexico/mexicoRules.js';
export {CERTIFICATE_STATUS, certificateStatusOf, readCertificate} from '@/mexico/certificateReader.js';
export {CFDI_VOUCHER_TYPE, readCfdi, readCfdiFile} from '@/mexico/cfdiReader.js';
export {EFIRMA_KEY_PROBLEM, EfirmaKeyError, verifyEfirmaKey} from '@/mexico/efirmaKey.js';
export {default as CfdiSummary} from '@/mexico/CfdiSummary.jsx';
export {default as EfirmaFields} from '@/mexico/EfirmaFields.jsx';

/** Una factura leída (lo que regresa readCfdi). @typedef {import('@/mexico/cfdiReader.js').Cfdi} Cfdi */
/** Un certificado leído (lo que regresa readCertificate). @typedef {ReturnType<typeof import('@/mexico/certificateReader.js').readCertificate>} EfirmaCertificate */
