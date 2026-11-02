// Campo con máscara de formik: MaskedInput (inputs/) conectado a su campo. Al formulario llega el valor LIMPIO (sin
// separadores, en mayúsculas): «5551234567», no «555 123 4567».
//
// Genérico del paquete: function (regla de la casa).
import {useFormikField} from '@/forms/useFormikField.js';
import MaskedInput from '@/inputs/MaskedInput.jsx';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/MaskedInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props
 *     las de MaskedInput (mask, label, helperText, placeholder…)
 */
export default function FormMaskedField({name, ...inputProps}) {
    const fieldProps = useFormikField(name);
    return <MaskedInput {...inputProps} {...fieldProps} />;
}
