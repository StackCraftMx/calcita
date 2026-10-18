// Campo de catálogo de formik: CatalogInput (inputs/) conectado a su campo. Al formulario llega solo la clave.
//
// Genérico del paquete: function (regla de la casa).
import CatalogInput from '@/inputs/CatalogInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/CatalogInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las de CatalogInput (options, formatLabel, loading…), sin value / onChange / onBlur / error
 */
export default function FormCatalogField({name, ...catalogInputProps}) {
    const fieldProps = useFormikField(name);
    return <CatalogInput {...catalogInputProps} {...fieldProps} />;
}
