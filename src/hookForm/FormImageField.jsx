// Campo de una imagen de react-hook-form: ImageInput (upload/) conectado a su campo con useController. Se ve y se porta igual
// que el FormImageField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import {useHookFormField} from '@/hookForm/useHookFormField.js';
import ImageInput from '@/upload/ImageInput.jsx';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/upload/ImageInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las del campo de la casa, sin
 *     value / onChange / onBlur / error; control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormImageField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control);
    return <ImageInput {...inputProps} {...fieldProps} />;
}
