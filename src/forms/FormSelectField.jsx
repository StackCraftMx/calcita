// Lista desplegable de formik: SelectInput (inputs/) conectada a su campo.
//
// Genérico del paquete: function (regla de la casa).
import SelectInput from '@/inputs/SelectInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {object} props las de SelectInput, sin value / onChange / onBlur / error
 * @param {string} props.name el campo del formulario
 * @param {string} props.label ya traducido
 * @param {Array<{value: string|number, label: string, description?: string}>} props.options
 */
export default function FormSelectField({name, ...selectInputProps}) {
    const fieldProps = useFormikField(name);
    return <SelectInput {...selectInputProps} {...fieldProps} />;
}
