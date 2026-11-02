// La lista de transferencia de react-hook-form: TransferListInput (inputs/) conectada con useController. Se ve y se porta
// igual que la de formik (@stackcraftmx/calcita/forms).
//
// Genérico del paquete: function (regla de la casa).
import {useHookFormField} from '@/hookForm/useHookFormField.js';
import TransferListInput from '@/inputs/TransferListInput.jsx';

/**
 * @param {{name: string, control?: object} & Omit<Parameters<typeof import('@/inputs/TransferListInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'>} props las del campo de la casa, sin
 *     value / onChange / onBlur / error; control: el de useForm, si la pantalla no usa FormProvider
 */
export default function FormTransferListField({name, control, ...inputProps}) {
    const fieldProps = useHookFormField(name, control);
    return <TransferListInput {...inputProps} {...fieldProps} />;
}
