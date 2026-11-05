// Un renglón del menú lateral: ícono, nombre y (si trae) su numerito; si tiene submenú, se abre y se cierra en su lugar.
// Con el menú encogido, el submenú sale como un menú flotante a la derecha del ícono (el de acciones de Apple: ícono y
// nombre, la pantalla abierta marcada) en lugar de abrir todo el menú. Muestra un nivel: las hijas directas.
//
// Reglas que vienen del menú lateral de walk-ot, ya pagadas:
//   - La estructura es FIJA: al encoger el menú, el nombre y la flecha NO se desmontan, solo se vuelven transparentes. Si
//     se desmontaran, React los quita en el mismo cuadro en que el menú anima su ancho y el ojo lo lee como un salto.
//   - Encogido, el nombre sale en un tooltip a la derecha.
//   - Los tamaños van en rem, no en px: así crecen con el tamaño de letra que elige la persona (FontSizeToggle).
//   - El renglón es una liga de verdad (clic con la rueda, «abrir en otra pestaña»), no un onClick que navega.
//   - Una hija del submenú con ícono se mete un escalón; una sin ícono no deja hueco vacío: su nombre queda justo debajo
//     del de su madre (con el hueco, el nombre se cortaba: «Alta con react-hook-fo…»).
//
// Con el vidrio del tema, lo que pide la guía de Liquid Glass de Apple:
//   - lo elegido va en la «gota» (la misma de las pestañas), no en un fondo plano;
//   - encogido, el menú es un panel con las esquinas del expandido (20) y cada renglón un botón de 44 px (el mínimo para el
//     dedo) con esquina concéntrica: el radio del panel (20) menos el margen entre botón y orilla (10) da 10. Antes era una
//     cápsula con botones redondos y se veía demasiado redondo (lo reportaron).
//
// Un nombre largo se corta con «…» por omisión (el renglón mide siempre lo mismo). Con labelOverflow wrap baja a un
// segundo renglón: el menú tiene ancho fijo y, con un vocabulario largo («Administración de clientes»), cortado ya no se
// sabe a dónde lleva la entrada. Solo baja con el menú abierto (encogido el nombre ni se ve) y el renglón tiene desde el
// principio el ancho del menú abierto: si creciera junto con el menú al abrirse, el nombre bajaría letra por letra (medido
// en Chrome: un renglón llegó a 703 px de alto a media animación).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaSideMenuEntry con defaultProps y
// styleOverrides de sus partes: button, icon, iconPlaceholder, text, badge, expand.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import {useTheme} from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import {menuItemLabelOf, menuLinkPropsOf} from '@/appShell/menuItemText.js';
import SubmenuActionsMenu, {SUBMENU_PLACEMENT} from '@/appShell/SubmenuActionsMenu.jsx';
import {DRAWER_WIDTH_EXPANDED} from '@/appShell/shellSizes.js';
import {menuBadgeOf} from '@/navigation/appMenu.js';
import {accentTextStylesOf, glassDropOf, isGlassTheme} from '@/theme/glassSurface.js';
import {mergeStyles} from '@/theme/mergeComponents.js';
import {textSizeOf} from '@/theme/appleTracking.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/** Qué hace el menú lateral con un nombre que no cabe en su renglón. */
export const MENU_LABEL_OVERFLOW = Object.freeze({
    // se corta con «…» (lo de siempre): todos los renglones miden lo mismo
    ellipsis: 'ellipsis',
    // baja a otro renglón: se lee completo
    wrap: 'wrap',
});

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaSideMenuEntry)
const THEME_NAME = 'CalcitaSideMenuEntry';
const EntryButton = piecePart(THEME_NAME, 'Button', ListItemButton);
const EntryIcon = piecePart(THEME_NAME, 'Icon', ListItemIcon);
const EntryIconPlaceholder = piecePart(THEME_NAME, 'IconPlaceholder', Box);
const EntryText = piecePart(THEME_NAME, 'Text', ListItemText);
const EntryBadge = piecePart(THEME_NAME, 'Badge', Chip);
const EntryExpand = piecePart(THEME_NAME, 'Expand', Box);

// las medidas del renglón, en unidades de spacing: los márgenes, el escalón de cada nivel de submenú y el espacio entre el
// ícono y el nombre. Las hijas van más apretadas (ícono más chico, menos espacio, renglón más bajo): medido en Chrome, con
// las medidas de las madres, «Alta con react-hook-form» en negritas pedía 160 px, tenía 154 y se cortaba.
const ROW_LEFT_PADDING = 1.5;
const ROW_RIGHT_PADDING = 1.5;
const CHILD_RIGHT_PADDING = 1;
const INDENT_PER_LEVEL = 1.5;
const ICON_GAP = 1.75;
const CHILD_ICON_GAP = 1;
const ICON_SIZE = '1.375rem';
const CHILD_ICON_SIZE = '1.25rem';
const ROW_MIN_HEIGHT_PIXELS = 40;
const CHILD_ROW_MIN_HEIGHT_PIXELS = 36;
// encogido con vidrio: el botón de 44 px (lo mínimo para tocar con el dedo, WCAG 2.5.5) con su esquina concéntrica
const RAIL_BUTTON_PIXELS = 44;
// el nombre del renglón y su numerito (px), con su espaciado de Apple (textSizeOf)
const MENU_TEXT_PIXELS = 13;
const MENU_BADGE_PIXELS = 11;
// de ahí para arriba se lee «99+»
const BADGE_MAX = 99;
const RAIL_BUTTON_RADIUS_PIXELS = 10;
// con los nombres que bajan de renglón, lo menos que mide el renglón con el menú abierto: el ancho del cajón menos el margen
// de la lista de SideMenu (px 1 de cada lado, en unidades de spacing) y la línea de la derecha del cajón sin vidrio. El
// cajón recorta lo que sobra mientras se abre. OJO: si el proyecto angosta el cajón desde su tema, también tiene que bajar
// este mínimo (styleOverrides de button) o se recortan el numerito y la flecha
const MENU_LIST_SIDE_PADDING = 1;
const DRAWER_LINE_PIXELS = 1;

/**
 * @param {object} props
 * @param {object} props.menuItem una entrada de composeMenu
 * @param {object|null} props.activeItem la entrada de la pantalla abierta
 * @param {boolean} props.collapsed el menú está encogido (solo íconos)
 * @param {() => void} [props.onNavigate] al elegir una pantalla (el cajón del teléfono se cierra)
 * @param {Record<string, number>} [props.menuBadges] los conteos del servidor por badgeKey (menuBadgeOf)
 * @param {string} [props.labelOverflow] un nombre que no cabe: MENU_LABEL_OVERFLOW.ellipsis (por omisión, se corta con
 *     «…») o MENU_LABEL_OVERFLOW.wrap (baja a otro renglón)
 * @param {number} [props.depth]
 */
function SideMenuEntryContent(props) {
    // lo que el proyecto puso en su tema (components.CalcitaSideMenuEntry.defaultProps) y encima lo que llega aquí
    const {
        menuItem, activeItem, collapsed, onNavigate, menuBadges, labelOverflow = MENU_LABEL_OVERFLOW.ellipsis, depth = 0, ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('layout');
    const {Link: RouterLink} = useToolkitNavigation();
    const theme = useTheme();
    const isGlass = isGlassTheme(theme);
    const isRailButton = isGlass && collapsed;
    const hasChildren = Array.isArray(menuItem.children) && menuItem.children.length > 0;
    const containsActive = hasChildren && menuItem.children.includes(activeItem);
    const isActive = menuItem === activeItem || containsActive;
    // abierto si la persona lo abrió, o solo si ahí está la pantalla abierta
    const [openedByPerson, setOpenedByPerson] = useState(null);
    // encogido: el botón del que cuelga el menú flotante del submenú (null = cerrado)
    const [flyoutAnchor, setFlyoutAnchor] = useState(null);
    const isOpen = openedByPerson ?? containsActive;
    const label = menuItemLabelOf(menuItem, t);
    // el badge: el conteo del servidor, la suma de las hijas o el fijo del menu.js; encogido va sobre el ícono
    const badge = menuBadgeOf(menuItem, menuBadges);
    const Icon = menuItem.Icon;
    // baja de renglón solo con el menú abierto (ver el encabezado). whiteSpace normal: el cajón del escritorio le pide a todo
    // su contenido un solo renglón (para que nada se reacomode mientras anima) y el nombre lo hereda. overflowWrap anywhere:
    // una palabra más larga que el renglón («conciliacion_de_pagos_del_mes») también baja en lugar de salirse
    const wrapsLabel = labelOverflow === MENU_LABEL_OVERFLOW.wrap && !collapsed;

    const toggleChildren = (event) => {
        if (collapsed) {
            setFlyoutAnchor(event.currentTarget);
            return;
        }
        setOpenedByPerson(!isOpen);
    };
    const closeFlyout = () => setFlyoutAnchor(null);

    const linkProps = hasChildren
        ? {onClick: toggleChildren, ...(collapsed && {'aria-haspopup': 'menu'})}
        : {...menuLinkPropsOf(menuItem, RouterLink), onClick: onNavigate};
    const fadeWhenCollapsed = (theme) => ({opacity: collapsed ? 0 : 1, transition: theme.transitions.create('opacity')});

    const isChild = depth > 0;
    // una hija sin ícono empieza donde empieza el nombre de su madre: margen + ícono + espacio, más los escalones de en medio
    const leftPadding = !isChild || Icon
        ? theme.spacing(ROW_LEFT_PADDING + depth * INDENT_PER_LEVEL)
        : `calc(${theme.spacing(ROW_LEFT_PADDING + ICON_GAP + (depth - 1) * INDENT_PER_LEVEL)} + ${ICON_SIZE})`;
    // el renglón de la pantalla abierta va del color del tema, pero legible (accentTextStylesOf): el naranja tal cual sobre
    // blanco daba 2.78 : 1
    const activeText = accentTextStylesOf(theme);
    // OJO: se SUMAN con mergeStyles, no con {...a, ...b}: los dos traen su parte de modo oscuro y con la suma simple la segunda
    // borraba la primera (el elegido salía en oscuro con el fondo de claro, casi negro y con línea blanca; error mío)
    const selectedStyle = mergeStyles(isGlass ? glassDropOf(theme) : {bgcolor: 'action.selected'}, activeText);

    const entryButton = (
        <EntryButton {...linkProps} selected={!hasChildren && isActive} aria-expanded={hasChildren ? (collapsed ? Boolean(flyoutAnchor) : isOpen) : undefined}
                        ownSx={{
                            borderRadius: isRailButton ? `${RAIL_BUTTON_RADIUS_PIXELS}px` : 1.5, pl: leftPadding, pr: isChild ? CHILD_RIGHT_PADDING : ROW_RIGHT_PADDING,
                            minHeight: isRailButton ? RAIL_BUTTON_PIXELS : (isChild ? CHILD_ROW_MIN_HEIGHT_PIXELS : ROW_MIN_HEIGHT_PIXELS),
                            ...(wrapsLabel && {minWidth: `calc(${DRAWER_WIDTH_EXPANDED}px - ${theme.spacing(2 * MENU_LIST_SIDE_PADDING)} - ${DRAWER_LINE_PIXELS}px)`}),
                            transition: theme.transitions.create(['background-color', 'border-radius', 'min-height']),
                            ...(isActive ? activeText : {color: 'text.primary'}),
                            '&.Mui-selected, &.Mui-selected:hover': selectedStyle,
                        }}>
            {(!isChild || Icon) && (
                <EntryIcon ownSx={{minWidth: 0, mr: isChild ? CHILD_ICON_GAP : ICON_GAP, color: 'inherit'}}>
                    <Badge invisible={!collapsed || !badge} color="primary" max={BADGE_MAX} badgeContent={badge?.isCount ? badge.content : undefined}
                           variant={badge?.isCount ? 'standard' : 'dot'} overlap="circular">
                        {Icon ? <Icon sx={{fontSize: isChild ? CHILD_ICON_SIZE : ICON_SIZE}} /> : <EntryIconPlaceholder ownSx={{width: ICON_SIZE, height: ICON_SIZE}} />}
                    </Badge>
                </EntryIcon>
            )}
            <EntryText primary={label} ownSx={fadeWhenCollapsed}
                          slotProps={{primary: {
                              noWrap: !wrapsLabel,
                              sx: {...textSizeOf(MENU_TEXT_PIXELS), fontWeight: isActive ? 600 : 400, ...(wrapsLabel && {whiteSpace: 'normal', overflowWrap: 'anywhere'})},
                          }}} />
            {badge && (
                <EntryBadge label={badge.isCount && badge.content > BADGE_MAX ? `${BADGE_MAX}+` : badge.content} size="small" color="primary" ownSx={(theme) => ({height: 20, ...textSizeOf(MENU_BADGE_PIXELS), ml: 1, ...fadeWhenCollapsed(theme)})} />
            )}
            {hasChildren && (
                <EntryExpand ownSx={(theme) => ({display: 'flex', alignItems: 'center', ...fadeWhenCollapsed(theme)})}>
                    {isOpen ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                </EntryExpand>
            )}
        </EntryButton>
    );

    return (
        <>
            {collapsed ? <Tooltip title={label} placement="right">{entryButton}</Tooltip> : entryButton}
            {hasChildren && collapsed && (
                <SubmenuActionsMenu anchorElement={flyoutAnchor} onClose={closeFlyout} menuItem={menuItem} activeItem={activeItem} menuBadges={menuBadges}
                                    onNavigate={onNavigate} placement={SUBMENU_PLACEMENT.side} />
            )}
            {hasChildren && (
                <Collapse in={isOpen && !collapsed} unmountOnExit>
                    <List dense disablePadding>
                        {menuItem.children.map((child) => (
                            <SideMenuEntry key={child.to ?? child.href ?? menuItemLabelOf(child, t)} menuItem={child} activeItem={activeItem} collapsed={collapsed}
                                           onNavigate={onNavigate} menuBadges={menuBadges} labelOverflow={labelOverflow} depth={depth + 1} />
                        ))}
                    </List>
                </Collapse>
            )}
        </>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const SideMenuEntry = withPieceSlots(SideMenuEntryContent, THEME_NAME);
export default SideMenuEntry;
