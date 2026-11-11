// La conexión de un campo suelto (inputs/) con formik: lo que la vista necesita, sacado del campo de formik.
//
// Una regla vive aquí: el error se enseña cuando el campo ya se tocó (o ya se intentó enviar, que formik marca como
// tocados todos). Marcar en rojo lo que nadie ha llenado regaña a alguien por no adivinar.
//
// Lo que la pantalla le pase al campo en onChange y onBlur también corre, después del de formik y con el valor nuevo. OJO:
// antes el de formik iba después y lo pisaba sin avisar (la pantalla tenía que observar el valor para enterarse).
//
// Y lo obligatorio: lo que diga la pantalla con required; si no dice nada y el proyecto lo prendió
// (ToolkitProvider requiredFromSchema), lo que pida el esquema de yup del formulario (schemaRequired.js). El esquema llega
// por FormSchemaProvider (el Formik de Calcita lo pone solo): formik no lo comparte con sus campos.
//
// Y el tope que la pantalla le puso al campo (min, max, maxLength, maxSelected…): se registra en formik como validación del
// campo, así también impide enviar el formulario aunque el esquema no lo diga. El del esquema ya lo revisa yup.
//
// Hook genérico del paquete: function (regla de la casa).
import {useCallback, useRef} from 'react';
import {useField, useFormikContext} from 'formik';

import {useFormSchema} from '@/forms/FormSchemaProvider.jsx';
import {isRequiredInSchema} from '@/forms/schemaRequired.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';

/**
 * @param {string} name el campo del formulario
 * @param {{required?: boolean, onChange?: Function, onBlur?: Function}} [screen] lo que la pantalla le dijo al campo
 * @param {(value: any) => object|null} [limitProblemOf] el tope que rompe el valor según las props del campo (fieldLimits.js)
 * @returns {{name: string, value: unknown, onChange: (value: unknown, ...rest: unknown[]) => void, onBlur: (...args: unknown[]) => void, error: unknown, required: boolean}}
 */
export function useFormikField(name, screen = {}, limitProblemOf) {
    // OJO: la función del tope cambia en cada pintada; formik guarda la validación al registrar el campo. Se le da una que
    // siempre llama a la última, así no se vuelve a registrar en cada pintada
    const limitProblemRef = useRef(limitProblemOf);
    limitProblemRef.current = limitProblemOf;
    const validateLimit = useCallback((value) => limitProblemRef.current?.(value) ?? undefined, []);
    // sin tope, como antes: el campo no registra ninguna validación propia
    const [field, meta, helpers] = useField(limitProblemOf ? {name, validate: validateLimit} : name);
    const {values} = useFormikContext();
    const schema = useFormSchema();
    const {requiredFromSchema} = useToolkitSettings();

    return {
        name,
        value: field.value,
        onChange: (value, ...rest) => {
            helpers.setValue(value);
            screen.onChange?.(value, ...rest);
        },
        onBlur: (...args) => {
            helpers.setTouched(true);
            screen.onBlur?.(...args);
        },
        error: meta.touched ? meta.error : undefined,
        required: screen.required ?? (requiredFromSchema === true && isRequiredInSchema(schema, name, values)),
    };
}
