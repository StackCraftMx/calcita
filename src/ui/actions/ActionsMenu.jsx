// Un botón «⋯» con un menú de acciones: el de cada tarjeta del tablero, el de cada columna, el de cada mensaje de la bandeja.
// Las acciones las da la pantalla (label ya traducido, ícono, color, apagada); sin acciones no se pinta nada.
//
//   <ActionsMenu label="Acciones de «Junta de cierre»"
//                actions={[{key: 'delete', label: 'Borrar', icon: <DeleteOutlineIcon fontSize="small" />, color: 'error', onClick: remove}]} />
//
// El clic no llega a lo de abajo: no levanta una tarjeta que se arrastra ni abre el renglón donde vive.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaActionsMenu con defaultProps y
// styleOverrides de sus partes: item, itemIcon.
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
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaActionsMenu)
const THEME_NAME = 'CalcitaActionsMenu';
const ActionsItem = piecePart(THEME_NAME, 'Item', MenuItem);
const ActionsItemIcon = piecePart(THEME_NAME, 'ItemIcon', ListItemIcon);

/**
 * @param {object} props
 * @param {string} props.label el nombre del botón (lector de pantalla y su tooltip), ya traducido
 * @param {Array<{key: string, label: string, icon?: import('react').ReactNode, color?: string, disabled?: boolean, onClick: () => void}>} [props.actions]
 * @param {import('react').ReactNode} [props.icon] otro ícono para el botón (por omisión «⋯»)
 * @param {'small'|'medium'} [props.size]
 */
export default function ActionsMenu(props) {
    // lo que el proyecto puso en su tema (components.CalcitaActionsMenu.defaultProps) y encima lo que llega aquí
    const {label, actions, icon, size = 'small', ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
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
                    <ActionsItem key={action.key} disabled={action.disabled}
                              onClick={() => {
                                  setAnchor(null);
                                  action.onClick();
                              }}
                              ownSx={action.color ? {color: `${action.color}.main`} : undefined}>
                        {action.icon && <ActionsItemIcon ownSx={action.color ? {color: 'inherit'} : undefined}>{action.icon}</ActionsItemIcon>}
                        <ListItemText>{action.label}</ListItemText>
                    </ActionsItem>
                ))}
            </Menu>
        </>
    );
}
