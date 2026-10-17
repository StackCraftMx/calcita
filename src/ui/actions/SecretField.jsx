// Un secreto que se enseña UNA vez (una clave de acceso, un token recién creado): tapado por omisión, con el ojo para verlo
// y el botón para copiarlo.
//
// Tapado porque la pantalla se comparte, se graba o la ve quien pasa por atrás; el botón de copiar evita seleccionarlo a
// mano y dejar un carácter afuera. Si el navegador no deja copiar, se destapa para copiarlo a mano.
//
// Genérico del paquete: function (regla de la casa).
import {useId, useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import CheckIcon from '@mui/icons-material/CheckRounded';
import CopyIcon from '@mui/icons-material/ContentCopyOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import FieldFrame from '@/inputs/FieldFrame.jsx';

const COPIED_FEEDBACK_MILLISECONDS = 2000;
const MONOSPACE_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/**
 * @param {object} props
 * @param {string} props.value el secreto
 * @param {string} props.label ya traducido
 * @param {string} [props.helperText] p. ej. «Guárdela: no se vuelve a enseñar»
 * @param {() => void} [props.onCopied]
 */
export default function SecretField({value, label, helperText = ' ', onCopied}) {
    const {t} = useToolkitTranslation('common');
    const generatedId = useId();
    const inputId = `secret-${generatedId}`;
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const revealLabel = isRevealed ? t('form.hidePassword') : t('form.showPassword');

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setIsCopied(true);
            onCopied?.();
            setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MILLISECONDS);
        } catch {
            // sin permiso de portapapeles: se destapa para copiarlo a mano
            setIsRevealed(true);
        }
    };

    return (
        <FieldFrame inputId={inputId} label={label}>
            <TextField
                id={inputId}
                fullWidth
                size="small"
                value={value}
                helperText={helperText}
                type={isRevealed ? 'text' : 'password'}
                slotProps={{
                    htmlInput: {readOnly: true, spellCheck: false, autoComplete: 'off', style: {fontFamily: MONOSPACE_FONT}},
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <Tooltip title={revealLabel}>
                                    <IconButton size="small" aria-label={revealLabel} onClick={() => setIsRevealed((current) => !current)}>
                                        {isRevealed ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={isCopied ? t('form.copied') : t('form.copy')}>
                                    <IconButton size="small" aria-label={t('form.copy')} onClick={copy} color={isCopied ? 'success' : 'default'}>
                                        {isCopied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            </InputAdornment>
                        ),
                    },
                }}
            />
        </FieldFrame>
    );
}
