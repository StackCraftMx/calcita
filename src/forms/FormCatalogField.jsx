// Campo de catálogo de formik: CatalogInput (inputs/) conectado a su campo. Al formulario llega solo la clave.
//
// Sus topes de opciones: los de la pantalla (minSelected, maxSelected) y, con ToolkitProvider limitsFromSchema, los del
// esquema (array().min().max()); los de la pantalla ganan y también impiden enviar el formulario.
//
// Genérico del paquete: function (regla de la casa).
import CatalogInput from '@/inputs/CatalogInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';
import {useSchemaLimits} from '@/forms/useSchemaLimits.js';
import {LIMIT_KIND, listLimitProblemOf} from '@/inputs/fieldLimits.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/CatalogInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/CatalogInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de CatalogInput (options, formatLabel, loading…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormCatalogField({name, ...catalogInputProps}) {
    const schemaLimits = useSchemaLimits(name, LIMIT_KIND.list);
    const hasScreenLimits = catalogInputProps.minSelected !== undefined || catalogInputProps.maxSelected !== undefined;
    const fieldProps = useFormikField(name, catalogInputProps, hasScreenLimits ? (value) => listLimitProblemOf(value, catalogInputProps) : undefined);
    return <CatalogInput {...schemaLimits} {...catalogInputProps} {...fieldProps} />;
}
