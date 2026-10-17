// Campo de lista desplegable de react-hook-form: SelectInput (inputs/) conectado a su campo con useController. Se ve y se porta igual que
// el FormSelectField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import SelectInput from '@/inputs/SelectInput.jsx';
import {useHookFormField} from '@/hookForm/useHookFormField.js';

/**
 * @param {object} props las de SelectInput, sin value / onChange / onBlur / error
 * @param {string} props.name el campo del formulario
 * @param {string} props.label ya traducido
 * @param {object} [props.control] el de useForm, si la pantalla no usa FormProvider
 */
export default function FormSelectField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control);
    return <SelectInput {...inputProps} {...fieldProps} />;
}
