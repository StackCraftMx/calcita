// Campo de MES suelto con el DatePicker de MUI X en meses y años (@stackcraftmx/calcita/date-pickers): el mes de un
// reporte, de un saldo, de un cierre.
//
// Viaja 'AAAA-MM' en texto y se ve con el nombre del mes en el idioma activo («noviembre 2026»). Abre en los meses del año
// que ya tiene; el año se cambia arriba. '' = vacío. Como la fecha, no se pasa por Date (que lo movería de mes según la
// zona el día 1).
//
// Una fecha TECLEADA fuera del tope (minMonth, maxMonth, disablePast, disableFuture) avisa al salir del campo o, con limitMode fix, se vuelve
// el tope (pickerLimits.js). El calendario ya apagaba lo de fuera, pero tecleada entraba sin aviso.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaMonthInput con defaultProps, styleOverrides de
// sus partes (picker) y slots/slotProps para cambiarlas.
//
// Genérico del paquete: function (regla de la casa).
import {DatePicker} from '@mui/x-date-pickers/DatePicker';

import PickerFrame, {textFieldSlotPropsOf} from '@/datePickers/PickerFrame.jsx';
import {monthTextOf, pickerMonthOf} from '@/datePickers/pickerValues.js';
import {usePickerField} from '@/datePickers/usePickerField.js';
import {PICKER_KIND} from '@/datePickers/pickerLimits.js';
import {usePickerLimits} from '@/datePickers/usePickerLimits.js';
import {LIMIT_MODE, limitFixOf} from '@/inputs/fieldLimits.js';
import {useLimitWarning} from '@/inputs/useLimitWarning.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaMonthInput)
const THEME_NAME = 'CalcitaMonthInput';
const MonthInputPicker = piecePart(THEME_NAME, 'Picker', DatePicker);

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
 * @param {import('react').ReactNode} [props.helperText] ya traducida; texto o un elemento con su propio estilo
 * @param {string} [props.minMonth] 'AAAA-MM'
 * @param {string} [props.maxMonth] 'AAAA-MM'
 * @param {boolean} [props.disableFuture] p. ej. el mes de un reporte que ya cerró
 * @param {boolean} [props.disablePast]
 * @param {boolean} [props.disabled]
 * @param {string} [props.format] cómo se ve el mes, con los códigos de dayjs ('MMM YYYY' enseña «nov 2026»); por omisión el nombre
 *     completo del mes y el año
 * @param {boolean} [props.required] obligatorio: el asterisco en la etiqueta y, como en MUI, required en el campo
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {'warn'|'fix'} [props.limitMode] lo que pasa con una fecha TECLEADA fuera del tope: LIMIT_MODE.warn lo dice en rojo
 *     (por omisión, o el de ToolkitProvider) y LIMIT_MODE.fix la vuelve el tope al salir del campo, con una nota que lo dice
 * @param {(fix: ReturnType<typeof import('@/inputs/fieldLimits.js').limitFixOf>) => void} [props.onLimitFix]
 *     con fix, cada vez que se corrige sola: qué tope, qué se había tecleado y en qué quedó
 * @param {object} [props.pickerProps] lo demás del DatePicker de MUI X que aquí no tiene nombre (shouldDisableMonth, slots,
 *     slotProps…); value y onChange son del campo
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación
 *     ({required: 'Elija la fecha', min: 'Desde mañana'}): gana al de Calcita y al de los textos
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function MonthInputContent(props) {
    const {
        name, label, value, onChange, onBlur, error, helperText = ' ', minMonth, maxMonth, disableFuture = false, disablePast = false,
        disabled = false, required = false, format, inputRef, limitMode, onLimitFix, pickerProps, messages, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const field = usePickerField({name, kind: 'month', error, label, messages, texts});
    // la fecha tecleada fuera del tope: el aviso (el error del formulario gana) o, con fix, el tope al salir del campo
    const limits = usePickerLimits(PICKER_KIND.month, {min: minMonth, max: maxMonth, disablePast, disableFuture});
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

    return (
        <PickerFrame inputId={field.inputId} label={label} required={required} language={field.language}>
            <MonthInputPicker
                {...pickerProps}
                views={MONTH_VIEWS}
                openTo="month"
                // el formato de la pantalla gana al de la casa (antes el de la casa iba después y lo pisaba sin avisar)
                format={format ?? pickerProps?.format ?? field.formats.month}
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
                    {id: field.inputId, name, onBlur: handleBlur, required, error: Boolean(limit.errorText), helperText: limit.errorText ?? limit.noticeText ?? helperText},
                    pickerProps,
                )}
            />
        </PickerFrame>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const MonthInput = withPieceSlots(MonthInputContent, THEME_NAME);
export default MonthInput;
