// Lista desplegable de formik: SelectInput (inputs/) conectada a su campo.
//
// Sus topes de opciones: los de la pantalla (minSelected, maxSelected) y, con ToolkitProvider limitsFromSchema, los del
// esquema (array().min().max()); los de la pantalla ganan y también impiden enviar el formulario.
//
// Genérico del paquete: function (regla de la casa).
import SelectInput from '@/inputs/SelectInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';
import {useSchemaLimits} from '@/forms/useSchemaLimits.js';
import {LIMIT_KIND, listLimitProblemOf} from '@/inputs/fieldLimits.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/SelectInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/SelectInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de SelectInput, sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormSelectField({name, ...selectInputProps}) {
    const schemaLimits = useSchemaLimits(name, LIMIT_KIND.list);
    const hasScreenLimits = selectInputProps.minSelected !== undefined || selectInputProps.maxSelected !== undefined;
    const fieldProps = useFormikField(name, selectInputProps, hasScreenLimits ? (value) => listLimitProblemOf(value, selectInputProps) : undefined);
    return <SelectInput {...schemaLimits} {...selectInputProps} {...fieldProps} />;
}
