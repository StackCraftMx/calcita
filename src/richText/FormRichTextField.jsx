// Campo de texto con formato de formik: RichTextEditor conectado a su campo. Al formulario llega el HTML ('' si no hay nada
// escrito).
//
// Con react-hook-form no hay uno listo (esta puerta no pide react-hook-form): RichTextEditor va dentro de un Controller.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikField} from '@/forms/useFormikField.js';
import RichTextEditor from '@/richText/RichTextEditor.jsx';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/richText/RichTextEditor.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las de
 *     RichTextEditor (features, maxLength, placeholder…), sin value / onChange / onBlur / error
 */
export default function FormRichTextField({name, ...editorProps}) {
    const fieldProps = useFormikField(name);
    return <RichTextEditor {...editorProps} {...fieldProps} />;
}
