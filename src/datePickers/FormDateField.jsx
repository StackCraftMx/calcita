// Campo de fecha de formik: DateInput conectado a su campo. Al formulario llega 'AAAA-MM-DD'.
//
// Con react-hook-form no hay uno listo (esta puerta no pide react-hook-form): DateInput va dentro de un Controller.
//
// Genérico del paquete: function (regla de la casa).
import DateInput from '@/datePickers/DateInput.jsx';
import {PICKER_KIND} from '@/datePickers/pickerLimits.js';
import {usePickerLimits} from '@/datePickers/usePickerLimits.js';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/datePickers/DateInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/datePickers/DateInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de
 *     DateInput (minDate, maxDate, disableFuture, openTo…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormDateField({name, ...dateInputProps}) {
    // el tope del campo también impide enviar el formulario con una fecha tecleada fuera de él
    const limits = usePickerLimits(PICKER_KIND.date, {min: dateInputProps.minDate, max: dateInputProps.maxDate, disablePast: dateInputProps.disablePast, disableFuture: dateInputProps.disableFuture});
    const fieldProps = useFormikField(name, dateInputProps, limits.hasLimits ? limits.problemOf : undefined);
    return <DateInput {...dateInputProps} {...fieldProps} />;
}
