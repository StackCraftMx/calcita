// El cargador mini de formik: FileUploadInput (upload/) conectado a su campo. Sube en cuanto se elige y al formulario llega
// solo el id que dio el servidor ('' mientras sube o si se quita): con Yup.string().required() pide el documento.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikField} from '@/forms/useFormikField.js';
import FileUploadInput from '@/upload/FileUploadInput.jsx';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/upload/FileUploadInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las de
 *     FileUploadInput (upload, accept, maxSize, download…), sin value / onChange / onBlur / error
 */
export default function FormFileUploadField({name, ...inputProps}) {
    const fieldProps = useFormikField(name);
    return <FileUploadInput {...inputProps} {...fieldProps} />;
}
