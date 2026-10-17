// El submenú de una entrada como menú de acciones de Apple: un menú flotante con las hijas (ícono, nombre y su badge) y
// la pantalla abierta marcada. Lo usan el menú lateral encogido (sale a la DERECHA del ícono) y la barra de pestañas del
// teléfono (sale ARRIBA de la pestaña): un solo lugar para los dos.
//
// Genérico del paquete: function (regla de la casa).
import Chip from '@mui/material/Chip';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import {menuItemLabelOf} from '@/appShell/menuItemText.js';
import {menuBadgeOf} from '@/navigation/appMenu.js';
import {textSizeOf} from '@/theme/appleTracking.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

/** Hacia dónde sale el menú: a la derecha del botón (menú lateral) o arriba de él (pestañas del teléfono). */
export const SUBMENU_PLACEMENT = Object.freeze({side: 'side', above: 'above'});

// lo que se separa el menú de su botón, lo ancho mínimo y el tamaño del badge (px)
const GAP_PIXELS = 12;
const MIN_WIDTH_PIXELS = 220;
const BADGE_PIXELS = 11;

const PLACEMENTS = Object.freeze({
    [SUBMENU_PLACEMENT.side]: {
        anchorOrigin: {vertical: 'top', horizontal: 'right'}, transformOrigin: {vertical: 'top', horizontal: 'left'}, gapSx: {ml: `${GAP_PIXELS}px`},
    },
    [SUBMENU_PLACEMENT.above]: {
        anchorOrigin: {vertical: 'top', horizontal: 'center'}, transformOrigin: {vertical: 'bottom', horizontal: 'center'}, gapSx: {mt: `-${GAP_PIXELS}px`},
    },
});

/**
 * @param {object} props
 * @param {Element|null} props.anchorElement el botón del que cuelga (null = cerrado)
 * @param {() => void} props.onClose
 * @param {object} props.menuItem la entrada con sus hijas (children)
 * @param {object|null} props.activeItem la entrada de la pantalla abierta
 * @param {Record<string, number>} [props.menuBadges] los conteos del servidor por badgeKey
 * @param {() => void} [props.onNavigate] al elegir una hija
 * @param {'side'|'above'} [props.placement] SUBMENU_PLACEMENT; por omisión a la derecha
 */
export default function SubmenuActionsMenu({anchorElement, onClose, menuItem, activeItem, menuBadges, onNavigate, placement = SUBMENU_PLACEMENT.side}) {
    const {t} = useToolkitTranslation('layout');
    const {Link: RouterLink} = useToolkitNavigation();
    const position = PLACEMENTS[placement] ?? PLACEMENTS[SUBMENU_PLACEMENT.side];

    return (
        <Menu anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={onClose}
              anchorOrigin={position.anchorOrigin} transformOrigin={position.transformOrigin}
              slotProps={{paper: {sx: {minWidth: MIN_WIDTH_PIXELS, ...position.gapSx}}}}>
            {(menuItem.children ?? []).map((child) => {
                const ChildIcon = child.Icon;
                const badge = menuBadgeOf(child, menuBadges);
                return (
                    <MenuItem key={child.to ?? menuItemLabelOf(child, t)} component={RouterLink} to={child.to} selected={child === activeItem}
                              onClick={() => {
                                  onClose();
                                  onNavigate?.();
                              }}>
                        {ChildIcon && <ListItemIcon><ChildIcon fontSize="small" /></ListItemIcon>}
                        <ListItemText>{menuItemLabelOf(child, t)}</ListItemText>
                        {badge && <Chip label={badge.content} size="small" color="primary" sx={{height: 20, ml: 1.5, ...textSizeOf(BADGE_PIXELS)}} />}
                    </MenuItem>
                );
            })}
        </Menu>
    );
}
