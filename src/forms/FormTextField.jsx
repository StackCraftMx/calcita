// Campo de texto de formik: TextInput (inputs/) conectado a su campo. Lo visual y sus reglas (etiqueta arriba, ojo de las
// contraseñas, mayúsculas, normalizar al salir, el error en el idioma activo, el contador) viven en TextInput.
//
// Sus topes de letras: los de la pantalla (minLength, maxLength) y, con ToolkitProvider limitsFromSchema, los del esquema
// (string().min().max()); los de la pantalla ganan y también impiden enviar el formulario.
//
// Genérico del paquete: function (regla de la casa).
import TextInput from '@/inputs/TextInput.jsx';
import {LIMIT_KIND, textLimitProblemOf} from '@/inputs/fieldLimits.js';
import {useFormikField} from '@/forms/useFormikField.js';
import {useSchemaLimits} from '@/forms/useSchemaLimits.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/TextInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/TextInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de TextInput, sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormTextField({name, ...textInputProps}) {
    const schemaLimits = useSchemaLimits(name, LIMIT_KIND.text);
    const hasScreenLimits = textInputProps.minLength !== undefined || textInputProps.maxLength !== undefined;
    const fieldProps = useFormikField(name, textInputProps, hasScreenLimits ? (value) => textLimitProblemOf(value, textInputProps) : undefined);
    return <TextInput {...schemaLimits} {...textInputProps} {...fieldProps} />;
}
