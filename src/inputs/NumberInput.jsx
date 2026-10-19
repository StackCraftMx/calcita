// Campo de NÚMERO suelto: se escribe y se lee con separador de miles («2,850,000.50») y al formulario (y al servidor)
// llega el texto limpio («2850000.50»), que es lo que lee Money.fromString sin pasar por decimales.
//
// Por qué no type="number": pinta flechitas que nadie usa, no agrupa miles, acepta «e» y en el teléfono deja escribir
// cosas raras. Este usa el teclado numérico (inputMode decimal) y alinea a la derecha, como en una hoja de cálculo.
//
// Mientras se escribe se respeta lo tecleado (no completa decimales a medias); al salir se completan con ceros.
//
// Genérico del paquete: function (regla de la casa).
import {useId, useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';
import {cleanNumberText, completeDecimals, groupThousands} from '@/inputs/numberText.js';

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
 * @param {boolean} [props.disabled]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function NumberInput({
    name, label, value, onChange, onBlur, error, helperText = ' ', decimals = 2, allowNegative = false, prefix, suffix, maxDigits = 17,
    disabled = false, inputRef, texts,
}) {
    const {t} = useToolkitTranslation('common', texts);
    const generatedId = useId();
    const inputId = `${name ?? 'number'}-${generatedId}`;
    const [isTyping, setIsTyping] = useState(false);
    const errorText = translateValidationMessage(t, error);
    const valueText = value === null || value === undefined ? '' : String(value);
    // escribiendo: lo que hay; fuera del campo: con sus decimales completos
    const shownText = groupThousands(isTyping ? valueText : completeDecimals(valueText, decimals));

    return (
        <FieldFrame inputId={inputId} label={label}>
            <TextField
                name={name}
                id={inputId}
                inputRef={inputRef}
                value={shownText}
                disabled={disabled}
                size="small"
                fullWidth
                error={Boolean(errorText)}
                helperText={errorText ?? helperText}
                onFocus={() => setIsTyping(true)}
                onChange={(event) => onChange(cleanNumberText(event.target.value, decimals, allowNegative))}
                onBlur={() => {
                    setIsTyping(false);
                    const completedText = completeDecimals(cleanNumberText(valueText, decimals, allowNegative), decimals);
                    if (completedText !== valueText) {
                        onChange(completedText);
                    }
                    onBlur?.();
                }}
                slotProps={{
                    htmlInput: {inputMode: 'decimal', maxLength: maxDigits + SEPARATORS_ROOM, style: {textAlign: 'right'}},
                    input: {
                        startAdornment: prefix ? <InputAdornment position="start">{prefix}</InputAdornment> : undefined,
                        endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : undefined,
                    },
                }}
            />
        </FieldFrame>
    );
}
