// Campo de varios archivos de react-hook-form: AttachmentsInput (upload/) conectado a su campo con useController. Se ve y
// se porta igual que el FormAttachmentsField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import {useHookFormField} from '@/hookForm/useHookFormField.js';
import {filesLimitProblemOf} from '@/inputs/fieldLimits.js';
import AttachmentsInput from '@/upload/AttachmentsInput.jsx';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/upload/AttachmentsInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/upload/AttachmentsInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las del campo de la casa, sin
 *     value ni error (su onChange y su onBlur corren después de los del formulario); control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormAttachmentsField({name, control, ...inputProps}) {
    // el mínimo de archivos también impide enviar, salvo con resolver (useHookFormField.js)
    const fieldProps = useHookFormField(name, control, inputProps, inputProps.minFiles === undefined ? undefined : (value) => filesLimitProblemOf(value, inputProps));
    return <AttachmentsInput {...inputProps} {...fieldProps} />;
}
