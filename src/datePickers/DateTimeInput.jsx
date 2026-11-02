// Campo de FECHA CON HORA suelto con el DateTimePicker de MUI X (@stackcraftmx/calcita/date-pickers), para un instante:
// una cita, un envío programado, «posponer hasta».
//
// Viaja como instante en UTC ('2026-11-01T18:30:00Z') y se pinta en la zona del proveedor (ToolkitProvider timeZone),
// rotulada abajo con su nombre («Hora estándar central»): quien lo ve sabe en qué hora está escribiendo aunque su equipo
// esté en otra zona. Lee también lo que llega del servidor con desfase ('…-06:00'). '' = vacío. La hora sale de 24 horas o
// con a.m. y p.m. según el hourCycle del proveedor.
//
// Para una hora del día sin fecha («abre a las 09:00») va TimeInput; para una fecha sin hora, DateInput.
//
// Genérico del paquete: function (regla de la casa).
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';

import PickerFrame, {textFieldSlotPropsOf} from '@/datePickers/PickerFrame.jsx';
import {instantTextOf, pickerInstantOf, timeZoneNameOf} from '@/datePickers/pickerValues.js';
import {usePickerField} from '@/datePickers/usePickerField.js';
import {intlLocaleOf} from '@/toolkit/toolkitSettings.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// entre la ayuda de la pantalla y el nombre de la zona
const HELPER_SEPARATOR = ' · ';

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|null|undefined} props.value el instante ('2026-11-01T18:30:00Z' o con desfase) o ''
 * @param {(value: string) => void} props.onChange recibe el instante en UTC ('' al borrar o a medias)
 * @param {() => void} [props.onBlur]
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] ya traducida; va antes del nombre de la zona
 * @param {string} [props.minDateTime] instante
 * @param {string} [props.maxDateTime] instante
 * @param {boolean} [props.disableFuture]
 * @param {boolean} [props.disablePast] p. ej. un envío programado
 * @param {number} [props.minutesStep] de cuánto en cuánto van los minutos (15 para citas de cuarto de hora)
 * @param {string} [props.timeZone] otra zona que la del proveedor (la de una sucursal); rotulada igual
 * @param {boolean} [props.showTimeZone] false quita el nombre de la zona de abajo (por omisión se ve)
 * @param {string} [props.timeZoneLabel] ya traducido, en lugar del nombre que da el navegador
 * @param {boolean} [props.disabled]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {object} [props.pickerProps] lo demás del DateTimePicker de MUI X que aquí no tiene nombre (views, shouldDisableDate,
 *     slots, slotProps…); value y onChange son del campo
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function DateTimeInput({
    name, label, value, onChange, onBlur, error, helperText, minDateTime, maxDateTime, disableFuture = false, disablePast = false,
    minutesStep, timeZone, showTimeZone = true, timeZoneLabel, disabled = false, inputRef, pickerProps, texts,
    ...unknownProps
}) {
    warnUnknownProps('DateTimeInput', unknownProps);
    const field = usePickerField({name, kind: 'dateTime', error, texts});
    const {languages} = useToolkitSettings();
    const shownTimeZone = timeZone ?? field.timeZone;
    const zoneText = showTimeZone ? (timeZoneLabel ?? timeZoneNameOf(shownTimeZone, intlLocaleOf(field.language, languages))) : null;
    const helperLine = [helperText, zoneText].filter(Boolean).join(HELPER_SEPARATOR) || ' ';

    return (
        <PickerFrame inputId={field.inputId} label={label} language={field.language}>
            <DateTimePicker
                {...pickerProps}
                timezone={shownTimeZone}
                format={field.formats.dateTime}
                ampm={field.formats.ampm}
                value={pickerInstantOf(value, shownTimeZone)}
                minDateTime={pickerInstantOf(minDateTime, shownTimeZone) ?? undefined}
                maxDateTime={pickerInstantOf(maxDateTime, shownTimeZone) ?? undefined}
                disableFuture={disableFuture}
                disablePast={disablePast}
                disabled={disabled}
                {...(minutesStep && {minutesStep, timeSteps: {minutes: minutesStep}})}
                inputRef={inputRef}
                onChange={(pickedValue) => onChange(instantTextOf(pickedValue))}
                onClose={() => {
                    pickerProps?.onClose?.();
                    onBlur?.();
                }}
                slotProps={textFieldSlotPropsOf(
                    {id: field.inputId, name, onBlur, error: Boolean(field.errorText), helperText: field.errorText ?? helperLine},
                    pickerProps,
                )}
            />
        </PickerFrame>
    );
}
