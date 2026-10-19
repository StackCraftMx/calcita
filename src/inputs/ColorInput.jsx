// Campo de COLOR suelto (viene de «Identidad de documentos» de PLD): la muestra redonda (el «color well» de Apple, que abre
// el selector del sistema) dentro del campo del texto #RRGGBB, el contraste contra el blanco mientras se elige y, si el color casi no se leería, el mismo tono más oscuro con su botón
// para usarlo.
//
// Para lo que se imprime o se lee sobre blanco (el color de una marca en un comprobante). El color llega al formulario en
// mayúsculas (#2B3A67); '' = sin color.
//
// Genérico del paquete: function (regla de la casa).
import {useId} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import {translateValidationMessage} from '@/forms/validationMessages.js';
import {HEX_COLOR, MIN_CONTRAST, contrastOnWhite, readableVariantOf} from '@/inputs/colorContrast.js';
import FieldFrame from '@/inputs/FieldFrame.jsx';

// #RRGGBB
const COLOR_LENGTH = 7;
// el color que enseña el selector del navegador mientras el texto no es un color
const NEUTRAL_COLOR = '#000000';
const RATIO_DECIMALS = 1;
// la muestra redonda (px) y su orilla fina en claro y en oscuro
const SWATCH_PIXELS = 24;
const SWATCH_EDGE = Object.freeze({light: 'rgba(15, 23, 42, 0.18)', dark: 'rgba(255, 255, 255, 0.24)'});

/**
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} props.label ya traducido
 * @param {string|null|undefined} props.value '#RRGGBB' o ''
 * @param {(color: string) => void} props.onChange recibe el color en mayúsculas
 * @param {() => void} [props.onBlur]
 * @param {string|{key: string, values?: object}} [props.error]
 * @param {string} [props.helperText] cuando no hay color
 * @param {boolean} [props.checkContrast] avisa si casi no se lee sobre blanco (por omisión sí)
 * @param {boolean} [props.disabled]
 * @param {import('react').Ref<HTMLInputElement>} [props.inputRef]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function ColorInput({
    name, label, value, onChange, onBlur, error, helperText = ' ', checkContrast = true, disabled = false, inputRef, texts,
}) {
    const {t} = useToolkitTranslation('common', texts);
    const generatedId = useId();
    const inputId = `${name ?? 'color'}-${generatedId}`;
    const color = value ?? '';
    const isValidColor = HEX_COLOR.test(color);
    const contrastRatio = isValidColor ? contrastOnWhite(color) : null;
    const suggestion = checkContrast && isValidColor && contrastRatio < MIN_CONTRAST ? readableVariantOf(color) : null;
    const errorText = translateValidationMessage(t, error);
    const contrastText = contrastRatio && checkContrast ? t('form.colorContrast', {ratio: contrastRatio.toFixed(RATIO_DECIMALS)}) : helperText;
    const choose = (nextColor) => onChange(nextColor.toUpperCase());

    return (
        <FieldFrame inputId={inputId} label={label}>
            <Stack spacing={1}>
                {/* un solo campo: la muestra redonda al inicio (el «color well» de Apple) y el código al lado. Picar la muestra
                    abre el selector de colores del sistema (un input type=color invisible encima de ella). Antes eran dos cajas
                    sueltas (el selector del navegador en la suya y el código en otra) y se veían como piezas sueltas */}
                <TextField
                    name={name}
                    id={inputId}
                    inputRef={inputRef}
                    size="small"
                    fullWidth
                    value={color}
                    disabled={disabled}
                    placeholder="#RRGGBB"
                    onChange={(event) => choose(event.target.value)}
                    onBlur={onBlur}
                    error={Boolean(errorText)}
                    helperText={errorText ?? contrastText}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Box component="label"
                                         sx={(theme) => ({
                                             position: 'relative', display: 'block', flexShrink: 0, width: SWATCH_PIXELS, height: SWATCH_PIXELS,
                                             borderRadius: '50%', cursor: disabled ? 'default' : 'pointer',
                                             backgroundColor: isValidColor ? color : 'transparent',
                                             // la orilla de la muestra: que se vea aunque el color sea el del fondo (blanco en claro, negro en oscuro)
                                             boxShadow: `inset 0 0 0 1px ${SWATCH_EDGE.light}`,
                                             ...theme.applyStyles('dark', {boxShadow: `inset 0 0 0 1px ${SWATCH_EDGE.dark}`}),
                                         })}>
                                        <Box component="input" type="color" value={isValidColor ? color : NEUTRAL_COLOR} disabled={disabled}
                                             aria-label={t('form.pickColor')} onChange={(event) => choose(event.target.value)}
                                             sx={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 0, p: 0, cursor: 'inherit'}} />
                                    </Box>
                                </InputAdornment>
                            ),
                        },
                        htmlInput: {maxLength: COLOR_LENGTH, spellCheck: false, style: {fontVariantNumeric: 'tabular-nums'}},
                    }}
                />
                {suggestion && (
                    <Alert severity="warning"
                           action={<Button color="inherit" size="small" onClick={() => choose(suggestion)}>{t('form.colorUseSuggestion', {color: suggestion})}</Button>}>
                        {t('form.colorLowContrast', {suggestion})}
                    </Alert>
                )}
            </Stack>
        </FieldFrame>
    );
}
