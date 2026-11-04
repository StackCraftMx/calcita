// Campo con máscara de react-hook-form: MaskedInput (inputs/) conectado a su campo. Al formulario llega el valor LIMPIO (sin
// separadores, en mayúsculas): «5551234567», no «555 123 4567».
//
// Genérico del paquete: function (regla de la casa).
import {useHookFormField} from '@/hookForm/useHookFormField.js';
import MaskedInput from '@/inputs/MaskedInput.jsx';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/inputs/MaskedInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/MaskedInput.jsx').default>[0], 'onChange'|'onBlur'>>} props
 *     las de MaskedInput (mask, label, helperText, placeholder…), sin value ni error (su onChange y su onBlur corren después de los del formulario); control: el de useForm,
 *     si la pantalla no usa FormProvider
 */
export default function FormMaskedField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control, inputProps);
    return <MaskedInput {...inputProps} {...fieldProps} />;
}
