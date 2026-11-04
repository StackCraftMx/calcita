// Campo de mes de formik: MonthInput conectado a su campo. Al formulario llega 'AAAA-MM'.
//
// Con react-hook-form no hay uno listo (esta puerta no pide react-hook-form): MonthInput va dentro de un Controller.
//
// Genérico del paquete: function (regla de la casa).
import MonthInput from '@/datePickers/MonthInput.jsx';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/datePickers/MonthInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/datePickers/MonthInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de
 *     MonthInput (minMonth, maxMonth, disableFuture…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormMonthField({name, ...inputProps}) {
    const fieldProps = useFormikField(name, inputProps);
    return <MonthInput {...inputProps} {...fieldProps} />;
}
