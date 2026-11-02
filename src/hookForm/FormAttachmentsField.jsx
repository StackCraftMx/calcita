// Campo de varios archivos de react-hook-form: AttachmentsInput (upload/) conectado a su campo con useController. Se ve y
// se porta igual que el FormAttachmentsField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import {useHookFormField} from '@/hookForm/useHookFormField.js';
import AttachmentsInput from '@/upload/AttachmentsInput.jsx';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/upload/AttachmentsInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las del campo de la casa, sin
 *     value / onChange / onBlur / error; control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormAttachmentsField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control);
    return <AttachmentsInput {...inputProps} {...fieldProps} />;
}
