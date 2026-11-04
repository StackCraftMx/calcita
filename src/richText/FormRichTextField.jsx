// Campo de texto con formato de formik: RichTextEditor conectado a su campo. Al formulario llega el HTML ('' si no hay nada
// escrito).
//
// Con react-hook-form no hay uno listo (esta puerta no pide react-hook-form): RichTextEditor va dentro de un Controller.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikField} from '@/forms/useFormikField.js';
import RichTextEditor from '@/richText/RichTextEditor.jsx';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/richText/RichTextEditor.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/richText/RichTextEditor.jsx').default>[0], 'onChange'|'onBlur'>>} props las de
 *     RichTextEditor (features, maxLength, placeholder…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormRichTextField({name, ...editorProps}) {
    const fieldProps = useFormikField(name, editorProps);
    return <RichTextEditor {...editorProps} {...fieldProps} />;
}
