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
// Hook genérico del paquete: function (regla de la casa).
import {useController, useFormContext} from 'react-hook-form';

/**
 * @param {string} name el campo del formulario
 * @param {object} [control] el de useForm, si la pantalla no usa FormProvider
 * @param {{onChange?: Function, onBlur?: Function}} [screen] lo que la pantalla le dijo al campo
 * @returns {{name: string, value: unknown, onChange: (value: unknown, ...rest: unknown[]) => void, onBlur: (...args: unknown[]) => void, inputRef: Function, error: unknown}}
 */
export function useHookFormField(name, control, screen = {}) {
    const formContext = useFormContext();
    const {field, fieldState} = useController({name, control: control ?? formContext?.control});

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
    };
}
