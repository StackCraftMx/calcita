// Botón para copiar un valor al portapapeles, con la palomita de «copiado» un par de segundos.
//
// Sin permiso de portapapeles (una página en http, dentro de un iframe) no truena: el valor sigue a la vista para copiarlo
// a mano.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CheckIcon from '@mui/icons-material/CheckRounded';
import CopyIcon from '@mui/icons-material/ContentCopyOutlined';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// cuánto se queda la palomita de «copiado»
const COPIED_FEEDBACK_MILLISECONDS = 2000;

/**
 * @param {object} props
 * @param {string} props.value lo que se copia
 * @param {string} [props.label] ya traducido; por omisión «Copiar»
 * @param {'small'|'medium'} [props.size]
 * @param {() => void} [props.onCopied]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function CopyButton({value, label, size = 'small', onCopied, texts, ...unknownProps}) {
    warnUnknownProps('CopyButton', unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const [isCopied, setIsCopied] = useState(false);
    const buttonLabel = label ?? t('form.copy');

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setIsCopied(true);
            onCopied?.();
            setTimeout(() => setIsCopied(false), COPIED_FEEDBACK_MILLISECONDS);
        } catch {
            // sin permiso de portapapeles: el valor está a la vista para copiarlo a mano
        }
    };

    return (
        <Tooltip title={isCopied ? t('form.copied') : buttonLabel}>
            <IconButton size={size} aria-label={buttonLabel} onClick={copy} color={isCopied ? 'success' : 'default'}>
                {isCopied ? <CheckIcon fontSize="inherit" /> : <CopyIcon fontSize="inherit" />}
            </IconButton>
        </Tooltip>
    );
}
