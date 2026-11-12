// Campo de texto con máscara: un teléfono, una CLABE, un RFC, un folio fiscal. Mientras se escribe se ven los separadores
// («555 123 4567») y al formulario llega el valor LIMPIO («5551234567»), que es lo que valida y guarda el servidor. Pegar un
// número con otros separadores también sirve: se queda con los dígitos o letras que caben.
//
// Es TextInput por dentro (la etiqueta arriba, la ⓧ para borrar, el error y la ayuda, el renglón en una FormSection), con la
// máscara de inputMasks.js: mask es el nombre de una de INPUT_MASK ('phone', 'clabe', 'rfc', 'curp', 'uuid'…) o un patrón
// propio ('AAA-999'). Escribir en medio no manda el cursor al final.
//
// Con formik: FormMaskedField (/forms); con react-hook-form, el del mismo nombre (/react-hook-form).
//
// Genérico del paquete: function (regla de la casa).
import {useLayoutEffect, useRef} from 'react';

import {caretPositionOf, maskPatternOf, maskedTextOf, rawValueOf} from '@/inputs/inputMasks.js';
import TextInput from '@/inputs/TextInput.jsx';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el teclado del teléfono según lo que cabe: solo dígitos abre el numérico
const NUMERIC_ONLY = /^[^AXH]*$/;

/**
 * @param {object} props las de TextInput (label, helperText, error, placeholder, disabled, slotProps…), y:
 * @param {string} props.mask 'phone' | 'postalCode' | 'clabe' | 'card' | 'rfc' | 'curp' | 'uuid' (INPUT_MASK) o un patrón propio
 *     con 9 (dígito), A (letra), X (letra o dígito) y H (hexadecimal)
 * @param {string|null|undefined} props.value el valor limpio, sin separadores
 * @param {(value: string) => void} props.onChange recibe el valor limpio
 * @param {string} props.label ya traducido
 * @param {string} [props.name]
 * @param {() => void} [props.onBlur]
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText]
 * @param {string} [props.placeholder] ya traducido; por omisión ninguno (un ejemplo con la forma ayuda: «555 123 4567»)
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {boolean} [props.disabled]
 * @param {Record<string, string|object>} [props.messages] el texto del error de este campo, por regla de validación: gana al de
 *     Calcita y al de los textos
 * @param {object} [props.slotProps]
 * @param {object} [props.texts]
 * @param {import('@mui/material').SxProps<import('@mui/material').Theme>} [props.sx] los estilos del campo en esta pantalla, encima de los del tema (como en TextInput)
 */
export default function MaskedInput({mask, value, onChange, inputRef, slotProps, ...textInputProps}) {
    const {unknownProps, knownProps} = splitTextInputProps(textInputProps);
    warnUnknownProps('MaskedInput', unknownProps);
    const pattern = maskPatternOf(mask);
    const ownInputRef = useRef(null);
    // dónde dejar el cursor cuando el campo ya tenga sus separadores (se pone después de pintar)
    const pendingCaret = useRef(null);

    useLayoutEffect(() => {
        const input = ownInputRef.current;
        if (pendingCaret.current === null || !input || input !== input.ownerDocument.activeElement) {
            return;
        }
        input.setSelectionRange(pendingCaret.current, pendingCaret.current);
        pendingCaret.current = null;
    });

    const keepInputRef = (input) => {
        ownInputRef.current = input;
        if (typeof inputRef === 'function') {
            inputRef(input);
        } else if (inputRef) {
            inputRef.current = input;
        }
    };

    const change = (typedText) => {
        const caretPosition = ownInputRef.current?.selectionStart ?? typedText.length;
        pendingCaret.current = caretPositionOf(typedText, caretPosition, pattern);
        onChange(rawValueOf(typedText, pattern));
    };

    return (
        <TextInput
            {...knownProps}
            value={maskedTextOf(value, pattern)}
            onChange={change}
            inputRef={keepInputRef}
            slotProps={{
                ...slotProps,
                // OJO: sin maxLength. El navegador cortaría lo pegado ANTES de limpiarlo: «(555) 123-4567» trae 14 caracteres para
                // un patrón de 12 y se perderían los últimos dígitos. El largo lo cuida la máscara
                htmlInput: {
                    inputMode: NUMERIC_ONLY.test(pattern) ? 'numeric' : 'text', autoCapitalize: 'characters', spellCheck: false,
                    ...slotProps?.htmlInput,
                },
            }}
        />
    );
}

// lo que TextInput entiende; lo demás se avisa en la consola mientras se programa. uppercase y normalizeOnBlur no van: la
// máscara ya decide cómo se escribe
const TEXT_INPUT_PROPS = new Set([
    'name', 'label', 'onBlur', 'error', 'helperText', 'placeholder', 'startAdornment', 'endAdornment', 'clearable', 'autoComplete', 'autoFocus',
    'disabled', 'required', 'fullWidth', 'id', 'sx', 'messages', 'texts',
]);

/**
 * @param {object} props
 * @returns {{knownProps: object, unknownProps: object}}
 */
function splitTextInputProps(props) {
    const knownProps = {};
    const unknownProps = {};
    for (const [key, propValue] of Object.entries(props)) {
        (TEXT_INPUT_PROPS.has(key) ? knownProps : unknownProps)[key] = propValue;
    }
    return {knownProps, unknownProps};
}
