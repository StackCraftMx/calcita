// Campo de texto de react-hook-form: TextInput (inputs/) conectado a su campo con useController. Se ve y se porta igual que
// el FormTextField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import TextInput from '@/inputs/TextInput.jsx';
import {useHookFormField} from '@/hookForm/useHookFormField.js';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/inputs/TextInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las del campo de la casa, sin
 *     value / onChange / onBlur / error; control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormTextField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control);
    return <TextInput {...inputProps} {...fieldProps} />;
}
