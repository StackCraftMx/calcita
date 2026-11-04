// El cargador mini de react-hook-form: FileUploadInput (upload/) conectado a su campo con useController. Se ve y se porta
// igual que el FormFileUploadField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import {useHookFormField} from '@/hookForm/useHookFormField.js';
import FileUploadInput from '@/upload/FileUploadInput.jsx';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/upload/FileUploadInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/upload/FileUploadInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las del campo de la casa, sin
 *     value ni error (su onChange y su onBlur corren después de los del formulario); control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormFileUploadField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control, inputProps);
    return <FileUploadInput {...inputProps} {...fieldProps} />;
}
