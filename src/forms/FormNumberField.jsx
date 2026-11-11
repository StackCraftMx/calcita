// Campo de número de formik: NumberInput (inputs/) conectado a su campo. Al formulario llega el texto limpio
// ('2850000.50'), listo para Money.fromString o para el servidor.
//
// Sus topes: los de la pantalla (min, max) y, con ToolkitProvider limitsFromSchema, los del esquema (number().min().max());
// los de la pantalla ganan y también impiden enviar el formulario.
//
// Genérico del paquete: function (regla de la casa).
import NumberInput from '@/inputs/NumberInput.jsx';
import {LIMIT_KIND, numberLimitProblemOf} from '@/inputs/fieldLimits.js';
import {useFormikField} from '@/forms/useFormikField.js';
import {useSchemaLimits} from '@/forms/useSchemaLimits.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/NumberInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/NumberInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de NumberInput (decimals, prefix, suffix, allowNegative, min, max…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormNumberField({name, ...numberInputProps}) {
    const schemaLimits = useSchemaLimits(name, LIMIT_KIND.number);
    const hasScreenLimits = numberInputProps.min !== undefined || numberInputProps.max !== undefined;
    const fieldProps = useFormikField(name, numberInputProps, hasScreenLimits ? (value) => numberLimitProblemOf(value, numberInputProps) : undefined);
    return <NumberInput {...schemaLimits} {...numberInputProps} {...fieldProps} />;
}
