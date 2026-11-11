// Campo de varios archivos de formik: AttachmentsInput (upload/) conectado a su campo. Al formulario llega la lista de
// archivos; subirlos es de la pantalla al guardar (uploadWithProgress con su FormData).
//
// Genérico del paquete: function (regla de la casa).
import {useFormikField} from '@/forms/useFormikField.js';
import {filesLimitProblemOf} from '@/inputs/fieldLimits.js';
import AttachmentsInput from '@/upload/AttachmentsInput.jsx';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/upload/AttachmentsInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/upload/AttachmentsInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de
 *     AttachmentsInput (accept, maxFiles, maxTotalSize, template…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormAttachmentsField({name, ...inputProps}) {
    // el mínimo de archivos de la pantalla también impide enviar el formulario
    const fieldProps = useFormikField(name, inputProps, inputProps.minFiles === undefined ? undefined : (value) => filesLimitProblemOf(value, inputProps));
    return <AttachmentsInput {...inputProps} {...fieldProps} />;
}
