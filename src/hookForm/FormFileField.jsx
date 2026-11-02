// Campo de un archivo de react-hook-form: FileInput (upload/) conectado a su campo con useController. Se ve y se porta igual
// que el FormFileField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import {useHookFormField} from '@/hookForm/useHookFormField.js';
import FileInput from '@/upload/FileInput.jsx';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/upload/FileInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las del campo de la casa, sin
 *     value / onChange / onBlur / error; control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormFileField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control);
    return <FileInput {...inputProps} {...fieldProps} />;
}
