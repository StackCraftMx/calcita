// Campo de número de react-hook-form: NumberInput (inputs/) conectado a su campo con useController. Se ve y se porta igual que
// el FormNumberField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import NumberInput from '@/inputs/NumberInput.jsx';
import {useHookFormField} from '@/hookForm/useHookFormField.js';

/**
 * @param {object} props las de NumberInput, sin value / onChange / onBlur / error
 * @param {string} props.name el campo del formulario
 * @param {string} props.label ya traducido
 * @param {object} [props.control] el de useForm, si la pantalla no usa FormProvider
 */
export default function FormNumberField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control);
    return <NumberInput {...inputProps} {...fieldProps} />;
}
