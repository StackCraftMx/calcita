// Campo de NÚMERO suelto: se escribe y se lee con separador de miles («2,850,000.50») y al formulario (y al servidor)
// llega el texto limpio («2850000.50»), que es lo que lee Money.fromString sin pasar por decimales.
//
// Por qué no type="number": pinta flechitas que nadie usa, no agrupa miles, acepta «e» y en el teléfono deja escribir
// cosas raras. Este usa el teclado numérico (inputMode decimal) y alinea a la derecha, como en una hoja de cálculo.
//
// Mientras se escribe se respeta lo tecleado (no completa decimales a medias); al salir se completan con ceros.
//
// Con min y max (o leídos del esquema, ToolkitProvider limitsFromSchema): lo que se sale avisa al salir del campo
// («No puede ser mayor que 1,000.») o, con limitMode fix, se vuelve el tope al salir (1,500 → 1,000.00) y lo dice en una
// nota («Se ajustó al máximo: 1,000.») y en onLimitFix. fieldLimits.js.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaNumberInput con defaultProps, styleOverrides de
// sus partes (field) y slots/slotProps para cambiarlas.
//
// Genérico del paquete: function (regla de la casa).
import {useId, useState} from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import {useValidationText} from '@/forms/useValidationText.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {LIMIT_MODE, fixedNumberText, limitFixOf, numberLimitProblemOf} from '@/inputs/fieldLimits.js';
import {cleanNumberText, completeDecimals, groupThousands} from '@/inputs/numberText.js';
import {useLimitWarning} from '@/inputs/useLimitWarning.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaNumberInput)
const THEME_NAME = 'CalcitaNumberInput';
const NumberInputField = piecePart(THEME_NAME, 'Field', TextField);

// lo que caben los separadores y el punto además de los dígitos
const SEPARATORS_ROOM = 6;

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|number|null|undefined} props.value el texto limpio ('2850000.50'); '' = vacío
 * @param {(value: string) => void} props.onChange recibe el texto limpio
 * @param {() => void} [props.onBlur]
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText]
 * @param {number} [props.decimals] por omisión 2
 * @param {boolean} [props.allowNegative]
 * @param {import('react').ReactNode} [props.prefix] p. ej. «$»
 * @param {import('react').ReactNode} [props.suffix] p. ej. «MXN» o «%»
 * @param {number} [props.maxDigits] tope de dígitos (por omisión 17)
 * @param {string|number} [props.min] el valor más chico que se acepta (1000 o '0.50'); vacío no se revisa (eso es required)
 * @param {string|number} [props.max] el valor más grande que se acepta
 * @param {'warn'|'fix'} [props.limitMode] lo que pasa al salirse de min o max: LIMIT_MODE.warn lo dice en rojo (por omisión, o
 *     el de ToolkitProvider) y LIMIT_MODE.fix lo vuelve el tope al salir del campo
 * @param {(fix: ReturnType<typeof import('@/inputs/fieldLimits.js').limitFixOf>) => void} [props.onLimitFix]
 *     con fix, cada vez que se corrige solo: qué tope, qué se había escrito y en qué quedó
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.required] obligatorio: el asterisco en la etiqueta y, como en MUI, required en el campo
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {object} [props.sx] los estilos del campo en esta pantalla, encima de los del tema (como en TextInput)
 * @param {string} [props.placeholder] ya traducido; el ejemplo de qué escribir (se va al escribir)
 * @param {boolean} [props.autoFocus] el cursor entra solo al pintarse
 * @param {string} [props.id] el id del campo; por omisión uno propio (la etiqueta lo usa)
 * @param {boolean} [props.readOnly] se lee y se enfoca, pero no se escribe: un dato calculado en un formulario (a diferencia
 *     de disabled, no se ve apagado y el lector de pantalla lo sigue leyendo)
 * @param {(event: import('react').FocusEvent<HTMLInputElement>) => void} [props.onFocus] al entrar al campo, después del suyo
 * @param {(event: import('react').KeyboardEvent<HTMLInputElement>) => void} [props.onKeyDown] cada tecla (Enter para guardar
 *     un renglón, por ejemplo). Lo demás de TextField de MUI va en slotProps.field
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación
 *     ({required: 'Escriba el RFC', matches: 'El RFC lleva 12 o 13 caracteres'}): gana al de Calcita y al de los textos
 * @param {object} [props.texts] se acepta como en los demás campos; este no tiene textos propios (su error usa `messages`)
 */
function NumberInputContent(props) {
    const {
        name, label, value, onChange, onBlur, error, helperText = ' ', decimals = 2, allowNegative = false, prefix, suffix, maxDigits = 17,
        min, max, limitMode, onLimitFix, disabled = false, required = false, inputRef, sx, placeholder, autoFocus, id, readOnly = false, onFocus,
        onKeyDown, messages, texts: unusedTexts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    // el texto del error: el de la pantalla (messages), el del proyecto para este campo o el de Calcita
    const validationTextOf = useValidationText({name, label, messages});
    const generatedId = useId();
    const inputId = id ?? `${name ?? 'number'}-${generatedId}`;
    const [isTyping, setIsTyping] = useState(false);
    const valueText = value === null || value === undefined ? '' : String(value);
    // el error del formulario o el del tope (también revisa los topes: uno mal escrito truena aquí con su mensaje)
    const limit = useLimitWarning({
        limitMode, error, validationTextOf, value: valueText, onLimitFix, limitProblem: numberLimitProblemOf(valueText, {min, max}),
    });
    const errorText = limit.errorText;
    // escribiendo: lo que hay; fuera del campo: con sus decimales completos
    const shownText = groupThousands(isTyping ? valueText : completeDecimals(valueText, decimals));

    return (
        <FieldFrame inputId={inputId} label={label} required={required}>
            <NumberInputField
                name={name}
                id={inputId}
                inputRef={inputRef}
                value={shownText}
                disabled={disabled}
                required={required}
                size="small"
                fullWidth
                sx={sx}
                placeholder={placeholder}
                autoFocus={autoFocus}
                onKeyDown={onKeyDown}
                error={Boolean(errorText)}
                helperText={errorText ?? limit.noticeText ?? helperText}
                onFocus={(event) => {
                    const input = event.target;
                    // OJO: al entrar, el texto cambia («50,000.00» → «50,000») y el navegador pierde lo seleccionado; al entrar
                    // con Tab estaba todo seleccionado y lo tecleado se pegaba al final (50,000,100,000). Si estaba todo
                    // seleccionado, se vuelve a seleccionar ya pintado; con un clic (el cursor en un lugar) no se toca
                    const wasAllSelected = input.value.length > 0 && input.selectionStart === 0 && input.selectionEnd === input.value.length;
                    setIsTyping(true);
                    if (wasAllSelected) {
                        requestAnimationFrame(() => {
                            if (document.activeElement === input) {
                                input.select();
                            }
                        });
                    }
                    onFocus?.(event);
                }}
                onChange={(event) => onChange(cleanNumberText(event.target.value, decimals, allowNegative))}
                onBlur={() => {
                    setIsTyping(false);
                    limit.markLeft();
                    const completedText = completeDecimals(cleanNumberText(valueText, decimals, allowNegative), decimals);
                    // con fix, lo que se sale del tope se vuelve el tope
                    const fixedText = limit.mode === LIMIT_MODE.fix ? fixedNumberText(completedText, {min, max}, decimals) : completedText;
                    // OJO, trampa pagada: formik revisa la salida del campo con el valor de la pintada anterior (900,000) y esa
                    // revisión termina después de la del valor nuevo: el aviso viejo se quedaba con el monto ya corregido. Al
                    // corregir al tope, primero la salida y después el valor
                    if (fixedText !== completedText) {
                        onBlur?.();
                        onChange(fixedText);
                        limit.noteFix(limitFixOf(numberLimitProblemOf(completedText, {min, max}), completedText, fixedText));
                        return;
                    }
                    if (completedText !== valueText) {
                        onChange(completedText);
                    }
                    onBlur?.();
                }}
                slotProps={{
                    htmlInput: {inputMode: 'decimal', maxLength: maxDigits + SEPARATORS_ROOM, readOnly, style: {textAlign: 'right'}},
                    input: {
                        startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : undefined,
                        endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : undefined,
                    },
                }}
            />
        </FieldFrame>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const NumberInput = withPieceSlots(NumberInputContent, THEME_NAME);
export default NumberInput;
