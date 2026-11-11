// La lista de transferencia de react-hook-form: TransferListInput (inputs/) conectada con useController. Se ve y se porta
// igual que la de formik (@stackcraftmx/calcita/forms).
//
// Sus minSelected y maxSelected también impiden enviar, salvo con resolver (useHookFormField.js). Los del esquema se
// leen con FormSchemaProvider y ToolkitProvider limitsFromSchema (useHookFormSchemaLimits.js).
//
// Genérico del paquete: function (regla de la casa).
import {useHookFormField} from '@/hookForm/useHookFormField.js';
import {LIMIT_KIND, listLimitProblemOf} from '@/inputs/fieldLimits.js';
import {useHookFormSchemaLimits} from '@/hookForm/useHookFormSchemaLimits.js';
import TransferListInput from '@/inputs/TransferListInput.jsx';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/inputs/TransferListInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/TransferListInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las del campo de la casa, sin
 *     value ni error (su onChange y su onBlur corren después de los del formulario); control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormTransferListField({name, control, ...inputProps}) {
    const hasLimits = inputProps.minSelected !== undefined || inputProps.maxSelected !== undefined;
    const fieldProps = useHookFormField(name, control, inputProps, hasLimits ? (value) => listLimitProblemOf(value, inputProps) : undefined);
    // los del esquema (con FormSchemaProvider y ToolkitProvider limitsFromSchema); los de la pantalla ganan
    const schemaLimits = useHookFormSchemaLimits(name, control, LIMIT_KIND.list);
    return <TransferListInput {...schemaLimits} {...inputProps} {...fieldProps} />;
}
