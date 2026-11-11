// Los topes que el esquema de yup del formulario pone a un campo: los lee el campo de formik cuando el proyecto lo prende
// (ToolkitProvider limitsFromSchema), igual que el asterisco con requiredFromSchema. Así el tope se escribe una vez, en el
// esquema, y el campo lo usa para lo que se ve: corregir el número, el contador y el tope de letras, apagar las opciones
// de una lista ya llena. El aviso en rojo ya lo da yup.
//
// Qué se lee, según de qué es el campo (LIMIT_KIND):
//   - número: number().min(0).max(1000) → min y max. moreThan, lessThan, positive y negative NO: dejan fuera al tope mismo
//     y no hay a qué corregir (0.01 o 0.001, según los decimales). Esos solo los revisa yup;
//   - texto: string().min(3).max(80) → minLength y maxLength; string().length(5) → los dos en 5;
//   - lista: array().min(1).max(3) → minSelected y maxSelected; array().length(2) → los dos en 2.
// Un tope que depende de otro campo (yup.ref) no se lee: lo revisa yup al validar.
//
// Sin importar yup (como schemaRequired.js): así /date-pickers y /rich-text no le piden yup al proyecto que no lo usa.
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (schemaLimits.test.js).
import {LIMIT_KIND} from '@/inputs/fieldLimits.js';
import {fieldDescriptionOf} from '@/forms/schemaRequired.js';

// el tipo que yup le da a cada esquema, por la clase de tope que se le puede leer
const SCHEMA_TYPE_BY_KIND = Object.freeze({
    [LIMIT_KIND.number]: 'number',
    [LIMIT_KIND.text]: 'string',
    [LIMIT_KIND.list]: 'array',
});

// cómo se llama cada tope en las props del campo, según su clase
const LIMIT_PROPS_BY_KIND = Object.freeze({
    [LIMIT_KIND.number]: {min: 'min', max: 'max'},
    [LIMIT_KIND.text]: {min: 'minLength', max: 'maxLength'},
    [LIMIT_KIND.list]: {min: 'minSelected', max: 'maxSelected'},
});

/**
 * El valor de una regla de yup, solo si es un número fijo (no un yup.ref ni una regla exclusiva como moreThan).
 *
 * @param {Array<{name: string, params?: object}>} tests las reglas que da describe()
 * @param {string} testName min, max o length
 * @returns {number|undefined}
 */
function fixedParamOf(tests, testName) {
    const rule = tests.find((test) => test.name === testName && typeof test.params?.[testName] === 'number');
    return rule?.params[testName];
}

/**
 * @param {unknown} schema el validationSchema del formulario (un esquema de yup o una función que lo da, como en formik)
 * @param {string} name el campo, con la forma de formik ('contacts.2.email')
 * @param {object} [values] los valores del formulario, para las condiciones (.when)
 * @param {'number'|'text'|'list'} kind de qué es el campo (LIMIT_KIND)
 * @returns {Record<string, number>} las props del campo ({min, max}, {minLength, maxLength} o {minSelected, maxSelected}),
 *     solo las que el esquema pone; {} si no hay esquema, si el campo no está o si es de otro tipo
 */
export function limitsInSchema(schema, name, values, kind) {
    const description = fieldDescriptionOf(schema, name, values);
    if (!description || description.type !== SCHEMA_TYPE_BY_KIND[kind]) {
        return {};
    }
    const tests = description.tests ?? [];
    const exactLength = kind === LIMIT_KIND.number ? undefined : fixedParamOf(tests, 'length');
    const min = exactLength ?? fixedParamOf(tests, 'min');
    const max = exactLength ?? fixedParamOf(tests, 'max');
    const propNames = LIMIT_PROPS_BY_KIND[kind];
    return {
        ...(min === undefined ? {} : {[propNames.min]: min}),
        ...(max === undefined ? {} : {[propNames.max]: max}),
    };
}
