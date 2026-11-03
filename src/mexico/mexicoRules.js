// Las reglas de yup para el RFC, la CURP, la CLABE y el código postal, con sus mensajes en el idioma activo (validation:rfc,
// validation:curp, validation:clabe, validation:postalCode). Un campo vacío pasa: que sea obligatorio lo dice required().
// Cada mensaje lleva su regla: la pantalla (messages del campo) o los textos del proyecto pueden poner el suyo sin tocar el esquema.
//
//   Yup.object({rfc: Yup.string().required().test(rfcRule()), clabe: Yup.string().test(clabeRule())})
//
// Son objetos de .test() y no un Yup propio: el proyecto usa su copia de yup y aquí no se importa.
//
// Genérico del paquete: function (regla de la casa).
import {ruleMessageOf} from '@/forms/validationMessages.js';
import {isValidClabe, isValidCurp, isValidPostalCode, isValidRfc} from '@/mexico/mexicoIdentifiers.js';

/**
 * @param {{strict?: boolean}} [options] strict: también el dígito verificador (ver isValidRfc)
 * @returns {{name: string, message: {key: string, values: object, rule: string}, test: (value: unknown) => boolean}}
 */
export function rfcRule({strict = false} = {}) {
    return {name: 'rfc', message: ruleMessageOf('validation:rfc', 'rfc'), test: (value) => !value || isValidRfc(String(value), {strict})};
}

/** @returns {{name: string, message: {key: string, values: object, rule: string}, test: (value: unknown) => boolean}} */
export function curpRule() {
    return {name: 'curp', message: ruleMessageOf('validation:curp', 'curp'), test: (value) => !value || isValidCurp(String(value))};
}

/** @returns {{name: string, message: {key: string, values: object, rule: string}, test: (value: unknown) => boolean}} */
export function clabeRule() {
    return {name: 'clabe', message: ruleMessageOf('validation:clabe', 'clabe'), test: (value) => !value || isValidClabe(String(value))};
}

/** @returns {{name: string, message: {key: string, values: object, rule: string}, test: (value: unknown) => boolean}} */
export function postalCodeRule() {
    return {name: 'postalCode', message: ruleMessageOf('validation:postalCode', 'postalCode'), test: (value) => !value || isValidPostalCode(String(value))};
}
