// Campo de lista desplegable de react-hook-form: SelectInput (inputs/) conectado a su campo con useController. Se ve y se porta igual que
// el FormSelectField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import SelectInput from '@/inputs/SelectInput.jsx';
import {useHookFormField} from '@/hookForm/useHookFormField.js';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/inputs/SelectInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las del campo de la casa, sin
 *     value / onChange / onBlur / error; control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormSelectField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control);
    return <SelectInput {...inputProps} {...fieldProps} />;
}
