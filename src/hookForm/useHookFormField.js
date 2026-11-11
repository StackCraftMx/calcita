// La conexión de un campo suelto (inputs/) con react-hook-form: lo que la vista necesita, sacado de useController.
//
// El campo se busca en el formulario de la pantalla (FormProvider); sin él, se le pasa control.
//
// Lo que la pantalla le pase al campo en onChange y onBlur también corre, después del de react-hook-form y con el valor
// nuevo. OJO: antes el de react-hook-form iba después y lo pisaba sin avisar.
//
// Cuándo se enseña el error lo decide react-hook-form (por omisión, al intentar enviar y después al corregir): la vista
// solo pinta el que llegue. Los errores de yup llegan como llave ({key, values}) y la vista los traduce.
//
// El tope que la pantalla le puso al campo (min, max, maxLength, maxSelected…) va como regla del campo, para que también
// impida enviar. OJO: react-hook-form NO corre las reglas de los campos cuando el formulario tiene resolver (yupResolver):
// ahí el tope que impide enviar va en el esquema; el del campo sigue avisando y corrigiendo en el campo mismo.
// react-hook-form solo guarda textos como mensaje de una regla: el aviso se traduce al validar.
//
// Y lo obligatorio, como con formik: lo que diga la pantalla con required; si no dice nada y el proyecto lo prendió
// (ToolkitProvider requiredFromSchema), lo que pida el esquema de yup. OJO: react-hook-form guarda el esquema dentro del
// resolver y no se lo enseña a sus campos: la pantalla los envuelve en <FormSchemaProvider schema={schema}>.
//
// Hook genérico del paquete: function (regla de la casa).
import {useRef} from 'react';
import {useController, useFormContext, useWatch} from 'react-hook-form';

import {useFormSchema} from '@/forms/FormSchemaProvider.jsx';
import {isRequiredInSchema} from '@/forms/schemaRequired.js';
import {useValidationText} from '@/forms/useValidationText.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';

/**
 * @param {string} name el campo del formulario
 * @param {object} [control] el de useForm, si la pantalla no usa FormProvider
 * @param {{required?: boolean, onChange?: Function, onBlur?: Function, label?: unknown, messages?: Record<string, string|object>}} [screen] lo
 *     que la pantalla le dijo al campo
 * @param {(value: any) => object|null} [limitProblemOf] el tope que rompe el valor según las props del campo (fieldLimits.js)
 * @returns {{name: string, value: unknown, onChange: (value: unknown, ...rest: unknown[]) => void, onBlur: (...args: unknown[]) => void, inputRef: Function, error: unknown, required: boolean}}
 */
export function useHookFormField(name, control, screen = {}, limitProblemOf) {
    const formContext = useFormContext();
    const schema = useFormSchema();
    const {requiredFromSchema} = useToolkitSettings();
    const readsSchema = requiredFromSchema === true && schema !== null && screen.required === undefined;
    // los valores, para las condiciones del esquema (.when); sin leer el esquema no se escucha nada
    const values = useWatch({control: control ?? formContext?.control, disabled: !readsSchema});
    const validationTextOf = useValidationText({name, label: typeof screen.label === 'string' ? screen.label : undefined, messages: screen.messages});
    // la regla llama siempre a la última función del tope y del texto (cambian en cada pintada)
    const latestRef = useRef({limitProblemOf, validationTextOf});
    latestRef.current = {limitProblemOf, validationTextOf};
    const rules = limitProblemOf ? {
        validate: (value) => {
            const problem = latestRef.current.limitProblemOf?.(value);
            return problem ? latestRef.current.validationTextOf(problem) : true;
        },
    } : undefined;
    const {field, fieldState} = useController({name, control: control ?? formContext?.control, rules});

    return {
        name,
        value: field.value,
        onChange: (value, ...rest) => {
            field.onChange(value);
            screen.onChange?.(value, ...rest);
        },
        onBlur: (...args) => {
            field.onBlur();
            screen.onBlur?.(...args);
        },
        // react-hook-form enfoca el primer campo con error al enviar: necesita el input de verdad
        inputRef: field.ref,
        error: fieldState.error?.message,
        required: screen.required ?? (readsSchema && isRequiredInSchema(schema, name, values)),
    };
}
