// Reglas de yup para un campo, con sus mensajes en el idioma activo:
//
//   sameAsFieldRule('password', {otherLabel: 'la contraseña'})   igual a otro campo («Confirme la contraseña», la CLABE)
//   percentRule()                                                 un porcentaje entre 0 y 100 (o entre min y max)
//
//   Yup.object({
//       password: Yup.string().required(),
//       password_confirmation: Yup.string().required().test(sameAsFieldRule('password', {otherLabel: 'la contraseña'})),
//       commission: Yup.string().test(percentRule({max: 30})),
//   })
//
// Un campo vacío pasa: que sea obligatorio lo dice required(). Son objetos de .test() y no un Yup propio: el proyecto usa su
// copia de yup y aquí no se importa. Funcionan con formik y con react-hook-form (yupResolver). Cada mensaje lleva su regla:
// la pantalla (messages del campo) o los textos del proyecto pueden poner el suyo (validationMessages.js).
//
// Genérico del paquete: function (regla de la casa). Pruebas en fieldRules.test.js.
import {ruleMessageOf} from '@/forms/validationMessages.js';

/**
 * @param {unknown} value
 * @returns {boolean} si viene vacío (lo dice required(), no esta regla)
 */
function isEmpty(value) {
    return value === '' || value === null || value === undefined;
}

/**
 * Igual a otro campo del mismo formulario (o del mismo renglón de una lista): la confirmación de una contraseña, de una CLABE
 * o de un correo.
 *
 * @param {string} otherField el campo con el que se compara, en el mismo objeto ('password')
 * @param {object} [options]
 * @param {string} [options.otherLabel] cómo se llama ese campo en el mensaje («Debe ser igual a la contraseña»); sin él,
 *     «No coincide»
 * @returns {{name: string, message: {key: string, values: object, rule: string}, test: (value: unknown, context: {parent?: object}) => boolean}}
 */
export function sameAsFieldRule(otherField, {otherLabel} = {}) {
    const message = otherLabel
        ? ruleMessageOf('validation:sameAs', 'sameAs', {other: otherLabel})
        : ruleMessageOf('validation:sameAsUnnamed', 'sameAs');
    return {
        name: 'sameAs',
        message,
        test: (value, context) => isEmpty(value) || String(value) === String(context?.parent?.[otherField] ?? ''),
    };
}

/**
 * Un porcentaje: un número entre min y max (por omisión 0 y 100), con decimales. Acepta el texto que deja NumberInput
 * ('12.5') o un número.
 *
 * @param {object} [options]
 * @param {number} [options.min] por omisión 0
 * @param {number} [options.max] por omisión 100
 * @returns {{name: string, message: {key: string, values: object, rule: string}, test: (value: unknown) => boolean}}
 */
export function percentRule({min = 0, max = 100} = {}) {
    return {
        name: 'percent',
        message: ruleMessageOf('validation:percent', 'percent', {min, max}),
        test: (value) => {
            if (isEmpty(value)) {
                return true;
            }
            const number = Number(String(value).replace(/,/g, ''));
            return Number.isFinite(number) && number >= min && number <= max;
        },
    };
}
