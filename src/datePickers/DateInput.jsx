// Campo de FECHA suelto con el DatePicker de MUI X (@stackcraftmx/calcita/date-pickers), con la etiqueta arriba como los
// demás campos del paquete.
//
// Al formulario (y al servidor) viaja la fecha de calendario 'AAAA-MM-DD' en texto; en pantalla se ve DD/MM/AAAA en español
// y MM/DD/AAAA en inglés, con el calendario y sus textos en el idioma activo. '' = sin fecha. Una fecha de calendario no
// tiene hora ni zona: nunca se pasa por Date (que la movería de día según la zona).
//
// Cada campo trae su LocalizationProvider con dayjs (PickerFrame): la pantalla no tiene que poner nada alrededor.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaDateInput con defaultProps, styleOverrides de
// sus partes (picker) y slots/slotProps para cambiarlas.
//
// Genérico del paquete: function (regla de la casa).
import dayjs from 'dayjs';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import PickerFrame, {textFieldSlotPropsOf} from '@/datePickers/PickerFrame.jsx';
import {CALENDAR_DATE_FORMAT} from '@/datePickers/pickerValues.js';
import {usePickerField} from '@/datePickers/usePickerField.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaDateInput)
const THEME_NAME = 'CalcitaDateInput';
const DateInputPicker = piecePart(THEME_NAME, 'Picker', DatePicker);

export {CALENDAR_DATE_FORMAT};

/**
 * Una fecha de calendario 'AAAA-MM-DD' como la quiere el DatePicker; null si está vacía.
 *
 * @param {string|null|undefined} calendarDate
 * @returns {import('dayjs').Dayjs|null}
 */
function pickerValueOf(calendarDate) {
    // dayjs lee 'AAAA-MM-DD' como día local (a diferencia de new Date, que lo toma en UTC y lo mueve de día)
    return calendarDate ? dayjs(calendarDate) : null;
}

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|null|undefined} props.value 'AAAA-MM-DD' o ''
 * @param {(value: string) => void} props.onChange recibe 'AAAA-MM-DD' ('' al borrar o con una fecha a medias)
 * @param {() => void} [props.onBlur]
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText]
 * @param {string} [props.minDate] 'AAAA-MM-DD'
 * @param {string} [props.maxDate] 'AAAA-MM-DD'
 * @param {boolean} [props.disableFuture] p. ej. una fecha de nacimiento
 * @param {boolean} [props.disablePast] p. ej. una cita
 * @param {'day'|'month'|'year'} [props.openTo] por dónde abre el calendario (year para un nacimiento)
 * @param {boolean} [props.disabled]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {object} [props.pickerProps] lo demás del DatePicker de MUI X que aquí no tiene nombre (shouldDisableDate, slots,
 *     slotProps…); value y onChange son del campo
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación
 *     ({required: 'Elija la fecha', min: 'Desde mañana'}): gana al de Calcita y al de los textos
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function DateInputContent(props) {
    const {
        name, label, value, onChange, onBlur, error, helperText = ' ', minDate, maxDate, disableFuture = false, disablePast = false,
        openTo = 'day', disabled = false, inputRef, pickerProps, messages, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {language, inputId, errorText, formats} = usePickerField({name, kind: 'date', error, label, messages, texts});

    return (
        <PickerFrame inputId={inputId} label={label} language={language}>
            <DateInputPicker
                {...pickerProps}
                format={formats.date}
                value={pickerValueOf(value)}
                minDate={pickerValueOf(minDate) ?? undefined}
                maxDate={pickerValueOf(maxDate) ?? undefined}
                disableFuture={disableFuture}
                disablePast={disablePast}
                disabled={disabled}
                openTo={openTo}
                views={openTo === 'year' ? ['year', 'month', 'day'] : pickerProps?.views}
                inputRef={inputRef}
                // una fecha a medias (25/1_/____) todavía no es fecha: viaja como vacía hasta que se complete
                onChange={(pickedDate) => onChange(pickedDate?.isValid() ? pickedDate.format(CALENDAR_DATE_FORMAT) : '')}
                onClose={() => {
                    pickerProps?.onClose?.();
                    onBlur?.();
                }}
                slotProps={textFieldSlotPropsOf({id: inputId, name, onBlur, error: Boolean(errorText), helperText: errorText ?? helperText}, pickerProps)}
            />
        </PickerFrame>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const DateInput = withPieceSlots(DateInputContent, THEME_NAME);
export default DateInput;
