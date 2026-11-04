// Campo de un archivo de formik: FileInput (upload/) conectado a su campo. Al formulario llega el File (o lo que ya estaba
// guardado) o null; subirlo es de la pantalla al guardar (uploadWithProgress con su FormData).
//
// Genérico del paquete: function (regla de la casa).
import {useFormikField} from '@/forms/useFormikField.js';
import FileInput from '@/upload/FileInput.jsx';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/upload/FileInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/upload/FileInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de
 *     FileInput (accept, maxSize, template…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormFileField({name, ...inputProps}) {
    const fieldProps = useFormikField(name, inputProps);
    return <FileInput {...inputProps} {...fieldProps} />;
}
