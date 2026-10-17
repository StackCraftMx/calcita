// El chip genérico: etiqueta + color + explicación, en un solo lugar.
//
// Para un valor que viene de un diccionario (estatus, formato, hallazgo) se usa StatusChip, que saca etiqueta, color y
// tooltip del diccionario. Tag es para lo que no es un valor cerrado: un filtro puesto, "total aproximado", un conteo.
//
// Genérico del paquete: function (regla de la casa).
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

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
export default function Tag({label, tooltip, color = 'default', variant = 'outlined', size = 'small', onDelete, sx, ...chipProps}) {
    const chip = (
        <Chip label={label} size={size} variant={variant} color={color} onDelete={onDelete}
              sx={{fontWeight: 500, ...sx}} {...chipProps} />
    );

    // guard clause: sin tooltip no se envuelve (un Tooltip vacío se traga el cursor sin dar nada a cambio)
    if (!tooltip) {
        return chip;
    }
    return <Tooltip title={tooltip}>{chip}</Tooltip>;
}
