// Campo de texto de formik: TextInput (inputs/) conectado a su campo. Lo visual y sus reglas (etiqueta arriba, ojo de las
// contraseñas, mayúsculas, normalizar al salir, el error en el idioma activo) viven en TextInput.
//
// Genérico del paquete: function (regla de la casa).
import TextInput from '@/inputs/TextInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/TextInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las de TextInput, sin value / onChange / onBlur / error
 */
export default function FormTextField({name, ...textInputProps}) {
    const fieldProps = useFormikField(name);
    return <TextInput {...textInputProps} {...fieldProps} />;
}
