// Campo de texto de react-hook-form: TextInput (inputs/) conectado a su campo con useController. Se ve y se porta igual que
// el FormTextField de formik (@stackcraftmx/calcita/forms). Sus minLength y maxLength también impiden enviar, salvo con
// resolver (useHookFormField.js). Los del esquema se leen con FormSchemaProvider y ToolkitProvider limitsFromSchema
// (useHookFormSchemaLimits.js).
//
// Genérico del paquete: function (regla de la casa).
import TextInput from '@/inputs/TextInput.jsx';
import {LIMIT_KIND, textLimitProblemOf} from '@/inputs/fieldLimits.js';
import {useHookFormSchemaLimits} from '@/hookForm/useHookFormSchemaLimits.js';
import {useHookFormField} from '@/hookForm/useHookFormField.js';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/inputs/TextInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/TextInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las del campo de la casa, sin
 *     value ni error (su onChange y su onBlur corren después de los del formulario); control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormTextField({name, control, ...inputProps}) {
    const hasLimits = inputProps.minLength !== undefined || inputProps.maxLength !== undefined;
    const fieldProps = useHookFormField(name, control, inputProps, hasLimits ? (value) => textLimitProblemOf(value, inputProps) : undefined);
    // los del esquema (con FormSchemaProvider y ToolkitProvider limitsFromSchema); los de la pantalla ganan
    const schemaLimits = useHookFormSchemaLimits(name, control, LIMIT_KIND.text);
    return <TextInput {...schemaLimits} {...inputProps} {...fieldProps} />;
}
