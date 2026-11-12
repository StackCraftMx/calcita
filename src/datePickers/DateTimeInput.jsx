// Campo de FECHA CON HORA suelto con el DateTimePicker de MUI X (@stackcraftmx/calcita/date-pickers), para un instante:
// una cita, un envío programado, «posponer hasta».
//
// Viaja como instante en UTC ('2026-11-01T18:30:00Z') y se pinta en la zona del proveedor (ToolkitProvider timeZone),
// rotulada abajo con su nombre («Hora estándar central»): quien lo ve sabe en qué hora está escribiendo aunque su equipo
// esté en otra zona. Lee también lo que llega del servidor con desfase ('…-06:00'). '' = vacío. La hora sale de 24 horas o
// con a.m. y p.m. según el hourCycle del proveedor.
//
// Los minutos van de uno en uno (minutesStep los cambia). Para «al menos N minutos después de ahora» (publicar con
// anticipación) está minimumMinutesFromNow: el mínimo se recorre solo con el reloj mientras la pantalla está abierta. Para
// «el fin, al menos N minutos después del inicio», minDateTime={instantPlusMinutes(startsAt, N)}. Con formik, las mismas
// reglas en yup: minutesFromNowRule y minutesAfterRule (el servidor vuelve a revisar).
//
// Para una hora del día sin fecha («abre a las 09:00») va TimeInput; para una fecha sin hora, DateInput.
//
// Una fecha TECLEADA fuera del tope (minDateTime, maxDateTime, minimumMinutesFromNow, disablePast, disableFuture) avisa al salir del campo o, con limitMode fix, se vuelve
// el tope (pickerLimits.js). El calendario ya apagaba lo de fuera, pero tecleada entraba sin aviso.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaDateTimeInput con defaultProps, styleOverrides de
// sus partes (picker) y slots/slotProps para cambiarlas.
//
// Genérico del paquete: function (regla de la casa).
import {DateTimePicker} from '@mui/x-date-pickers/DateTimePicker';

import PickerFrame, {textFieldSlotPropsOf} from '@/datePickers/PickerFrame.jsx';
import {
    DEFAULT_MINUTES_STEP, instantTextOf, pickerInstantOf, timeZoneNameOf,
} from '@/datePickers/pickerValues.js';
import {usePickerField} from '@/datePickers/usePickerField.js';
import {PICKER_KIND} from '@/datePickers/pickerLimits.js';
import {usePickerLimits} from '@/datePickers/usePickerLimits.js';
import {LIMIT_MODE, limitFixOf} from '@/inputs/fieldLimits.js';
import {useLimitWarning} from '@/inputs/useLimitWarning.js';
import {intlLocaleOf} from '@/toolkit/toolkitSettings.js';
import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaDateTimeInput)
const THEME_NAME = 'CalcitaDateTimeInput';
const DateTimeInputPicker = piecePart(THEME_NAME, 'Picker', DateTimePicker);

// entre la ayuda de la pantalla y el nombre de la zona
const HELPER_SEPARATOR = ' · ';

/**
 * La línea de ayuda de abajo: la nota de la pantalla y el nombre de la zona horaria, en ese orden. Con texto se juntan en una
 * frase, como siempre. Con un elemento (una advertencia con su color) la zona va a su lado como texto aparte: antes se juntaba
 * como texto y salía «[object Object] · Hora estándar central».
 *
 * @param {import('react').ReactNode} helperText
 * @param {string|null} zoneText
 * @returns {import('react').ReactNode}
 */
function helperLineOf(helperText, zoneText) {
    // sin nota: solo la zona (o un espacio, para que el campo no brinque cuando llegue un error)
    if (!helperText) {
        return zoneText || ' ';
    }
    if (!zoneText) {
        return helperText;
    }
    if (typeof helperText === 'string' || typeof helperText === 'number') {
        return `${helperText}${HELPER_SEPARATOR}${zoneText}`;
    }
    return <>{helperText}{HELPER_SEPARATOR}{zoneText}</>;
}

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|null|undefined} props.value el instante ('2026-11-01T18:30:00Z' o con desfase) o ''
 * @param {(value: string) => void} props.onChange recibe el instante en UTC ('' al borrar o a medias)
 * @param {() => void} [props.onBlur]
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {import('react').ReactNode} [props.helperText] ya traducida; va antes del nombre de la zona. Texto, o un elemento con su
 *     propio estilo (una advertencia en rojo): el nombre de la zona se queda a su lado sin teñirse
 * @param {string} [props.minDateTime] instante (el fin de algo: instantPlusMinutes(startsAt, 30))
 * @param {number} [props.minimumMinutesFromNow] al menos tantos minutos después de ahora; se recorre con el reloj
 * @param {string} [props.maxDateTime] instante
 * @param {boolean} [props.disableFuture]
 * @param {boolean} [props.disablePast] p. ej. un envío programado
 * @param {number} [props.minutesStep] de cuánto en cuánto van los minutos; por omisión de uno en uno (15 para citas de
 *     cuarto de hora)
 * @param {string} [props.timeZone] otra zona que la del proveedor (la de una sucursal); rotulada igual
 * @param {boolean} [props.showTimeZone] false quita el nombre de la zona de abajo (por omisión se ve)
 * @param {string} [props.timeZoneLabel] ya traducido, en lugar del nombre que da el navegador
 * @param {boolean} [props.disabled]
 * @param {string} [props.format] cómo se ven la fecha y la hora, con los códigos de dayjs ('DD/MMM/YYYY HH:mm'); por omisión
 *     DD/MM/YYYY HH:mm en español y el reloj de ToolkitProvider hourCycle
 * @param {boolean} [props.required] obligatorio: el asterisco en la etiqueta y, como en MUI, required en el campo
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {'warn'|'fix'} [props.limitMode] lo que pasa con una fecha TECLEADA fuera del tope: LIMIT_MODE.warn lo dice en rojo
 *     (por omisión, o el de ToolkitProvider) y LIMIT_MODE.fix la vuelve el tope al salir del campo, con una nota que lo dice
 * @param {(fix: ReturnType<typeof import('@/inputs/fieldLimits.js').limitFixOf>) => void} [props.onLimitFix]
 *     con fix, cada vez que se corrige sola: qué tope, qué se había tecleado y en qué quedó
 * @param {object} [props.pickerProps] lo demás del DateTimePicker de MUI X que aquí no tiene nombre (views, shouldDisableDate,
 *     slots, slotProps…); value y onChange son del campo
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación
 *     ({required: 'Elija la fecha', min: 'Desde mañana'}): gana al de Calcita y al de los textos
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 * @param {import('@mui/material').SxProps<import('@mui/material').Theme>} [props.sx] los estilos del campo en esta pantalla, encima de los del tema (como en TextInput)
 */
function DateTimeInputContent(props) {
    const {
        name, label, value, onChange, onBlur, error, helperText, minDateTime, minimumMinutesFromNow, maxDateTime, disableFuture = false,
        disablePast = false, minutesStep = DEFAULT_MINUTES_STEP, timeZone, showTimeZone = true, timeZoneLabel, disabled = false, required = false, format, inputRef, limitMode, onLimitFix, pickerProps, messages, texts,
        sx, ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const field = usePickerField({name, kind: 'dateTime', error, label, messages, texts});
    // la fecha tecleada fuera del tope: el aviso (el error del formulario gana) o, con fix, el tope al salir del campo
    const limits = usePickerLimits(PICKER_KIND.dateTime, {min: minDateTime, max: maxDateTime, disablePast, disableFuture, minimumMinutesFromNow, timeZone});
    const limit = useLimitWarning({limitMode, error, validationTextOf: field.validationTextOf, limitProblem: limits.problemOf(value), value, onLimitFix});
    const handleBlur = () => {
        limit.markLeft();
        onBlur?.();
        // OJO: después de la salida y no antes. formik revisa la salida con el valor de la pintada anterior y esa revisión
        // termina después: el aviso de la fecha vieja se quedaba con la fecha ya corregida
        if (limit.mode === LIMIT_MODE.fix) {
            const fixedValue = limits.fixedOf(value);
            if (fixedValue !== value) {
                onChange(fixedValue);
                limit.noteFix(limitFixOf(limits.problemOf(value), value, fixedValue));
            }
        }
    };
    const {languages} = useToolkitSettings();
    const shownTimeZone = timeZone ?? field.timeZone;
    const zoneText = showTimeZone ? (timeZoneLabel ?? timeZoneNameOf(shownTimeZone, intlLocaleOf(field.language, languages))) : null;
    const helperLine = helperLineOf(helperText, zoneText);

    return (
        <PickerFrame inputId={field.inputId} label={label} required={required} language={field.language}>
            <DateTimeInputPicker sx={sx}
                {...pickerProps}
                timezone={shownTimeZone}
                // el formato y el reloj de la pantalla ganan a los de la casa (antes iban después y los pisaban sin avisar)
                format={format ?? pickerProps?.format ?? field.formats.dateTime}
                ampm={pickerProps?.ampm ?? field.formats.ampm}
                value={pickerInstantOf(value, shownTimeZone)}
                // el mínimo que de verdad aplica: el de la pantalla o el de «ahora + N minutos», el más tarde (usePickerLimits)
                minDateTime={pickerInstantOf(limits.screenMin, shownTimeZone) ?? undefined}
                maxDateTime={pickerInstantOf(maxDateTime, shownTimeZone) ?? undefined}
                disableFuture={disableFuture}
                disablePast={disablePast}
                disabled={disabled}
                minutesStep={minutesStep}
                timeSteps={{minutes: minutesStep, ...pickerProps?.timeSteps}}
                inputRef={inputRef}
                onChange={(pickedValue) => onChange(instantTextOf(pickedValue))}
                onClose={() => {
                    pickerProps?.onClose?.();
                    onBlur?.();
                }}
                slotProps={textFieldSlotPropsOf(
                    {id: field.inputId, name, onBlur: handleBlur, required, error: Boolean(limit.errorText), helperText: limit.errorText ?? limit.noticeText ?? helperLine},
                    pickerProps,
                )}
            />
        </PickerFrame>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const DateTimeInput = withPieceSlots(DateTimeInputContent, THEME_NAME);
export default DateTimeInput;
