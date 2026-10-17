// Campo de catálogo de react-hook-form: CatalogInput (inputs/) conectado a su campo con useController. Se ve y se porta igual que
// el FormCatalogField de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import CatalogInput from '@/inputs/CatalogInput.jsx';
import {useHookFormField} from '@/hookForm/useHookFormField.js';

/**
 * @param {object} props las de CatalogInput, sin value / onChange / onBlur / error
 * @param {string} props.name el campo del formulario
 * @param {string} props.label ya traducido
 * @param {object} [props.control] el de useForm, si la pantalla no usa FormProvider
 */
export default function FormCatalogField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control);
    return <CatalogInput {...inputProps} {...fieldProps} />;
}
