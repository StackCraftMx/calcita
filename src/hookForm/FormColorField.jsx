// Campo de color de react-hook-form: ColorInput (inputs/) conectado a su campo con useController. Se ve y se porta igual que
// el FormColorField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import ColorInput from '@/inputs/ColorInput.jsx';
import {useHookFormField} from '@/hookForm/useHookFormField.js';

/**
 * @param {object} props las de ColorInput, sin value / onChange / onBlur / error
 * @param {string} props.name el campo del formulario
 * @param {string} props.label ya traducido
 * @param {object} [props.control] el de useForm, si la pantalla no usa FormProvider
 */
export default function FormColorField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control);
    return <ColorInput {...inputProps} {...fieldProps} />;
}
