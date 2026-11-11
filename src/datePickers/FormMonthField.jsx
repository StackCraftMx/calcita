// Campo de mes de formik: MonthInput conectado a su campo. Al formulario llega 'AAAA-MM'.
//
// Con react-hook-form no hay uno listo (esta puerta no pide react-hook-form): MonthInput va dentro de un Controller.
//
// Genérico del paquete: function (regla de la casa).
import MonthInput from '@/datePickers/MonthInput.jsx';
import {PICKER_KIND} from '@/datePickers/pickerLimits.js';
import {usePickerLimits} from '@/datePickers/usePickerLimits.js';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/datePickers/MonthInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/datePickers/MonthInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de
 *     MonthInput (minMonth, maxMonth, disableFuture…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormMonthField({name, ...inputProps}) {
    // el tope del campo también impide enviar el formulario con una fecha tecleada fuera de él
    const limits = usePickerLimits(PICKER_KIND.month, {min: inputProps.minMonth, max: inputProps.maxMonth, disablePast: inputProps.disablePast, disableFuture: inputProps.disableFuture});
    const fieldProps = useFormikField(name, inputProps, limits.hasLimits ? limits.problemOf : undefined);
    return <MonthInput {...inputProps} {...fieldProps} />;
}
