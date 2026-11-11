// Los topes que el esquema de yup le pone a un campo de react-hook-form (schemaLimits.js), solo si el proyecto lo prendió
// (ToolkitProvider limitsFromSchema); apagado, nada, como antes. Lo mismo que useSchemaLimits hace con formik.
//
// OJO: react-hook-form guarda el esquema dentro del resolver y no se lo enseña a sus campos (igual que el Formik de 'formik').
// La pantalla se los enseña con FormSchemaProvider, el mismo de formik:
//
//   <FormProvider {...form}>
//       <FormSchemaProvider schema={schema}>…los campos…</FormSchemaProvider>
//   </FormProvider>
//
// Como el resolver revisa ese mismo esquema, un tope escrito ahí también impide enviar (un tope puesto solo en el campo no:
// con resolver, react-hook-form no corre las reglas del campo; useHookFormField.js).
//
// Hook genérico del paquete: function (regla de la casa).
import {useFormContext, useWatch} from 'react-hook-form';

import {useFormSchema} from '@/forms/FormSchemaProvider.jsx';
import {limitsInSchema} from '@/forms/schemaLimits.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';

/**
 * @param {string} name el campo del formulario
 * @param {object|undefined} control el de useForm, si la pantalla no usa FormProvider (undefined con FormProvider)
 * @param {'number'|'text'|'list'} kind de qué es el campo (LIMIT_KIND)
 * @returns {Record<string, number>} {min, max}, {minLength, maxLength} o {minSelected, maxSelected}; {} sin tope o apagado
 */
export function useHookFormSchemaLimits(name, control, kind) {
    const formContext = useFormContext();
    const schema = useFormSchema();
    const {limitsFromSchema} = useToolkitSettings();
    const isReading = limitsFromSchema === true && schema !== null;
    // los valores, para las condiciones del esquema (.when); sin leer el esquema no se escucha nada (cada cambio volvería a
    // pintar el campo)
    const values = useWatch({control: control ?? formContext?.control, disabled: !isReading});
    return isReading ? limitsInSchema(schema, name, values, kind) : {};
}
