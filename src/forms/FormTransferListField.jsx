// La lista de transferencia de formik: TransferListInput (inputs/) conectada a su campo por name. Al formulario llega la
// lista de los elegidos.
//
// Genérico del paquete: function (regla de la casa).
import {useFormikField} from '@/forms/useFormikField.js';
import TransferListInput from '@/inputs/TransferListInput.jsx';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/inputs/TransferListInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/inputs/TransferListInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de
 *     TransferListInput, sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormTransferListField({name, ...inputProps}) {
    const fieldProps = useFormikField(name, inputProps);
    return <TransferListInput {...inputProps} {...fieldProps} />;
}
