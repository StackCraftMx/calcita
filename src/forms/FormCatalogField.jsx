// Campo de catálogo de formik: CatalogInput (inputs/) conectado a su campo. Al formulario llega solo la clave.
//
// Genérico del paquete: function (regla de la casa).
import CatalogInput from '@/inputs/CatalogInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {object} props las de CatalogInput (options, formatLabel, loading…), sin value / onChange / onBlur / error
 * @param {string} props.name el campo del formulario
 * @param {string} props.label ya traducido
 * @param {Array<{code: string, label: string}>} props.options
 */
export default function FormCatalogField({name, ...catalogInputProps}) {
    const fieldProps = useFormikField(name);
    return <CatalogInput {...catalogInputProps} {...fieldProps} />;
}
