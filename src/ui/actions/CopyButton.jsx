// Botón para copiar al portapapeles: un ícono que pone el texto y lo confirma ahí mismo («Copiado» un par de segundos, con la
// palomita). Va donde copiar a mano cuesta trabajo: un folio, un texto largo que en pantalla va cortado, un renglón entero
// (con tableRowTextOf: separado por tabuladores, al pegarlo en Excel cada dato cae en su celda).
//
// Si el navegador no deja copiar (una página en http, dentro de un iframe, sin permiso), el botón lo dice en rojo en lugar
// de fingir que copió, y avisa con onCopyFailed. La confirmación también se anuncia a los lectores de pantalla (el globo no
// siempre se anuncia).
//
// value puede ser una función: se llama al picar (arma el renglón solo si de verdad se copia).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaCopyButton con defaultProps, styleOverrides de
// sus partes (button) y slots/slotProps para cambiarlas.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CheckIcon from '@mui/icons-material/CheckRounded';
import CopyIcon from '@mui/icons-material/ContentCopyOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {piecePart, usePieceProps, withPieceSlots, sxListOf} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaCopyButton)
const THEME_NAME = 'CalcitaCopyButton';
const CopyButtonButton = piecePart(THEME_NAME, 'Button', IconButton);

// cuánto se queda la confirmación (copiado o no se pudo) antes de regresar al ícono de copiar
const FEEDBACK_MILLISECONDS = 2000;
// en qué va el botón: listo, copiado o no se pudo
const COPY_STATE = Object.freeze({idle: 'idle', copied: 'copied', failed: 'failed'});
const ICON_BY_STATE = Object.freeze({[COPY_STATE.idle]: CopyIcon, [COPY_STATE.copied]: CheckIcon, [COPY_STATE.failed]: ErrorOutlineIcon});
const COLOR_BY_STATE = Object.freeze({[COPY_STATE.idle]: undefined, [COPY_STATE.copied]: 'success.dark', [COPY_STATE.failed]: 'error.dark'});
// el aviso para lectores de pantalla, escondido a la vista. OJO: '1px' en texto; en MUI un width: 1 es 100% y el texto
// escondido ensanchaba la página
const VISUALLY_HIDDEN_SX = {position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap'};

/**
 * @param {object} props
 * @param {string|(() => string)} props.value lo que se copia; una función se llama al picar
 * @param {string} [props.label] ya traducido: qué copia («Copiar el folio»); por omisión «Copiar». Es el globo y el nombre
 *     del botón para un lector de pantalla
 * @param {'small'|'medium'} [props.size]
 * @param {() => void} [props.onCopied]
 * @param {(error: unknown) => void} [props.onCopyFailed] el navegador no dejó copiar (el botón ya lo dice en rojo)
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 * @param {import('@mui/material').SxProps<import('@mui/material').Theme>} [props.sx] los estilos de esta pantalla en el botón que se ve, encima de los del tema
 */
function CopyButtonContent(props) {
    const {value, label, size = 'small', onCopied, onCopyFailed, texts, sx, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const [copyState, setCopyState] = useState(COPY_STATE.idle);
    const resetTimer = useRef(null);
    const buttonLabel = label ?? t('form.copy');

    // al desmontar no se queda un temporizador vivo
    useEffect(() => () => clearTimeout(resetTimer.current), []);

    const copy = async () => {
        clearTimeout(resetTimer.current);
        try {
            await navigator.clipboard.writeText(typeof value === 'function' ? value() : value);
            setCopyState(COPY_STATE.copied);
            onCopied?.();
        } catch (error) {
            setCopyState(COPY_STATE.failed);
            onCopyFailed?.(error);
        }
        resetTimer.current = setTimeout(() => setCopyState(COPY_STATE.idle), FEEDBACK_MILLISECONDS);
    };

    const feedbackText = {
        [COPY_STATE.idle]: buttonLabel,
        [COPY_STATE.copied]: t('form.copied'),
        [COPY_STATE.failed]: t('form.copyFailed'),
    }[copyState];
    const StateIcon = ICON_BY_STATE[copyState];

    return (
        <>
            {/* la confirmación se queda abierta mientras dura, aunque el cursor ya no esté encima; arriba y no a un lado, para no
                tapar el dato de junto */}
            <Tooltip title={feedbackText} open={copyState === COPY_STATE.idle ? undefined : true} placement="top">
                <CopyButtonButton size={size} aria-label={buttonLabel} onClick={copy} sx={[{color: COLOR_BY_STATE[copyState]}, ...sxListOf(sx)]}>
                    <StateIcon fontSize="inherit" />
                </CopyButtonButton>
            </Tooltip>
            <Box component="span" role="status" aria-live="polite" sx={VISUALLY_HIDDEN_SX}>
                {copyState === COPY_STATE.idle ? '' : feedbackText}
            </Box>
        </>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const CopyButton = withPieceSlots(CopyButtonContent, THEME_NAME);
export default CopyButton;
