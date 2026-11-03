// Campo de MES suelto con el DatePicker de MUI X en meses y años (@stackcraftmx/calcita/date-pickers): el mes de un
// reporte, de un saldo, de un cierre.
//
// Viaja 'AAAA-MM' en texto y se ve con el nombre del mes en el idioma activo («noviembre 2026»). Abre en los meses del año
// que ya tiene; el año se cambia arriba. '' = vacío. Como la fecha, no se pasa por Date (que lo movería de mes según la
// zona el día 1).
//
// Genérico del paquete: function (regla de la casa).
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import PickerFrame, {textFieldSlotPropsOf} from '@/datePickers/PickerFrame.jsx';
import {monthTextOf, pickerMonthOf} from '@/datePickers/pickerValues.js';
import {usePickerField} from '@/datePickers/usePickerField.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// primero el año y luego el mes: el selector abre en los meses y el año se cambia con su botón de arriba
const MONTH_VIEWS = ['year', 'month'];

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|null|undefined} props.value 'AAAA-MM' o ''
 * @param {(value: string) => void} props.onChange recibe 'AAAA-MM' ('' al borrar o a medias)
 * @param {() => void} [props.onBlur]
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText]
 * @param {string} [props.minMonth] 'AAAA-MM'
 * @param {string} [props.maxMonth] 'AAAA-MM'
 * @param {boolean} [props.disableFuture] p. ej. el mes de un reporte que ya cerró
 * @param {boolean} [props.disablePast]
 * @param {boolean} [props.disabled]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {object} [props.pickerProps] lo demás del DatePicker de MUI X que aquí no tiene nombre (shouldDisableMonth, slots,
 *     slotProps…); value y onChange son del campo
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación
 *     ({required: 'Elija la fecha', min: 'Desde mañana'}): gana al de Calcita y al de los textos
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function MonthInput({
    name, label, value, onChange, onBlur, error, helperText = ' ', minMonth, maxMonth, disableFuture = false, disablePast = false,
    disabled = false, inputRef, pickerProps, messages, texts,
    ...unknownProps
}) {
    warnUnknownProps('MonthInput', unknownProps);
    const field = usePickerField({name, kind: 'month', error, label, messages, texts});

    return (
        <PickerFrame inputId={field.inputId} label={label} language={field.language}>
            <DatePicker
                {...pickerProps}
                views={MONTH_VIEWS}
                openTo="month"
                format={field.formats.month}
                value={pickerMonthOf(value)}
                minDate={pickerMonthOf(minMonth) ?? undefined}
                maxDate={pickerMonthOf(maxMonth) ?? undefined}
                disableFuture={disableFuture}
                disablePast={disablePast}
                disabled={disabled}
                inputRef={inputRef}
                onChange={(pickedValue) => onChange(monthTextOf(pickedValue))}
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
