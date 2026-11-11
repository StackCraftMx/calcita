// Los topes que el esquema de yup del formulario le pone a un campo de formik (schemaLimits.js), solo si el proyecto lo
// prendió (ToolkitProvider limitsFromSchema); apagado, nada, como antes. El campo los recibe como props y la pantalla gana:
//
//   const schemaLimits = useSchemaLimits(name, LIMIT_KIND.number);
//   return <NumberInput {...schemaLimits} {...numberInputProps} {...fieldProps} />;
//
// Hook genérico del paquete: function (regla de la casa).
import {useFormikContext} from 'formik';

import {useFormSchema} from '@/forms/FormSchemaProvider.jsx';
import {limitsInSchema} from '@/forms/schemaLimits.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';

/**
 * @param {string} name el campo del formulario
 * @param {'number'|'text'|'list'} kind de qué es el campo (LIMIT_KIND)
 * @returns {Record<string, number>} {min, max}, {minLength, maxLength} o {minSelected, maxSelected}; {} sin tope o apagado
 */
export function useSchemaLimits(name, kind) {
    const {values} = useFormikContext();
    const schema = useFormSchema();
    const {limitsFromSchema} = useToolkitSettings();
    return limitsFromSchema === true ? limitsInSchema(schema, name, values, kind) : {};
}
