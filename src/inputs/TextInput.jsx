// Campo de texto suelto, con la etiqueta arriba: el que pintan FormTextField (formik) y el de react-hook-form, y el que se
// usa sin formulario (controlado: value / onChange).
//
// Lo que resuelve, y por lo que existe en vez de un <TextField> suelto:
//   - el renglón de ayuda está reservado desde el principio, así la tarjeta no brinca cuando aparece un error;
//   - las contraseñas traen el ojo para revelarlas (con aria-label traducido);
//   - con texto, la ⓧ para borrarlo de un toque, como los campos de Apple («Display a Clear button in the trailing end of
//     a text field», HIG «Text fields»). Sale con el cursor encima o al escribir, para que un formulario lleno no se vea
//     lleno de ⓧ; no entra al recorrido del teclado (con el teclado se borra seleccionando el texto);
//   - normalizeOnBlur deja el valor como lo va a mandar el formulario (el correo en minúsculas y sin espacios) al salir del
//     campo: la persona ve lo que se envía;
//   - uppercase normaliza a mayúsculas mientras se escribe (claves, RFC);
//   - el error llega como LLAVE de yup ({key, values}) o como texto ya traducido (el del servidor) y se pinta en el idioma
//     activo. Cuándo enseñarlo (ya se tocó, ya se envió) lo decide quien lo conecta al formulario.
//
// Genérico del paquete: function (regla de la casa).
import {useId, useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';

// la ⓧ de borrar: escondida hasta que el campo tiene el cursor encima o se está escribiendo en él
const CLEAR_BUTTON_CLASS = 'calcita-clear-button';
const CLEAR_BUTTON_SX = Object.freeze({
    [`& .${CLEAR_BUTTON_CLASS}`]: {visibility: 'hidden', color: 'text.secondary'},
    [`& .MuiInputBase-root:hover .${CLEAR_BUTTON_CLASS}, & .MuiInputBase-root.Mui-focused .${CLEAR_BUTTON_CLASS}`]: {visibility: 'visible'},
});

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|null|undefined} props.value
 * @param {(value: string) => void} props.onChange recibe el texto, no el evento
 * @param {() => void} [props.onBlur]
 * @param {string|{key: string, values?: object}} [props.error] el error a enseñar (undefined = sin error)
 * @param {string} [props.type] 'password' agrega el ojo
 * @param {string} [props.helperText] ayuda fija; el error la reemplaza
 * @param {import('react').ReactNode} [props.startAdornment]
 * @param {import('react').ReactNode} [props.endAdornment] adorno al final (en contraseñas manda el ojo)
 * @param {boolean} [props.uppercase] normaliza a mayúsculas mientras se escribe
 * @param {(value: string) => string} [props.normalizeOnBlur]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef] para enfocar el campo (react-hook-form lo usa)
 * @param {boolean} [props.clearable] la ⓧ para borrar el texto; por omisión sí (no en contraseñas ni con adorno propio)
 */
export default function TextInput({
    name, label, value, onChange, onBlur, error, type = 'text', helperText = ' ', startAdornment, endAdornment: customEndAdornment,
    uppercase = false, normalizeOnBlur, inputRef, clearable = true, ...textFieldProps
}) {
    const {t} = useToolkitTranslation('common');
    const [isRevealed, setIsRevealed] = useState(false);
    const generatedId = useId();
    const inputId = textFieldProps.id ?? `${name ?? 'text'}-${generatedId}`;
    const errorText = translateValidationMessage(t, error);
    const isPassword = type === 'password';
    const revealLabel = isRevealed ? t('form.hidePassword') : t('form.showPassword');

    const passwordAdornment = isPassword ? (
        <InputAdornment position="end">
            <Tooltip title={revealLabel}>
                <IconButton size="small" edge="end" aria-label={revealLabel} onClick={() => setIsRevealed((currentValue) => !currentValue)}>
                    {isRevealed ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                </IconButton>
            </Tooltip>
        </InputAdornment>
    ) : undefined;
    const isEditable = !textFieldProps.disabled && !textFieldProps.slotProps?.htmlInput?.readOnly;
    const canClear = clearable && !isPassword && !customEndAdornment && isEditable && Boolean(value);
    // onMouseDown sin acción: el foco se queda en el campo al borrar (si no, el campo pierde el foco y se valida de más)
    const clearAdornment = canClear ? (
        <InputAdornment position="end">
            <IconButton size="small" edge="end" tabIndex={-1} aria-label={t('form.clear')} className={CLEAR_BUTTON_CLASS}
                        onMouseDown={(event) => event.preventDefault()} onClick={() => onChange('')}>
                <CancelIcon fontSize="small" />
            </IconButton>
        </InputAdornment>
    ) : undefined;
    const endAdornment = customEndAdornment ? <InputAdornment position="end">{customEndAdornment}</InputAdornment> : (passwordAdornment ?? clearAdornment);

    const handleBlur = () => {
        if (normalizeOnBlur) {
            const normalizedValue = normalizeOnBlur(value ?? '');
            // solo si cambió: un cambio de más dispara una validación de más
            if (normalizedValue !== value) {
                onChange(normalizedValue);
            }
        }
        onBlur?.();
    };

    return (
        <FieldFrame inputId={inputId} label={label}>
            <TextField
                {...textFieldProps}
                name={name}
                id={inputId}
                inputRef={inputRef}
                value={value ?? ''}
                onChange={(event) => onChange(uppercase ? event.target.value.toUpperCase() : event.target.value)}
                onBlur={handleBlur}
                type={isPassword && isRevealed ? 'text' : type}
                sx={[CLEAR_BUTTON_SX, ...[].concat(textFieldProps.sx ?? [])]}
                error={Boolean(errorText)}
                helperText={errorText ?? helperText}
                fullWidth
                size="small"
                slotProps={{
                    input: {
                        startAdornment: startAdornment ? <InputAdornment position="start">{startAdornment}</InputAdornment> : undefined,
                        endAdornment,
                    },
                }}
            />
        </FieldFrame>
    );
}
