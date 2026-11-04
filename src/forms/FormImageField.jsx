// Campo de una imagen de formik: ImageInput (upload/) conectado a su campo. Al formulario llega el File, la dirección de la
// imagen guardada o null; subirla es de la pantalla al guardar (uploadWithProgress con su FormData).
//
// Genérico del paquete: function (regla de la casa).
import {useFormikField} from '@/forms/useFormikField.js';
import ImageInput from '@/upload/ImageInput.jsx';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/upload/ImageInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/upload/ImageInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de
 *     ImageInput (shape, size, maxSize…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormImageField({name, ...inputProps}) {
    const fieldProps = useFormikField(name, inputProps);
    return <ImageInput {...inputProps} {...fieldProps} />;
}
