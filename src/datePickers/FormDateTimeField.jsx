// Campo de fecha con hora de formik: DateTimeInput conectado a su campo. Al formulario llega el instante en
// UTC ('2026-11-01T18:30:00Z').
//
// Con react-hook-form no hay uno listo (esta puerta no pide react-hook-form): DateTimeInput va dentro de un Controller.
//
// Genérico del paquete: function (regla de la casa).
import DateTimeInput from '@/datePickers/DateTimeInput.jsx';
import {PICKER_KIND} from '@/datePickers/pickerLimits.js';
import {usePickerLimits} from '@/datePickers/usePickerLimits.js';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/datePickers/DateTimeInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/datePickers/DateTimeInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de
 *     DateTimeInput (minDateTime, minimumMinutesFromNow, disablePast, minutesStep, timeZone…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormDateTimeField({name, ...inputProps}) {
    // el tope del campo también impide enviar el formulario con una fecha tecleada fuera de él
    const limits = usePickerLimits(PICKER_KIND.dateTime, {
        min: inputProps.minDateTime, max: inputProps.maxDateTime, disablePast: inputProps.disablePast, disableFuture: inputProps.disableFuture,
        minimumMinutesFromNow: inputProps.minimumMinutesFromNow, timeZone: inputProps.timeZone,
    });
    const fieldProps = useFormikField(name, inputProps, limits.hasLimits ? limits.problemOf : undefined);
    return <DateTimeInput {...inputProps} {...fieldProps} />;
}
