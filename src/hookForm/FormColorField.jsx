// Campo de color de react-hook-form: ColorInput (inputs/) conectado a su campo con useController. Se ve y se porta igual que
// el FormColorField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import ColorInput from '@/inputs/ColorInput.jsx';
import {useHookFormField} from '@/hookForm/useHookFormField.js';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/inputs/ColorInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/ColorInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las del campo de la casa, sin
 *     value ni error (su onChange y su onBlur corren después de los del formulario); control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormColorField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control, inputProps);
    return <ColorInput {...inputProps} {...fieldProps} />;
}
