// Campo de HORA suelto con el TimePicker de MUI X (@stackcraftmx/calcita/date-pickers), para una hora del día sin fecha:
// la hora de una cita en un día ya elegido, el horario de una sucursal, «recordar a las 08:00».
//
// Viaja 'HH:mm' de 24 horas aunque en pantalla se vea con a.m. y p.m. (el hourCycle del proveedor decide cómo se ve, no
// cómo viaja). Una hora del día no tiene zona: no se pasa por Date ni por UTC. '' = vacía.
//
// Para un instante (fecha y hora de algo que pasa una vez) va DateTimeInput, que sí viaja en UTC.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaTimeInput con defaultProps, styleOverrides de
// sus partes (picker) y slots/slotProps para cambiarlas.
//
// Genérico del paquete: function (regla de la casa).
import {TimePicker} from '@mui/x-date-pickers/TimePicker';

import PickerFrame, {textFieldSlotPropsOf} from '@/datePickers/PickerFrame.jsx';
import {DEFAULT_MINUTES_STEP, pickerTimeOf, timeTextOf} from '@/datePickers/pickerValues.js';
import {usePickerField} from '@/datePickers/usePickerField.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaTimeInput)
const THEME_NAME = 'CalcitaTimeInput';
const TimeInputPicker = piecePart(THEME_NAME, 'Picker', TimePicker);

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|null|undefined} props.value 'HH:mm' o ''
 * @param {(value: string) => void} props.onChange recibe 'HH:mm' ('' al borrar o a medias)
 * @param {() => void} [props.onBlur]
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {import('react').ReactNode} [props.helperText] ya traducida; texto o un elemento con su propio estilo
 * @param {string} [props.minTime] 'HH:mm'
 * @param {string} [props.maxTime] 'HH:mm'
 * @param {number} [props.minutesStep] de cuánto en cuánto van los minutos; por omisión de uno en uno (30 para citas de
 *     media hora)
 * @param {boolean} [props.disabled]
 * @param {string} [props.format] cómo se ve la hora, con los códigos de dayjs ('hh:mm a' con ampm en pickerProps); por omisión
 *     HH:mm o el reloj de ToolkitProvider hourCycle
 * @param {boolean} [props.required] obligatorio: el asterisco en la etiqueta y, como en MUI, required en el campo
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {object} [props.pickerProps] lo demás del TimePicker de MUI X que aquí no tiene nombre (views, shouldDisableTime,
 *     slots, slotProps…); value y onChange son del campo
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación
 *     ({required: 'Elija la fecha', min: 'Desde mañana'}): gana al de Calcita y al de los textos
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function TimeInputContent(props) {
    const {
        name, label, value, onChange, onBlur, error, helperText = ' ', minTime, maxTime, minutesStep = DEFAULT_MINUTES_STEP, disabled = false, required = false, format, inputRef,
        pickerProps, messages, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const field = usePickerField({name, kind: 'time', error, label, messages, texts});

    return (
        <PickerFrame inputId={field.inputId} label={label} required={required} language={field.language}>
            <TimeInputPicker
                {...pickerProps}
                // el formato y el reloj de la pantalla ganan a los de la casa (antes iban después y los pisaban sin avisar)
                format={format ?? pickerProps?.format ?? field.formats.time}
                ampm={pickerProps?.ampm ?? field.formats.ampm}
                value={pickerTimeOf(value)}
                minTime={pickerTimeOf(minTime) ?? undefined}
                maxTime={pickerTimeOf(maxTime) ?? undefined}
                disabled={disabled}
                minutesStep={minutesStep}
                timeSteps={{minutes: minutesStep, ...pickerProps?.timeSteps}}
                inputRef={inputRef}
                onChange={(pickedValue) => onChange(timeTextOf(pickedValue))}
                onClose={() => {
                    pickerProps?.onClose?.();
                    onBlur?.();
                }}
                slotProps={textFieldSlotPropsOf(
                    {id: field.inputId, name, onBlur, required, error: Boolean(field.errorText), helperText: field.errorText ?? helperText},
                    pickerProps,
                )}
            />
        </PickerFrame>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const TimeInput = withPieceSlots(TimeInputContent, THEME_NAME);
export default TimeInput;
