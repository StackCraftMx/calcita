// Un botón «⋯» con un menú de acciones: el de cada tarjeta del tablero, el de cada columna, el de cada mensaje de la bandeja.
// Las acciones las da la pantalla (label ya traducido, ícono, color, apagada); sin acciones no se pinta nada.
//
//   <ActionsMenu label="Acciones de «Junta de cierre»"
//                actions={[{key: 'delete', label: 'Borrar', icon: <DeleteOutlineIcon fontSize="small" />, color: 'error', onClick: remove}]} />
//
// El clic no llega a lo de abajo: no levanta una tarjeta que se arrastra ni abre el renglón donde vive.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

/**
 * @param {object} props
 * @param {string} props.label el nombre del botón (lector de pantalla y su tooltip), ya traducido
 * @param {Array<{key: string, label: string, icon?: import('react').ReactNode, color?: string, disabled?: boolean, onClick: () => void}>} [props.actions]
 * @param {import('react').ReactNode} [props.icon] otro ícono para el botón (por omisión «⋯»)
 * @param {'small'|'medium'} [props.size]
 */
export default function ActionsMenu({label, actions, icon, size = 'small'}) {
    const [anchor, setAnchor] = useState(null);
    if (!actions?.length) {
        return null;
    }
    return (
        <>
            <Tooltip title={label}>
                <IconButton size={size} aria-label={label} aria-haspopup="menu"
                            onClick={(event) => {
                                event.stopPropagation();
                                setAnchor(event.currentTarget);
                            }}>
                    {icon ?? <MoreHorizRoundedIcon fontSize="small" />}
                </IconButton>
            </Tooltip>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} onClick={(event) => event.stopPropagation()}>
                {actions.map((action) => (
                    <MenuItem key={action.key} disabled={action.disabled}
                              onClick={() => {
                                  setAnchor(null);
                                  action.onClick();
                              }}
                              sx={action.color ? {color: `${action.color}.main`} : undefined}>
                        {action.icon && <ListItemIcon sx={action.color ? {color: 'inherit'} : undefined}>{action.icon}</ListItemIcon>}
                        <ListItemText>{action.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
