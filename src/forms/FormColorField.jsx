// Campo de color de formik: ColorInput (inputs/) conectado a su campo. Al formulario llega '#RRGGBB' en mayúsculas.
//
// Genérico del paquete: function (regla de la casa).
import ColorInput from '@/inputs/ColorInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/ColorInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/ColorInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de ColorInput (checkContrast…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormColorField({name, ...colorInputProps}) {
    const fieldProps = useFormikField(name, colorInputProps);
    return <ColorInput {...colorInputProps} {...fieldProps} />;
}
