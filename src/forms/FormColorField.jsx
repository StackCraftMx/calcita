// Campo de color de formik: ColorInput (inputs/) conectado a su campo. Al formulario llega '#RRGGBB' en mayúsculas.
//
// Genérico del paquete: function (regla de la casa).
import ColorInput from '@/inputs/ColorInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {object} props las de ColorInput (checkContrast…), sin value / onChange / onBlur / error
 * @param {string} props.name el campo del formulario
 * @param {string} props.label ya traducido
 */
export default function FormColorField({name, ...colorInputProps}) {
    const fieldProps = useFormikField(name);
    return <ColorInput {...colorInputProps} {...fieldProps} />;
}
