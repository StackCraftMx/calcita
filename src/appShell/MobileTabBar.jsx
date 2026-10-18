// La barra de pestañas del teléfono con vidrio, como la de iOS 26: una cápsula de vidrio flotando abajo con las secciones
// principales (mobileTabsOf: hasta 5, o 4 y «Más»), y aparte, en su círculo de vidrio, la cuenta (con todos los ajustes
// adentro). La reemplaza a la barra de abajo con ☰ y al cajón del menú (lo pidió el autor: «estilo Apple pero con sus
// submenús de acciones»).
//
//   - Una pestaña con submenú no navega: abre el menú de acciones de Apple arriba de ella (SubmenuActionsMenu).
//   - «Más» abre una hoja desde abajo con el resto del menú, por secciones (SideMenu, el mismo del escritorio).
//   - Cada pestaña lleva su badge como los de Apple (HIG «Tab bars»): ROJO con el número en blanco y solo para conteos (lo
//     pendiente, del servidor); un badge de texto («Nuevo») no va en la pestaña, se queda en el menú: Apple los reserva para
//     lo que pide atención.
//   - Acostado (pantalla bajita), la barra va compacta: ícono y nombre lado a lado, para dejarle el alto al contenido.
//   - Al leer hacia abajo se encoge (como iOS 26): queda una cápsula chica con la pestaña donde está la persona, y la cuenta
//     más chica; al subir un poco, o al tocar la cápsula, regresa completa (cuándo: tabBarScroll.js). Se mueve solo con
//     opacidad y escala, lo que el navegador anima sin volver a acomodar la página: en un teléfono barato no se traba.
// Solo se ve en el teléfono (PHONE_MEDIA_QUERY); en escritorio no ocupa nada.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

import {menuItemLabelOf} from '@/appShell/menuItemText.js';
import {
    GLASS_PANEL_GAP_PIXELS, MOBILE_TAB_BAR_HEIGHT_PIXELS, PHONE_LANDSCAPE_MEDIA_QUERY, PHONE_MEDIA_QUERY,
} from '@/appShell/shellSizes.js';
import SideMenu from '@/appShell/SideMenu.jsx';
import SubmenuActionsMenu, {SUBMENU_PLACEMENT} from '@/appShell/SubmenuActionsMenu.jsx';
import {useTabBarMinimized} from '@/appShell/useTabBarMinimized.js';
import {menuBadgeOf, mobileTabsOf} from '@/navigation/appMenu.js';
import {textSizeOf} from '@/theme/appleTracking.js';
import {accentTextStylesOf, glassStylesOf} from '@/theme/glassSurface.js';
import {mergeStyles} from '@/theme/mergeComponents.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

// el nombre de la pestaña parado y acostado (px), lo ancho máximo de la cápsula y lo alto de la hoja de «Más»
const TAB_LABEL_PIXELS = Object.freeze({portrait: 10, landscape: 12});
const TAB_ICON_SIZE = '1.5rem';
const TAB_BAR_MAX_WIDTH_PIXELS = 560;
const MORE_SHEET_MAX_WIDTH_PIXELS = 640;
const MORE_SHEET_MAX_HEIGHT = '75vh';
const BADGE_MAX = 99;
// la barra flota sobre el contenido: vidrio más opaco que el de los controles, una línea fina en la orilla y una sombra
// debajo. Con el vidrio de siempre, en claro se perdía sobre las tarjetas blancas y no parecía flotar (lo reportaron)
const FLOATING_GLASS_OPACITY = 0.8;
const FLOATING_EDGE = Object.freeze({
    light: {outline: 'rgba(15, 23, 42, 0.12)', shadow: '0 10px 30px rgba(15, 23, 42, 0.20), 0 2px 6px rgba(15, 23, 42, 0.10)'},
    dark: {outline: 'rgba(255, 255, 255, 0.16)', shadow: '0 10px 30px rgba(0, 0, 0, 0.65), 0 2px 6px rgba(0, 0, 0, 0.4)'},
});
// la pestaña elegida: un tinte del acento (en claro una gota blanca sobre la cápsula blanca no se distinguía)
const ACTIVE_TINT_PERCENT = Object.freeze({light: 14, dark: 24});
// encogida: lo alto de la cápsula chica (px) y a qué tamaño se va lo que desaparece
const MINIMIZED_PIXELS = Object.freeze({portrait: 48, landscape: 40});
const HIDDEN_SCALE = 0.6;

/**
 * Lo que aparece o desaparece al encoger la barra: solo opacidad y escala. visibility espera a que termine la animación
 * para esconderlo, y así lo que ya no se ve tampoco se puede tocar.
 *
 * @param {object} theme
 * @param {boolean} isShown
 * @param {string} transformOrigin hacia dónde se encoge ('left bottom')
 * @returns {object}
 */
function appearStylesOf(theme, isShown, transformOrigin) {
    const duration = theme.transitions.duration.short;
    return {
        transformOrigin,
        opacity: isShown ? 1 : 0,
        transform: isShown ? 'none' : `scale(${HIDDEN_SCALE})`,
        visibility: isShown ? 'visible' : 'hidden',
        transition: `${theme.transitions.create(['opacity', 'transform'], {duration})}, visibility 0s linear ${isShown ? 0 : duration}ms`,
    };
}

/**
 * La superficie de la barra y del círculo de la cuenta: vidrio más opaco, su línea fina y su sombra (la sombra va en una
 * capa detrás, ::before, para no pisar el filo de luz del vidrio, que también es una sombra).
 *
 * @param {object} theme
 * @returns {object}
 */
function floatingSurfaceOf(theme) {
    return {
        ...glassStylesOf(theme, {opacity: FLOATING_GLASS_OPACITY}),
        position: 'relative',
        borderRadius: '999px',
        height: '100%',
        outline: `1px solid ${FLOATING_EDGE.light.outline}`,
        '&::before': {
            content: '""', position: 'absolute', inset: 0, borderRadius: 'inherit', zIndex: -1, pointerEvents: 'none',
            boxShadow: FLOATING_EDGE.light.shadow,
        },
        ...theme.applyStyles('dark', {
            outline: `1px solid ${FLOATING_EDGE.dark.outline}`,
            '&::before': {boxShadow: FLOATING_EDGE.dark.shadow},
        }),
    };
}

/**
 * La pestaña elegida: el tinte del acento y su letra legible.
 *
 * @param {object} theme
 * @returns {object}
 */
function activeTabOf(theme) {
    const primary = (theme.vars ?? theme).palette.primary.main;
    return mergeStyles({
        backgroundColor: `color-mix(in srgb, ${primary} ${ACTIVE_TINT_PERCENT.light}%, transparent)`,
        ...theme.applyStyles('dark', {backgroundColor: `color-mix(in srgb, ${primary} ${ACTIVE_TINT_PERCENT.dark}%, transparent)`}),
    }, accentTextStylesOf(theme));
}

/**
 * Una pestaña: liga a su pantalla o, con submenú, botón que abre el menú de acciones.
 *
 * @param {object} props
 * @param {string} props.label ya traducido
 * @param {import('react').ElementType} [props.Icon]
 * @param {boolean} props.isActive
 * @param {{content: number|string, isCount: boolean}|null} props.badge
 * @param {object} [props.linkProps] {component, to} si navega
 * @param {(event: object) => void} [props.onClick]
 * @param {boolean} [props.hasPopup] abre un menú
 */
function TabButton({label, Icon, isActive, badge, linkProps = {}, onClick, hasPopup = false}) {
    return (
        <ButtonBase {...linkProps} onClick={onClick} aria-haspopup={hasPopup ? 'menu' : undefined} aria-current={isActive ? 'page' : undefined}
                    sx={(theme) => mergeStyles({
                        flex: '1 1 0', minWidth: 0, height: '100%', borderRadius: '999px', px: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.25,
                        color: 'text.primary',
                        transition: theme.transitions.create(['background-color', 'color'], {duration: theme.transitions.duration.shortest}),
                        [PHONE_LANDSCAPE_MEDIA_QUERY]: {flexDirection: 'row', gap: 0.75},
                    }, isActive ? activeTabOf(theme) : {})}>
            <Badge invisible={!badge?.isCount} color="error" max={BADGE_MAX} overlap="circular" badgeContent={badge?.isCount ? badge.content : undefined}>
                {Icon ? <Icon sx={{fontSize: TAB_ICON_SIZE}} /> : <Box sx={{width: TAB_ICON_SIZE, height: TAB_ICON_SIZE}} />}
            </Badge>
            <Typography component="span" noWrap
                        sx={{...textSizeOf(TAB_LABEL_PIXELS.portrait), fontWeight: 500, maxWidth: '100%',
                             [PHONE_LANDSCAPE_MEDIA_QUERY]: textSizeOf(TAB_LABEL_PIXELS.landscape)}}>
                {label}
            </Typography>
        </ButtonBase>
    );
}

/**
 * @param {object} props
 * @param {object[]} props.menuItems lo que regresa composeMenu
 * @param {object|null} props.activeItem la entrada de la pantalla abierta
 * @param {Record<string, number>} [props.menuBadges] los conteos del servidor por badgeKey
 * @param {import('react').ReactNode} [props.account] la cuenta (o el engrane), en su círculo junto a la barra
 * @param {import('react').ReactNode} [props.moreFooter] lo que va al final de la hoja de «Más» (la tarjeta del menú lateral)
 * @param {boolean} [props.minimizeOnScroll] se encoge al leer hacia abajo; por omisión sí
 */
export default function MobileTabBar({menuItems, activeItem, menuBadges, account, moreFooter, minimizeOnScroll = true}) {
    const {t} = useToolkitTranslation('layout');
    const {Link: RouterLink} = useToolkitNavigation();
    const {tabs, more} = mobileTabsOf(menuItems);
    const [submenu, setSubmenu] = useState({anchorElement: null, menuItem: null});
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const {isMinimized, expand} = useTabBarMinimized(minimizeOnScroll);
    const closeSubmenu = () => setSubmenu({anchorElement: null, menuItem: null});
    const isInside = (menuItem) => menuItem === activeItem || (menuItem.children ?? []).includes(activeItem);
    const moreHasActive = more.some(isInside);
    // la cápsula chica enseña dónde está la persona: su pestaña, «Más» si está en algo de ahí, o la primera
    const activeTab = tabs.find(isInside);
    const MinimizedIcon = (!activeTab && moreHasActive ? MoreHorizRoundedIcon : (activeTab ?? tabs[0])?.Icon) ?? MoreHorizRoundedIcon;
    // «Más» suma los conteos de lo que guarda (solo conteos: los de texto no van en la pestaña)
    const moreCount = more.reduce((total, menuItem) => {
        const badge = menuBadgeOf(menuItem, menuBadges);
        return total + (badge?.isCount ? badge.content : 0);
    }, 0);
    const moreBadge = moreCount > 0 ? {content: moreCount, isCount: true} : null;

    const glassSurfaceSx = floatingSurfaceOf;

    return (
        <>
            <Box component="nav" aria-label={t('drawer.ariaLabel')}
                 sx={(theme) => ({
                     display: 'none',
                     [PHONE_MEDIA_QUERY]: {display: 'flex'},
                     position: 'fixed', zIndex: theme.zIndex.appBar, gap: 0.75, justifyContent: 'center',
                     left: GLASS_PANEL_GAP_PIXELS, right: GLASS_PANEL_GAP_PIXELS,
                     bottom: `calc(${GLASS_PANEL_GAP_PIXELS}px + env(safe-area-inset-bottom))`,
                     height: MOBILE_TAB_BAR_HEIGHT_PIXELS.portrait,
                     [PHONE_LANDSCAPE_MEDIA_QUERY]: {height: MOBILE_TAB_BAR_HEIGHT_PIXELS.landscape},
                 })}>
                <Box inert={isMinimized}
                     sx={(theme) => ({...glassSurfaceSx(theme), display: 'flex', flex: 1, maxWidth: TAB_BAR_MAX_WIDTH_PIXELS, p: 0.375,
                                      ...appearStylesOf(theme, !isMinimized, 'left bottom')})}>
                    {tabs.map((menuItem) => {
                        const hasChildren = (menuItem.children ?? []).length > 0;
                        return (
                            <TabButton key={menuItem.to ?? menuItemLabelOf(menuItem, t)} label={menuItemLabelOf(menuItem, t)} Icon={menuItem.Icon}
                                       isActive={isInside(menuItem)} badge={menuBadgeOf(menuItem, menuBadges)} hasPopup={hasChildren}
                                       linkProps={hasChildren ? {} : {component: RouterLink, to: menuItem.to}}
                                       onClick={hasChildren ? (event) => setSubmenu({anchorElement: event.currentTarget, menuItem}) : undefined} />
                        );
                    })}
                    {more.length > 0 && (
                        <TabButton label={t('drawer.more')} Icon={MoreHorizRoundedIcon} isActive={moreHasActive} badge={moreBadge} hasPopup
                                   onClick={() => setIsMoreOpen(true)} />
                    )}
                </Box>
                {/* encogida: la cápsula chica en la esquina, con la pestaña de ahorita; tocarla regresa la barra completa */}
                <ButtonBase inert={!isMinimized} onClick={expand} aria-label={t('drawer.showTabs')} aria-expanded={false}
                            sx={(theme) => mergeStyles({
                                ...glassSurfaceSx(theme), position: 'absolute', left: 0, bottom: 0,
                                width: MINIMIZED_PIXELS.portrait, height: MINIMIZED_PIXELS.portrait,
                                [PHONE_LANDSCAPE_MEDIA_QUERY]: {width: MINIMIZED_PIXELS.landscape, height: MINIMIZED_PIXELS.landscape},
                                ...appearStylesOf(theme, isMinimized, 'left bottom'),
                            }, accentTextStylesOf(theme))}>
                    <MinimizedIcon sx={{fontSize: TAB_ICON_SIZE}} />
                </ButtonBase>
                {account && (
                    <Box sx={(theme) => ({
                        ...glassSurfaceSx(theme), flexShrink: 0, minWidth: MOBILE_TAB_BAR_HEIGHT_PIXELS.portrait, px: 0.5, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', [PHONE_LANDSCAPE_MEDIA_QUERY]: {minWidth: MOBILE_TAB_BAR_HEIGHT_PIXELS.landscape},
                        '& .MuiButtonBase-root': {color: 'inherit'},
                        // encogida, la cuenta se queda pero del alto de la cápsula chica, pegada a su esquina
                        transformOrigin: 'right bottom',
                        transform: isMinimized ? `scale(${MINIMIZED_PIXELS.portrait / MOBILE_TAB_BAR_HEIGHT_PIXELS.portrait})` : 'none',
                        transition: theme.transitions.create('transform', {duration: theme.transitions.duration.short}),
                        ...(isMinimized && {[PHONE_LANDSCAPE_MEDIA_QUERY]: {
                            minWidth: MOBILE_TAB_BAR_HEIGHT_PIXELS.landscape,
                            transform: `scale(${MINIMIZED_PIXELS.landscape / MOBILE_TAB_BAR_HEIGHT_PIXELS.landscape})`,
                        }}),
                    })}>
                        {account}
                    </Box>
                )}
            </Box>

            {submenu.menuItem && (
                <SubmenuActionsMenu anchorElement={submenu.anchorElement} onClose={closeSubmenu} menuItem={submenu.menuItem} activeItem={activeItem}
                                    menuBadges={menuBadges} placement={SUBMENU_PLACEMENT.above} />
            )}

            {/* «Más»: el resto del menú en una hoja desde abajo, separada de las orillas como las hojas de iOS */}
            <Drawer anchor="bottom" open={isMoreOpen} onClose={() => setIsMoreOpen(false)}
                    slotProps={{paper: {sx: {
                        m: `${GLASS_PANEL_GAP_PIXELS}px auto calc(${GLASS_PANEL_GAP_PIXELS}px + env(safe-area-inset-bottom))`,
                        width: `min(${MORE_SHEET_MAX_WIDTH_PIXELS}px, calc(100% - ${GLASS_PANEL_GAP_PIXELS * 2}px))`,
                        maxHeight: MORE_SHEET_MAX_HEIGHT, borderRadius: '20px', overflow: 'hidden',
                    }}}}>
                <SideMenu menuItems={more} activeItem={activeItem} menuBadges={menuBadges} collapsed={false} showBrand={false} footer={moreFooter}
                          onNavigate={() => setIsMoreOpen(false)} />
            </Drawer>
        </>
    );
}
