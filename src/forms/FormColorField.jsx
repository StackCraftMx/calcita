// Campo de color de formik: ColorInput (inputs/) conectado a su campo. Al formulario llega '#RRGGBB' en mayúsculas.
//
// Genérico del paquete: function (regla de la casa).
import ColorInput from '@/inputs/ColorInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/ColorInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las de ColorInput (checkContrast…), sin value / onChange / onBlur / error
 */
export default function FormColorField({name, ...colorInputProps}) {
    const fieldProps = useFormikField(name);
    return <ColorInput {...colorInputProps} {...fieldProps} />;
}
