// El chip genérico: etiqueta + color + explicación, en un solo lugar.
//
// Para un valor que viene de un diccionario (estatus, formato, hallazgo) se usa StatusChip, que saca etiqueta, color y
// tooltip del diccionario. Tag es para lo que no es un valor cerrado: un filtro puesto, "total aproximado", un conteo.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaTag con defaultProps y
// styleOverrides.root (el sx de la pantalla sigue ganando a todo).
//
// Genérico del paquete: function (regla de la casa).
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaTag)
const THEME_NAME = 'CalcitaTag';
const TagChip = piecePart(THEME_NAME, 'Root', Chip);

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.label texto visible, ya traducido
 * @param {string} [props.tooltip] qué significa (aparece al pasar el cursor)
 * @param {string} [props.color] color del tema de MUI
 * @param {'filled'|'outlined'} [props.variant]
 * @param {'small'|'medium'} [props.size]
 * @param {() => void} [props.onDelete]
 * @param {object} [props.sx]
 */
export default function Tag(props) {
    // lo que el proyecto puso en su tema (components.CalcitaTag.defaultProps) y encima lo que llega aquí
    const {label, tooltip, color = 'default', variant = 'outlined', size = 'small', onDelete, sx, ...chipProps} = usePieceProps(props, THEME_NAME);
    const chip = (
        <TagChip label={label} size={size} variant={variant} color={color} onDelete={onDelete}
                 ownSx={{fontWeight: 500}} sx={sx} {...chipProps} />
    );

    // guard clause: sin tooltip no se envuelve (un Tooltip vacío se traga el cursor sin dar nada a cambio)
    if (!tooltip) {
        return chip;
    }
    return <Tooltip title={tooltip}>{chip}</Tooltip>;
}
