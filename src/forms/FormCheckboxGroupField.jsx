// El grupo de casillas de formik: CheckboxGroupInput (inputs/) conectado a su campo por name. Al formulario llega la
// lista de las marcadas.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikField} from '@/forms/useFormikField.js';
import CheckboxGroupInput from '@/inputs/CheckboxGroupInput.jsx';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/CheckboxGroupInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las de
 *     CheckboxGroupInput, sin value / onChange / onBlur / error
 */
export default function FormCheckboxGroupField({name, ...inputProps}) {
    const fieldProps = useFormikField(name);
    return <CheckboxGroupInput {...inputProps} {...fieldProps} />;
}
