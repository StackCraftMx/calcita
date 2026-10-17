// Campo de número de formik: NumberInput (inputs/) conectado a su campo. Al formulario llega el texto limpio
// ('2850000.50'), listo para Money.fromString o para el servidor.
//
// Genérico del paquete: function (regla de la casa).
import NumberInput from '@/inputs/NumberInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {object} props las de NumberInput (decimals, prefix, suffix, allowNegative…), sin value / onChange / onBlur / error
 * @param {string} props.name el campo del formulario
 * @param {string} props.label ya traducido
 */
export default function FormNumberField({name, ...numberInputProps}) {
    const fieldProps = useFormikField(name);
    return <NumberInput {...numberInputProps} {...fieldProps} />;
}
