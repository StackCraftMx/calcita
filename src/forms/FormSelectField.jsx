// Lista desplegable de formik: SelectInput (inputs/) conectada a su campo.
//
// Genérico del paquete: function (regla de la casa).
import SelectInput from '@/inputs/SelectInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/SelectInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/SelectInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de SelectInput, sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormSelectField({name, ...selectInputProps}) {
    const fieldProps = useFormikField(name, selectInputProps);
    return <SelectInput {...selectInputProps} {...fieldProps} />;
}
