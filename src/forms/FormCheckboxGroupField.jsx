// El grupo de casillas de formik: CheckboxGroupInput (inputs/) conectado a su campo por name. Al formulario llega la
// lista de las marcadas.
//
// Sus topes de opciones: los de la pantalla (minSelected, maxSelected) y, con ToolkitProvider limitsFromSchema, los del
// esquema (array().min().max()); los de la pantalla ganan y también impiden enviar el formulario.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikField} from '@/forms/useFormikField.js';
import {useSchemaLimits} from '@/forms/useSchemaLimits.js';
import {LIMIT_KIND, listLimitProblemOf} from '@/inputs/fieldLimits.js';
import CheckboxGroupInput from '@/inputs/CheckboxGroupInput.jsx';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/CheckboxGroupInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/CheckboxGroupInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de
 *     CheckboxGroupInput, sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormCheckboxGroupField({name, ...inputProps}) {
    const schemaLimits = useSchemaLimits(name, LIMIT_KIND.list);
    const hasScreenLimits = inputProps.minSelected !== undefined || inputProps.maxSelected !== undefined;
    const fieldProps = useFormikField(name, inputProps, hasScreenLimits ? (value) => listLimitProblemOf(value, inputProps) : undefined);
    return <CheckboxGroupInput {...schemaLimits} {...inputProps} {...fieldProps} />;
}
