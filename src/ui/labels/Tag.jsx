// El chip genérico: etiqueta + color + explicación, en un solo lugar.
//
// Para un valor que viene de un diccionario (estatus, formato, hallazgo) se usa StatusChip, que saca etiqueta, color y
// tooltip del diccionario. Tag es para lo que no es un valor cerrado: un filtro puesto, "total aproximado", un conteo.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaTag con defaultProps y
// styleOverrides.root (el sx de la pantalla sigue ganando a todo).
//
// Genérico del paquete: function (regla de la casa).
import {isValidElement} from 'react';
import Chip, {chipClasses} from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaTag)
const THEME_NAME = 'CalcitaTag';
const TagChip = piecePart(THEME_NAME, 'Root', Chip);

// EL ÍCONO VA DEL COLOR DE SU LETRA. En una etiqueta sin color MUI le pone al ícono un gris fijo de la paleta (el 700 en
// claro y el 300 en oscuro): con una paleta cuyos grises de oscuro van al revés (el 300 oscuro) o con la letra teñida
// desde sx, quedaba la letra clara y el ícono invisible. Con color, MUI ya lo hereda; aquí se hereda siempre, salvo que el
// ícono traiga su propio color (<CheckIcon color="success" />): ese se respeta, como lo hace MUI
const TAG_OWN_SX = Object.freeze({fontWeight: 500});
const TAG_INHERITED_ICON_SX = Object.freeze({...TAG_OWN_SX, [`& .${chipClasses.icon}`]: {color: 'inherit'}});

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.label texto visible, ya traducido
 * @param {string} [props.tooltip] qué significa (aparece al pasar el cursor)
 * @param {string} [props.color] color del tema de MUI
 * @param {'filled'|'outlined'} [props.variant]
 * @param {'small'|'medium'} [props.size]
 * @param {import('react').ReactElement} [props.icon] a la izquierda del texto; toma el color de la letra salvo que traiga el suyo
 * @param {() => void} [props.onDelete]
 * @param {object} [props.sx]
 */
function TagContent(props) {
    // lo que el proyecto puso en su tema (components.CalcitaTag.defaultProps) y encima lo que llega aquí
    const {label, tooltip, color = 'default', variant = 'outlined', size = 'small', onDelete, sx, ...chipProps} = usePieceProps(props, THEME_NAME);
    const iconHasOwnColor = isValidElement(chipProps.icon) && Boolean(chipProps.icon.props.color);
    const chip = (
        <TagChip label={label} size={size} variant={variant} color={color} onDelete={onDelete}
                 ownSx={iconHasOwnColor ? TAG_OWN_SX : TAG_INHERITED_ICON_SX} sx={sx} {...chipProps} />
    );

    // guard clause: sin tooltip no se envuelve (un Tooltip vacío se traga el cursor sin dar nada a cambio)
    if (!tooltip) {
        return chip;
    }
    return <Tooltip title={tooltip}>{chip}</Tooltip>;
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const Tag = withPieceSlots(TagContent, THEME_NAME);
export default Tag;
