// El botón «?» que vuelve a abrir la ayuda de una pantalla (la del carrusel o la que sea): un ícono con su nombre para el
// lector de pantalla y su globo al pasar el cursor.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaHelpButton con defaultProps, styleOverrides de
// sus partes (root) y slots/slotProps para cambiarlas.
//
// Genérico del paquete: function (regla de la casa).
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaHelpButton)
const THEME_NAME = 'CalcitaHelpButton';
const HelpButtonRoot = piecePart(THEME_NAME, 'Root', IconButton);

/**
 * @param {object} props
 * @param {() => void} props.onClick
 * @param {string} [props.label] ya traducido; por omisión «Ayuda de esta pantalla»
 * @param {'small'|'medium'|'large'} [props.size]
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function HelpButtonContent(props) {
    const {onClick, label, size = 'medium', sx, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const text = label ?? t('help.button');
    return (
        <Tooltip title={text}>
            <HelpButtonRoot aria-label={text} onClick={onClick} size={size} sx={sx}>
                <HelpOutlineRoundedIcon fontSize={size === 'small' ? 'small' : 'medium'} />
            </HelpButtonRoot>
        </Tooltip>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const HelpButton = withPieceSlots(HelpButtonContent, THEME_NAME);
export default HelpButton;
