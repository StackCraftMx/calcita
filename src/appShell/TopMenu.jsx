// El menú dentro de la barra (menuPosition="top"), para apps de pocos módulos: cada entrada es un botón; la que tiene
// submenú abre una lista debajo. Las secciones no se pintan aquí (en una fila no hay dónde); en el teléfono el menú es
// el mismo cajón del estilo lateral, con sus secciones.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaTopMenu con defaultProps y
// styleOverrides de sus partes: link, root.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {menuItemLabelOf, menuLinkPropsOf} from '@/appShell/menuItemText.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaTopMenu)
const THEME_NAME = 'CalcitaTopMenu';
const TopMenuLink = piecePart(THEME_NAME, 'Link', Button);
const TopMenuRoot = piecePart(THEME_NAME, 'Root', Box);

// la entrada abierta se marca con una raya abajo, del color principal (en la barra naranja, del color del texto)
const ACTIVE_UNDERLINE_PIXELS = 2;

/**
 * Un botón del menú de arriba, con su lista si tiene submenú.
 *
 * @param {{menuItem: object, activeItem: object|null}} props
 */
function TopMenuEntry({menuItem, activeItem}) {
    const {t} = useToolkitTranslation('layout');
    const {Link: RouterLink} = useToolkitNavigation();
    const [anchorElement, setAnchorElement] = useState(null);
    const hasChildren = Array.isArray(menuItem.children) && menuItem.children.length > 0;
    const isActive = menuItem === activeItem || (hasChildren && menuItem.children.includes(activeItem));
    const Icon = menuItem.Icon;
    const buttonSx = {
        color: 'inherit', borderRadius: 1, px: 1.5, whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 500,
        boxShadow: isActive ? `inset 0 -${ACTIVE_UNDERLINE_PIXELS}px 0 currentColor` : 'none',
    };

    if (!hasChildren) {
        return (
            <TopMenuLink {...menuLinkPropsOf(menuItem, RouterLink)} startIcon={Icon ? <Icon fontSize="small" /> : undefined}
                    aria-current={isActive ? 'page' : undefined} ownSx={buttonSx}>
                {menuItemLabelOf(menuItem, t)}
            </TopMenuLink>
        );
    }
    return (
        <>
            <TopMenuLink onClick={(event) => setAnchorElement(event.currentTarget)} aria-haspopup="menu" aria-expanded={Boolean(anchorElement)}
                    startIcon={Icon ? <Icon fontSize="small" /> : undefined} endIcon={<ExpandMoreIcon fontSize="small" />} ownSx={buttonSx}>
                {menuItemLabelOf(menuItem, t)}
            </TopMenuLink>
            <Menu anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={() => setAnchorElement(null)} slotProps={{paper: {sx: {minWidth: 220, mt: 0.5}}}}>
                {menuItem.children.map((child) => {
                    const ChildIcon = child.Icon;
                    return (
                        <MenuItem key={child.to ?? child.href} {...menuLinkPropsOf(child, RouterLink)} selected={child === activeItem} onClick={() => setAnchorElement(null)}>
                            {ChildIcon && <ListItemIcon><ChildIcon fontSize="small" /></ListItemIcon>}
                            <ListItemText primary={menuItemLabelOf(child, t)} />
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
}

/**
 * @param {{menuItems: object[], activeItem: object|null}} props
 */
export default function TopMenu(props) {
    // lo que el proyecto puso en su tema (components.CalcitaTopMenu.defaultProps) y encima lo que llega aquí
    const {menuItems, activeItem} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('layout');
    return (
        <TopMenuRoot component="nav" aria-label={t('drawer.ariaLabel')}
             ownSx={{display: {xs: 'none', md: 'flex'}, alignItems: 'stretch', alignSelf: 'stretch', gap: 0.5, minWidth: 0, overflowX: 'auto'}}>
            {menuItems.map((menuItem) => (
                <TopMenuEntry key={menuItem.to ?? menuItem.href ?? menuItemLabelOf(menuItem, t)} menuItem={menuItem} activeItem={activeItem} />
            ))}
        </TopMenuRoot>
    );
}
