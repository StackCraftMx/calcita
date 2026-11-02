// Campo de varios archivos de formik: AttachmentsInput (upload/) conectado a su campo. Al formulario llega la lista de
// archivos; subirlos es de la pantalla al guardar (uploadWithProgress con su FormData).
//
// Genérico del paquete: function (regla de la casa).
import {useFormikField} from '@/forms/useFormikField.js';
import AttachmentsInput from '@/upload/AttachmentsInput.jsx';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/upload/AttachmentsInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las de
 *     AttachmentsInput (accept, maxFiles, maxTotalSize, template…), sin value / onChange / onBlur / error
 */
export default function FormAttachmentsField({name, ...inputProps}) {
    const fieldProps = useFormikField(name);
    return <AttachmentsInput {...inputProps} {...fieldProps} />;
}
