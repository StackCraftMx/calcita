// Campo de número de formik: NumberInput (inputs/) conectado a su campo. Al formulario llega el texto limpio
// ('2850000.50'), listo para Money.fromString o para el servidor.
//
// Genérico del paquete: function (regla de la casa).
import NumberInput from '@/inputs/NumberInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/NumberInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las de NumberInput (decimals, prefix, suffix, allowNegative…), sin value / onChange / onBlur / error
 */
export default function FormNumberField({name, ...numberInputProps}) {
    const fieldProps = useFormikField(name);
    return <NumberInput {...numberInputProps} {...fieldProps} />;
}
