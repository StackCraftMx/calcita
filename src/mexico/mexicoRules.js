// Las reglas de yup para el RFC, la CURP y la CLABE, con sus mensajes en el idioma activo (validation:rfc, validation:curp,
// validation:clabe). Un campo vacío pasa: que sea obligatorio lo dice required().
//
//   Yup.object({rfc: Yup.string().required().test(rfcRule()), clabe: Yup.string().test(clabeRule())})
//
// Son objetos de .test() y no un Yup propio: el proyecto usa su copia de yup y aquí no se importa.
//
// Genérico del paquete: function (regla de la casa).
import {isValidClabe, isValidCurp, isValidRfc} from '@/mexico/mexicoIdentifiers.js';

/**
 * @param {{strict?: boolean}} [options] strict: también el dígito verificador (ver isValidRfc)
 * @returns {{name: string, message: {key: string}, test: (value: unknown) => boolean}}
 */
export function rfcRule({strict = false} = {}) {
    return {name: 'rfc', message: {key: 'validation:rfc'}, test: (value) => !value || isValidRfc(String(value), {strict})};
}

/** @returns {{name: string, message: {key: string}, test: (value: unknown) => boolean}} */
export function curpRule() {
    return {name: 'curp', message: {key: 'validation:curp'}, test: (value) => !value || isValidCurp(String(value))};
}

/** @returns {{name: string, message: {key: string}, test: (value: unknown) => boolean}} */
export function clabeRule() {
    return {name: 'clabe', message: {key: 'validation:clabe'}, test: (value) => !value || isValidClabe(String(value))};
}
