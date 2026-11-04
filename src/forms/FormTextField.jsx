// Campo de texto de formik: TextInput (inputs/) conectado a su campo. Lo visual y sus reglas (etiqueta arriba, ojo de las
// contraseñas, mayúsculas, normalizar al salir, el error en el idioma activo) viven en TextInput.
//
// Genérico del paquete: function (regla de la casa).
import TextInput from '@/inputs/TextInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/TextInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/TextInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de TextInput, sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormTextField({name, ...textInputProps}) {
    const fieldProps = useFormikField(name, textInputProps);
    return <TextInput {...textInputProps} {...fieldProps} />;
}
