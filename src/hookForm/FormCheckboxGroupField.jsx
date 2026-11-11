// El grupo de casillas de react-hook-form: CheckboxGroupInput (inputs/) conectado con useController. Se ve y se porta
// igual que el de formik (@stackcraftmx/calcita/forms).
//
// Sus minSelected y maxSelected también impiden enviar, salvo con resolver (useHookFormField.js). Los del esquema se
// leen con FormSchemaProvider y ToolkitProvider limitsFromSchema (useHookFormSchemaLimits.js).
//
// Genérico del paquete: function (regla de la casa).
import {useHookFormField} from '@/hookForm/useHookFormField.js';
import {LIMIT_KIND, listLimitProblemOf} from '@/inputs/fieldLimits.js';
import {useHookFormSchemaLimits} from '@/hookForm/useHookFormSchemaLimits.js';
import CheckboxGroupInput from '@/inputs/CheckboxGroupInput.jsx';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/inputs/CheckboxGroupInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/CheckboxGroupInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las del campo de la casa, sin
 *     value ni error (su onChange y su onBlur corren después de los del formulario); control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormCheckboxGroupField({name, control, ...inputProps}) {
    const hasLimits = inputProps.minSelected !== undefined || inputProps.maxSelected !== undefined;
    const fieldProps = useHookFormField(name, control, inputProps, hasLimits ? (value) => listLimitProblemOf(value, inputProps) : undefined);
    // los del esquema (con FormSchemaProvider y ToolkitProvider limitsFromSchema); los de la pantalla ganan
    const schemaLimits = useHookFormSchemaLimits(name, control, LIMIT_KIND.list);
    return <CheckboxGroupInput {...schemaLimits} {...inputProps} {...fieldProps} />;
}
