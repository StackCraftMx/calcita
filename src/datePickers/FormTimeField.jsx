// Campo de hora de formik: TimeInput conectado a su campo. Al formulario llega 'HH:mm'.
//
// Con react-hook-form no hay uno listo (esta puerta no pide react-hook-form): TimeInput va dentro de un Controller.
//
// Genérico del paquete: function (regla de la casa).
import TimeInput from '@/datePickers/TimeInput.jsx';
import {PICKER_KIND} from '@/datePickers/pickerLimits.js';
import {usePickerLimits} from '@/datePickers/usePickerLimits.js';
import {useFormikField} from '@/forms/useFormikField.js';

/**
 * @param {{name: string} & Omit<Parameters<typeof import('@/datePickers/TimeInput.jsx').default>[0], 'name'|'value'|'onChange'|'onBlur'|'error'> & Partial<Pick<Parameters<typeof import('@/datePickers/TimeInput.jsx').default>[0], 'onChange'|'onBlur'>>} props las de
 *     TimeInput (minTime, maxTime, minutesStep…), sin value ni error (su onChange y su onBlur corren después de los del formulario)
 */
export default function FormTimeField({name, ...inputProps}) {
    // el tope del campo también impide enviar el formulario con una fecha tecleada fuera de él
    const limits = usePickerLimits(PICKER_KIND.time, {min: inputProps.minTime, max: inputProps.maxTime});
    const fieldProps = useFormikField(name, inputProps, limits.hasLimits ? limits.problemOf : undefined);
    return <TimeInput {...inputProps} {...fieldProps} />;
}
