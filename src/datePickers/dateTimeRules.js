// Las reglas de yup para una fecha con hora que depende del reloj o de otro campo, con sus mensajes en el idioma activo:
//
//   minutesFromNowRule(5)              al menos 5 minutos después de ahora (publicar algo con anticipación)
//   minutesAfterRule('startsAt', 30)   al menos 30 minutos después del campo startsAt (algo que dura al menos media hora)
//
//   Yup.object({
//       startsAt: Yup.string().required().test(minutesFromNowRule(5)),
//       endsAt: Yup.string().required().test(minutesAfterRule('startsAt', 30)),
//   })
//
// Un campo vacío pasa: que sea obligatorio lo dice required(). El servidor vuelve a revisar: entre que se llena el
// formulario y se guarda pasa el tiempo.
//
// Son objetos de .test() y no un Yup propio: el proyecto usa su copia de yup y aquí no se importa.
//
// Genérico del paquete: function (regla de la casa).
import {earliestInstantFromNow, instantPlusMinutes} from '@/datePickers/pickerValues.js';

/**
 * @param {number} minutes
 * @returns {{name: string, message: {key: string, values: {count: number}}, test: (value: unknown) => boolean}}
 */
export function minutesFromNowRule(minutes) {
    return {
        name: 'minutesFromNow',
        message: {key: 'validation:minutesFromNow', values: {count: minutes}},
        // la hora se toma al revisar, no al armar el esquema: el mínimo se recorre con el reloj
        test: (value) => !value || Date.parse(String(value)) >= Date.parse(earliestInstantFromNow(minutes)),
    };
}

/**
 * @param {string} startField el nombre del campo de inicio, en el mismo objeto del esquema
 * @param {number} minutes
 * @returns {{name: string, message: {key: string, values: {count: number}}, test: (value: unknown, context: {parent: object}) => boolean}}
 */
export function minutesAfterRule(startField, minutes) {
    return {
        name: 'minutesAfter',
        message: {key: 'validation:minutesAfter', values: {count: minutes}},
        test: (value, context) => {
            const earliest = instantPlusMinutes(context.parent?.[startField], minutes);
            // sin inicio todavía no hay contra qué comparar: eso lo dice la regla del inicio
            return !value || !earliest || Date.parse(String(value)) >= Date.parse(earliest);
        },
    };
}
