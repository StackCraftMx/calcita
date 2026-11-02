// Campo de HORA suelto con el TimePicker de MUI X (@stackcraftmx/calcita/date-pickers), para una hora del día sin fecha:
// la hora de una cita en un día ya elegido, el horario de una sucursal, «recordar a las 08:00».
//
// Viaja 'HH:mm' de 24 horas aunque en pantalla se vea con a.m. y p.m. (el hourCycle del proveedor decide cómo se ve, no
// cómo viaja). Una hora del día no tiene zona: no se pasa por Date ni por UTC. '' = vacía.
//
// Para un instante (fecha y hora de algo que pasa una vez) va DateTimeInput, que sí viaja en UTC.
//
// Genérico del paquete: function (regla de la casa).
import {TimePicker} from '@mui/x-date-pickers/TimePicker';

import PickerFrame, {textFieldSlotPropsOf} from '@/datePickers/PickerFrame.jsx';
import {pickerTimeOf, timeTextOf} from '@/datePickers/pickerValues.js';
import {usePickerField} from '@/datePickers/usePickerField.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|null|undefined} props.value 'HH:mm' o ''
 * @param {(value: string) => void} props.onChange recibe 'HH:mm' ('' al borrar o a medias)
 * @param {() => void} [props.onBlur]
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText]
 * @param {string} [props.minTime] 'HH:mm'
 * @param {string} [props.maxTime] 'HH:mm'
 * @param {number} [props.minutesStep] de cuánto en cuánto van los minutos (30 para citas de media hora)
 * @param {boolean} [props.disabled]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {object} [props.pickerProps] lo demás del TimePicker de MUI X que aquí no tiene nombre (views, shouldDisableTime,
 *     slots, slotProps…); value y onChange son del campo
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function TimeInput({
    name, label, value, onChange, onBlur, error, helperText = ' ', minTime, maxTime, minutesStep, disabled = false, inputRef,
    pickerProps, texts,
    ...unknownProps
}) {
    warnUnknownProps('TimeInput', unknownProps);
    const field = usePickerField({name, kind: 'time', error, texts});

    return (
        <PickerFrame inputId={field.inputId} label={label} language={field.language}>
            <TimePicker
                {...pickerProps}
                format={field.formats.time}
                ampm={field.formats.ampm}
                value={pickerTimeOf(value)}
                minTime={pickerTimeOf(minTime) ?? undefined}
                maxTime={pickerTimeOf(maxTime) ?? undefined}
                disabled={disabled}
                {...(minutesStep && {minutesStep, timeSteps: {minutes: minutesStep}})}
                inputRef={inputRef}
                onChange={(pickedValue) => onChange(timeTextOf(pickedValue))}
                onClose={() => {
                    pickerProps?.onClose?.();
                    onBlur?.();
                }}
                slotProps={textFieldSlotPropsOf(
                    {id: field.inputId, name, onBlur, error: Boolean(field.errorText), helperText: field.errorText ?? helperText},
                    pickerProps,
                )}
            />
        </PickerFrame>
    );
}
