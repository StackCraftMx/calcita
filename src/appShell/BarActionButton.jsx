// Un botón de acción de la pantalla que se acomoda solo a donde quedó (lo pidió el autor, y es lo que pide la guía de Apple
// para las barras: «Prefer simple, recognizable symbols for items instead of text»):
//   - en una cápsula (arriba en la barra, flotando en el teléfono o en la franja): solo el ícono, con su nombre en el tooltip
//     y para el lector de pantalla. En el teléfono el tooltip sale al dejar el dedo encima, como en iOS;
//   - en el menú «⋯» del teléfono (las que ya no caben en el renglón flotante): un renglón con ícono y texto;
//   - suelto (fuera de BarActions): ícono con texto, botón sin relleno.
// Lo demás va al botón (disabled, color, component y to para una liga…).
//
// Genérico del paquete: function (regla de la casa).
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';

import {BAR_ACTIONS_PLACEMENT, useBarActionsPlacement, useCloseBarActionsMenu} from '@/appShell/barActionsSlot.js';

/**
 * @param {object} props
 * @param {string} props.label el nombre de la acción, ya traducido: «Agregar sucursal»
 * @param {import('react').ReactNode} props.icon el ícono (<AddRoundedIcon />)
 * @param {(event: object) => void} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {'inherit'|'primary'|'secondary'|'success'|'error'|'info'|'warning'} [props.color] por omisión primary
 */
export default function BarActionButton({label, icon, onClick, disabled, color = 'primary', ...buttonProps}) {
    const placement = useBarActionsPlacement();
    const closeMenu = useCloseBarActionsMenu();

    if (placement === BAR_ACTIONS_PLACEMENT.menu) {
        // primero se cierra el menú: la acción puede abrir una ventana y el menú quedaba encima
        const pickFromMenu = (event) => {
            closeMenu();
            onClick?.(event);
        };
        return (
            <MenuItem onClick={pickFromMenu} disabled={disabled} {...buttonProps}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText>{label}</ListItemText>
            </MenuItem>
        );
    }
    if (placement === BAR_ACTIONS_PLACEMENT.capsule) {
        // OJO: el tooltip envuelve un span para que también salga con el botón deshabilitado (MUI no lo pinta sobre un
        // elemento deshabilitado)
        return (
            <Tooltip title={label}>
                <span>
                    <IconButton aria-label={label} onClick={onClick} disabled={disabled} color={color} {...buttonProps}>{icon}</IconButton>
                </span>
            </Tooltip>
        );
    }
    return <Button startIcon={icon} onClick={onClick} disabled={disabled} color={color} {...buttonProps}>{label}</Button>;
}
