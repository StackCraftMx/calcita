// El marco de las pantallas con sesión, al estilo de las plantillas de MUI (y del marco de walk-ot). Dos estilos de
// barra con las mismas props, para que el proyecto (o el `init` del CLI) solo elija:
//
//   menuPosition="side" (por omisión)                 menuPosition="top" (apps de pocos módulos)
//   ┌──────────────────────────────────────────┐       ┌──────────────────────────────────────────┐
//   │ ☰ Logo Nombre · Título al deslizar · ⚙ (A)│       │ Logo · Inicio Pedidos Clientes ▾ · ⚙ (A) │
//   ├────────┬─────────────────────────────────┤       ├──────────────────────────────────────────┤
//   │ Menú   │ contenido                       │       │ contenido                                │
//   │ por    │                                 │       │                                          │
//   │ secc.  │                                 │       │                                          │
//   └────────┴─────────────────────────────────┘       └──────────────────────────────────────────┘
//
// En el teléfono los dos son iguales: hamburguesa, título y ajustes en la barra; el menú sale en un cajón con el logo.
//
// Lo que trae, con su porqué:
//   - La barra va a todo lo ancho, con el logo y el nombre de la app a la izquierda, y el menú lateral debajo de ella
//     (como el DashboardLayout de MUI). La ☰ de la barra encoge el menú a solo íconos y lo recuerda (useDrawerCollapsed);
//     antes era un botón montado en la orilla del menú y se encimaba con él.
//   - El título de la página sube a la barra cuando su título grande sale de la vista (pageTitle.jsx).
//   - Escritorio y teléfono se eligen con CSS, no con useMediaQuery: el servidor (Next.js) ya pinta lo correcto.
//   - Dentro de la barra, para que se queden pegados al deslizar: los avisos del proyecto (ribbons), el de versión nueva
//     (NewBuildNotice; con vidrio flota aparte en su cápsula, ver NewBuildNotice.jsx) y la rayita de «cargando la pantalla»
//     (isNavigating). La barra publica su alto real, y el menú lateral empieza justo debajo de ella aunque crezca con un aviso.
//   - Con vidrio, en el teléfono la barra flota ABAJO en una cápsula, como la de Safari en el iPhone; y en escritorio, con
//     el menú encogido, la barra desaparece y se funde con el menú (☰ y logo arriba, ajustes y cuenta abajo).
//   - El primer Tab lleva a «Saltar al contenido» (WCAG 2.4.1) y el contenido es <main>. Respeta el área segura del
//     iPhone (la muesca) cuando la app corre instalada.
//   - Huecos para extender sin tocar el framework: headerActions, sidebarFooter, accountMenuItems, accountSettings, ribbons.
//   - Los ajustes de la app (letra, idioma, claro u oscuro y los del proyecto) van DENTRO del menú de la cuenta, no sueltos
//     en la barra (HeaderTools).
//   - El menú queda al alcance de las páginas (appMenuContext): PageHeading arma sus migas sola.
//   - Con el vidrio del tema (createToolkitTheme({glass: true})): el lienzo lleva manchas de color, y en escritorio la
//     barra y el menú lateral flotan a 8 px de la orilla y entre ellos, con esquinas redondas, para que el contenido pase
//     por detrás y se vea desenfocado; encogido, el menú es una cápsula. En el teléfono la barra sigue de orilla a orilla
//     (como en iOS). Sin vidrio, todo igual que siempre: el marco lo sabe por el tema (isGlassTheme), sin otra prop.
//   - Con vidrio y con el minimalista la barra no lleva franja, como las ventanas de macOS Tahoe (TOP_BAR.capsules, lo de
//     omisión): la ☰ con el nombre, el menú de arriba y la cuenta van cada uno en su cápsula, y el título queda suelto.
//     Con vidrio las cápsulas son de vidrio y el contenido pasa por debajo, desenfocado en la orilla (scrollEdgeStylesOf);
//     con el minimalista son bloques del tono de las tarjetas sobre la barra del color del fondo, también en el teléfono.
//     Con cápsulas el menú encogido ya no se funde con la barra: la cuenta y los ajustes se quedan arriba. Con
//     bar: TOP_BAR.band, la franja de lado a lado. Mismo alto y mismo lugar las dos: el menú lateral y las páginas no se
//     mueven.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaAppLayout con defaultProps y
// styleOverrides de sus partes: skipLink, brand, brandLogo, brandText, brandName, brandCaption, titleArea, phoneTitle,
// desktopTitle, railBrand, railLogo, collapseButton, root, scrollEdge, bar, toolbar, menuButton, spacer, tools,
// progress, body, drawer, main, phoneSlot, content, phoneDrawer.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {useToolkitNavigation, useToolkitSettings} from '@/toolkit/toolkitContext.js';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {useTheme} from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

import {AppMenuContext} from '@/appShell/appMenuContext.js';
import BarCapsule from '@/appShell/BarCapsule.jsx';
import {BarActionsSlotContext} from '@/appShell/barActionsSlot.js';
import HeaderTools from '@/appShell/HeaderTools.jsx';
import MobileTabBar from '@/appShell/MobileTabBar.jsx';
import Wordmark from '@/appShell/Wordmark.jsx';
import {PageTitleProvider, usePageTitle} from '@/appShell/pageTitle.jsx';
import {
    APP_BAR_HEIGHT_PIXELS, DESKTOP_MEDIA_QUERY, DRAWER_WIDTH_COLLAPSED, DRAWER_WIDTH_EXPANDED, GLASS_PANEL_GAP_PIXELS, MAIN_CONTENT_ID,
    FLOATING_BOTTOM_SPACE_CSS_VARIABLE, MOBILE_TAB_BAR_HEIGHT_PIXELS, PHONE_MEDIA_QUERY, drawerTransitionOf,
} from '@/appShell/shellSizes.js';
import SideMenu from '@/appShell/SideMenu.jsx';
import {usesMobileTabBar} from '@/appShell/tabBarRule.js';
import TopMenu from '@/appShell/TopMenu.jsx';
import {useDrawerCollapsed} from '@/appShell/useDrawerCollapsed.js';
import ComponentTexts from '@/toolkit/ComponentTexts.jsx';
import NewBuildNotice, {NEW_BUILD_NOTICE_VARIANT} from '@/feedback/NewBuildNotice.jsx';
import {activeMenuItemOf, menuItemsWithIconsOf} from '@/navigation/appMenu.js';
import {useNavigationTrail} from '@/navigationTrail.js';
import {THEME_LOOK, TOP_BAR} from '@/theme/createToolkitTheme.js';
import {PANEL_RADIUS, ambientBackgroundOf, isGlassTheme, scrollEdgeStylesOf} from '@/theme/glassSurface.js';
import GlassLensFilter from '@/ui/layout/GlassLensFilter.jsx';
import {APP_BAR_HEIGHT, useAppBarHeightPublisher} from '@/ui/layout/appBarHeight.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaAppLayout)
const THEME_NAME = 'CalcitaAppLayout';
const LayoutSkipLink = piecePart(THEME_NAME, 'SkipLink', Link);
const LayoutBrand = piecePart(THEME_NAME, 'Brand', ButtonBase);
const LayoutBrandLogo = piecePart(THEME_NAME, 'BrandLogo', Box);
const LayoutBrandText = piecePart(THEME_NAME, 'BrandText', Box);
const LayoutBrandName = piecePart(THEME_NAME, 'BrandName', Typography);
const LayoutBrandCaption = piecePart(THEME_NAME, 'BrandCaption', Typography);
const LayoutTitleArea = piecePart(THEME_NAME, 'TitleArea', Box);
const LayoutPhoneTitle = piecePart(THEME_NAME, 'PhoneTitle', Typography);
const LayoutDesktopTitle = piecePart(THEME_NAME, 'DesktopTitle', Typography);
const LayoutRailBrand = piecePart(THEME_NAME, 'RailBrand', ButtonBase);
const LayoutRailLogo = piecePart(THEME_NAME, 'RailLogo', Box);
const LayoutCollapseButton = piecePart(THEME_NAME, 'CollapseButton', IconButton);
const LayoutRoot = piecePart(THEME_NAME, 'Root', Box);
const LayoutScrollEdge = piecePart(THEME_NAME, 'ScrollEdge', Box);
const LayoutBar = piecePart(THEME_NAME, 'Bar', AppBar);
const LayoutToolbar = piecePart(THEME_NAME, 'Toolbar', Toolbar);
const LayoutMenuButton = piecePart(THEME_NAME, 'MenuButton', IconButton);
const LayoutSpacer = piecePart(THEME_NAME, 'Spacer', Box);
const LayoutTools = piecePart(THEME_NAME, 'Tools', Box);
const LayoutProgress = piecePart(THEME_NAME, 'Progress', LinearProgress);
const LayoutBody = piecePart(THEME_NAME, 'Body', Box);
const LayoutDrawer = piecePart(THEME_NAME, 'Drawer', Drawer);
const LayoutMain = piecePart(THEME_NAME, 'Main', Box);
const LayoutPhoneSlot = piecePart(THEME_NAME, 'PhoneSlot', Box);
const LayoutContent = piecePart(THEME_NAME, 'Content', Box);
const LayoutPhoneDrawer = piecePart(THEME_NAME, 'PhoneDrawer', Drawer);

/** Los dos estilos de barra. */
export const MENU_POSITION = Object.freeze({side: 'side', top: 'top'});

const NAVIGATING_BAR_PIXELS = 2;

/**
 * Un grupo de la barra: con la barra en cápsulas, su cápsula (BarCapsule: de vidrio, o con el minimalista un bloque del
 * tono de las tarjetas); con la franja, sus piezas tal cual (sin caja de más, para que la franja se quede idéntica).
 */
const BarGroup = ({isCapsule, sx, children}) => {
    if (!isCapsule) {
        return children;
    }
    // presentation: lo de adentro (la ☰, el nombre, la cuenta) ya se anuncia solo; el grupo es solo la forma
    return <BarCapsule role="presentation" sx={sx}>{children}</BarCapsule>;
};

/** «Saltar al contenido»: escondido arriba hasta que llega el foco del teclado. */
const SkipToContentLink = () => {
    const {t} = useToolkitTranslation('layout');
    return (
        <LayoutSkipLink href={`#${MAIN_CONTENT_ID}`} ownSx={{
            position: 'absolute', left: 8, top: -48, zIndex: (theme) => theme.zIndex.tooltip + 1, bgcolor: 'background.paper',
            px: 1.5, py: 0.75, borderRadius: 1, boxShadow: 3, '&:focus': {top: 8},
        }}>
            {t('skipToContent')}
        </LayoutSkipLink>
    );
};

/** El logo y el nombre de la app en la barra (con su renglón chico, si lo hay), o el logo ancho; lleva al inicio. */
const BarBrand = ({logo, wordmark, brandName, brandCaption, homePath, sx}) => {
    const {Link: RouterLink} = useToolkitNavigation();
    return (
        <LayoutBrand component={RouterLink} to={homePath} aria-label={wordmark ? brandName : undefined}
                    ownSx={[{alignItems: 'center', gap: 1.25, borderRadius: 1, flexShrink: 0, minWidth: 0, pr: 1, textAlign: 'left'}, sx]}>
            {wordmark ? <Wordmark>{wordmark}</Wordmark> : (
                <>
                    {logo && <LayoutBrandLogo ownSx={{width: 28, height: 28, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{logo}</LayoutBrandLogo>}
                    <LayoutBrandText ownSx={{minWidth: 0}}>
                        <LayoutBrandName variant="subtitle2" component="span" noWrap ownSx={{display: 'block', fontWeight: 600, lineHeight: 1.3}}>{brandName}</LayoutBrandName>
                        {/* el renglón chico hereda el color de la barra (sobre el naranja, el gris del texto secundario no se leía) */}
                        {brandCaption && <LayoutBrandCaption variant="caption" component="span" noWrap ownSx={{display: 'block', lineHeight: 1.3, opacity: 0.8}}>{brandCaption}</LayoutBrandCaption>}
                    </LayoutBrandText>
                </>
            )}
        </LayoutBrand>
    );
};

/**
 * El título en la barra: en escritorio, después del nombre de la app y solo cuando el título grande ya no se ve; en el
 * teléfono siempre (o el nombre de la app).
 */
const BarTitle = ({brandName}) => {
    const {title, isTitleVisible} = usePageTitle();
    return (
        <LayoutTitleArea ownSx={{flexGrow: 1, minWidth: 0}}>
            <LayoutPhoneTitle variant="subtitle1" component="p" noWrap ownSx={{display: 'block', [DESKTOP_MEDIA_QUERY]: {display: 'none'}, fontWeight: 600}}>{title ?? brandName}</LayoutPhoneTitle>
            <Fade in={Boolean(title) && !isTitleVisible}>
                <LayoutDesktopTitle variant="subtitle1" component="p" noWrap
                            ownSx={{display: 'none', [DESKTOP_MEDIA_QUERY]: {display: 'block'}, fontWeight: 600, ml: 1, pl: 2, borderLeft: '1px solid color-mix(in srgb, currentColor 30%, transparent)'}}>
                    {title}
                </LayoutDesktopTitle>
            </Fade>
        </LayoutTitleArea>
    );
};

/** El logo solo, arriba del menú encogido que hace de barra; lleva al inicio. */
const RailBrand = ({logo, brandName, homePath}) => {
    const {Link: RouterLink} = useToolkitNavigation();
    return (
        <Tooltip title={brandName} placement="right">
            <LayoutRailBrand component={RouterLink} to={homePath} aria-label={brandName}
                        ownSx={{width: 44, height: 44, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <LayoutRailLogo ownSx={{width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{logo}</LayoutRailLogo>
            </LayoutRailBrand>
        </Tooltip>
    );
};

/** La ☰ de escritorio: encoge el menú lateral a solo íconos o lo vuelve a abrir. */
const CollapseMenuButton = ({collapsed, onToggle}) => {
    const {t} = useToolkitTranslation('layout');
    const label = collapsed ? t('drawer.expand') : t('drawer.collapse');
    return (
        <Tooltip title={label}>
            <LayoutCollapseButton aria-label={label} aria-expanded={!collapsed} onClick={onToggle} ownSx={{display: 'none', [DESKTOP_MEDIA_QUERY]: {display: 'inline-flex'}, color: 'inherit'}}>
                {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
            </LayoutCollapseButton>
        </Tooltip>
    );
};

const AppLayoutFrame = ({
    logo, wordmark, brandName, brandCaption, homePath, menuItems, menuPosition, user, profilePath, accountMenuItems, onSignOut, isSigningOut, headerActions,
    accountSettings, menuBadges, sidebarFooter, showFontSizeToggle, showLanguageToggle, showColorSchemeToggle, ribbons, isNavigating, defaultCollapsed, minimizeTabBarOnScroll, contentMaxWidth,
    onMenuCollapse, onMobileMenuChange, onMobileTabsChange, children,
}) => {
    const {t} = useToolkitTranslation('layout');
    const {useLocation} = useToolkitNavigation();
    const {pathname} = useLocation();
    const {collapsed, toggle} = useDrawerCollapsed(defaultCollapsed);
    const [isMobileMenuOpen, setIsMobileMenuOpenState] = useState(false);
    // cada cambio del menú también sale afuera (para medir, o para que el proyecto guarde la preferencia en su servidor)
    const toggleCollapsed = () => {
        toggle();
        onMenuCollapse?.(!collapsed);
    };
    const setIsMobileMenuOpen = (isOpen) => {
        setIsMobileMenuOpenState(isOpen);
        onMobileMenuChange?.(isOpen);
    };
    const appBarRef = useAppBarHeightPublisher();
    useNavigationTrail();

    const theme = useTheme();
    const isGlass = isGlassTheme(theme);
    // la barra de pestañas del teléfono (estilo Apple): con vidrio, y con el minimalista en cápsulas (usesMobileTabBar);
    // sin vidrio, o con el minimalista en franja, se queda la barra de MUI arriba con su cajón
    const usesTabBar = usesMobileTabBar(theme);

    const isSideMenu = menuPosition !== MENU_POSITION.top;
    // con vidrio y el menú encogido, en escritorio la barra de arriba desaparece y se funde con el menú: la ☰ y el logo van
    // arriba del menú y los ajustes y la cuenta abajo (lo pidió el autor). Si el proyecto trae avisos en la barra (ribbons),
    // la barra se queda: los avisos no tendrían dónde ir
    // la barra sin franja, en cápsulas (lo de omisión con vidrio y con el minimalista; TOP_BAR.band pide la franja). El
    // estilo de Stackcraft sin vidrio se queda con su barra de siempre
    const isMinimalLook = theme.toolkit?.look === THEME_LOOK.minimal;
    const usesBarCapsules = (isGlass || isMinimalLook) && theme.toolkit?.bar === TOP_BAR.capsules;
    // con vidrio, o con cápsulas, la barra y el menú lateral van a GLASS_PANEL_GAP_PIXELS de la orilla: la columna del menú
    // mide eso de más. OJO: con el minimalista en cápsulas era 0 y las cápsulas quedaban pegadas arriba (a 4 px) y el menú
    // pegado a la izquierda (lo reportó el autor; medido en Chrome)
    const panelGap = isGlass || usesBarCapsules ? GLASS_PANEL_GAP_PIXELS : 0;
    // con cápsulas no se funde: no hay franja que esconder, y la cuenta y los ajustes se quedan arriba en su cápsula en
    // lugar de bajar al pie del menú encogido (lo pidió el autor)
    const isBarMerged = isGlass && isSideMenu && collapsed && !ribbons && !usesBarCapsules;
    const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED;
    const activeItem = activeMenuItemOf(menuItems, pathname);
    const sideMenuProps = {logo, wordmark, brandName, brandCaption, homePath, menuItems, activeItem, menuBadges, footer: sidebarFooter};
    // el lugar de la barra donde caen las acciones de cada pantalla (BarActions); con la barra fundida con el menú no hay
    // barra en escritorio y se quedan en la pantalla
    const [barActionsSlot, setBarActionsSlot] = useState(null);
    // en el teléfono con cápsulas no hay barra de arriba (la de pestañas va abajo): las acciones flotan arriba a la derecha
    const usesPhoneFloatingActions = usesTabBar && usesBarCapsules;
    const [phoneBarActionsSlot, setPhoneBarActionsSlot] = useState(null);
    const barActions = useMemo(() => ({
        slot: isBarMerged ? null : barActionsSlot,
        phoneSlot: usesPhoneFloatingActions ? phoneBarActionsSlot : null,
        usesCapsules: usesBarCapsules,
    }), [isBarMerged, barActionsSlot, usesPhoneFloatingActions, phoneBarActionsSlot, usesBarCapsules]);

    return (
        <BarActionsSlotContext.Provider value={barActions}>
        <LayoutRoot ownSx={[{display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default'}, isGlass && ambientBackgroundOf]}>
            <SkipToContentLink />
            <GlassLensFilter />

            {/* en cápsulas, lo que pasa por debajo de la barra se desenfoca en la orilla: debajo del menú lateral, que sigue nítido */}
            {isGlass && usesBarCapsules && (
                <LayoutScrollEdge aria-hidden="true"
                     ownSx={(theme) => ({
                         ...scrollEdgeStylesOf(theme), display: 'none', [DESKTOP_MEDIA_QUERY]: {display: 'block'},
                         position: 'fixed', top: 0, left: 0, right: 0, height: `calc(${APP_BAR_HEIGHT} + ${panelGap}px)`,
                         zIndex: theme.zIndex.drawer - 1, pointerEvents: 'none',
                     })} />
            )}
            {/* en cápsulas con vidrio la barra va transparente (color="transparent": el tema no le pone vidrio) y cada grupo
                lleva el suyo; con el minimalista se queda del color del fondo, que tapa lo que pasa por debajo */}
            <LayoutBar ref={appBarRef} position="sticky" color={isGlass && usesBarCapsules ? 'transparent' : undefined}
                    ownSx={(theme) => ({
                        pt: 'env(safe-area-inset-top)',
                        // encima del menú lateral, como en el DashboardLayout de MUI
                        zIndex: theme.zIndex.drawer + 1,
                        // con vidrio flota: en escritorio arriba, separada de las orillas; en el teléfono ABAJO, en una cápsula,
                        // como la barra de Safari en el iPhone (en el teléfono se veía cuadrada y pegada arriba; lo reportaron).
                        // Abajo se suma la zona del gesto de inicio del iPhone (safe-area) a la separación
                        ...(isGlass && {
                            // en cápsulas no se recorta: la sombra de cada cápsula se saldría cortada
                            overflow: usesBarCapsules ? 'visible' : 'hidden',
                            [DESKTOP_MEDIA_QUERY]: {
                                top: panelGap, mt: `${panelGap}px`, mx: `${panelGap}px`, width: 'auto',
                                borderRadius: PANEL_RADIUS,
                                // sin la raya de abajo de la barra fija: no hay franja que separar
                                ...(usesBarCapsules && {borderBottom: 0, boxShadow: 'none'}),
                                ...(isBarMerged && {display: 'none'}),
                            },
                        }),
                        // el minimalista en cápsulas no flota (su barra es del color del fondo y tapa lo que pasa por debajo):
                        // la separación de las orillas va por dentro, para que las cápsulas queden donde las del vidrio
                        ...(!isGlass && usesBarCapsules && {
                            [DESKTOP_MEDIA_QUERY]: {pt: `calc(env(safe-area-inset-top) + ${panelGap}px)`, px: `${panelGap}px`},
                        }),
                        // en el teléfono la barra de pestañas (MobileTabBar) la reemplaza: con ella van el menú y la cuenta
                        ...(usesTabBar && {[PHONE_MEDIA_QUERY]: {display: 'none'}}),
                    })}>
                {/* a la izquierda, la ☰ queda alineada con los íconos del menú lateral (los dos a 32 px de su orilla) */}
                <LayoutToolbar disableGutters ownSx={{minHeight: {xs: APP_BAR_HEIGHT_PIXELS, sm: APP_BAR_HEIGHT_PIXELS}, gap: 1, pl: {xs: 1.5, md: isSideMenu ? 1.5 : 3}, pr: {xs: 1.5, md: 3}}}>
                    {/* la ☰ del teléfono va en la primera cápsula (en escritorio la de encoger el menú y el nombre). OJO: dentro de
                        una cápsula, sin el margen negativo de «orilla de inicio» de MUI (-12 px): el botón quedaba pegado a la
                        curva. Así su círculo queda concéntrico con la cápsula */}
                    <BarGroup isCapsule={usesBarCapsules}>
                        <LayoutMenuButton edge="start" aria-label={t('drawer.open')} aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(true)}
                                    ownSx={{display: 'inline-flex', [DESKTOP_MEDIA_QUERY]: {display: 'none'}, color: 'inherit', ...((isGlass || usesBarCapsules) && {ml: 0})}}>
                            <MenuIcon />
                        </LayoutMenuButton>
                        {isSideMenu && <CollapseMenuButton collapsed={collapsed} onToggle={toggleCollapsed} />}
                        <BarBrand logo={logo} wordmark={wordmark} brandName={brandName} brandCaption={brandCaption} homePath={homePath}
                                  sx={isSideMenu ? {display: 'none', [DESKTOP_MEDIA_QUERY]: {display: 'flex'}} : {display: 'flex'}} />
                    </BarGroup>
                    {isSideMenu ? (
                        <BarTitle brandName={brandName} />
                    ) : (
                        <>
                            {/* el menú de arriba no sale en el teléfono: su cápsula tampoco (vacía se vería) */}
                            <BarGroup isCapsule={usesBarCapsules} sx={{display: 'none', [DESKTOP_MEDIA_QUERY]: {display: 'flex'}}}>
                                <TopMenu menuItems={menuItems} activeItem={activeItem} />
                            </BarGroup>
                            <LayoutSpacer ownSx={{flexGrow: 1}} />
                        </>
                    )}
                    {/* las acciones de la pantalla abierta (BarActions, y las de PageHeading con cápsulas): cada grupo cae aquí,
                        antes de la cuenta. Solo en escritorio: en el teléfono flotan arriba (phoneBarActionsSlot, en el contenido) */}
                    <LayoutTools ref={setBarActionsSlot} ownSx={{display: 'none', [DESKTOP_MEDIA_QUERY]: {display: 'flex'}, alignItems: 'center', gap: 1, minWidth: 0}} />
                    <BarGroup isCapsule={usesBarCapsules}>
                        <HeaderTools headerActions={headerActions} accountSettings={accountSettings} showFontSizeToggle={showFontSizeToggle} showLanguageToggle={showLanguageToggle}
                                     showColorSchemeToggle={showColorSchemeToggle} user={user} profilePath={profilePath} accountMenuItems={accountMenuItems}
                                     onSignOut={onSignOut} isSigningOut={isSigningOut} />
                    </BarGroup>
                </LayoutToolbar>
                {ribbons}
                {/* con la barra de pestañas el aviso de versión nueva flota aparte, en su cápsula (en el teléfono esta barra no
                    se ve); sin ella, franja dentro de la barra */}
                {!usesTabBar && <NewBuildNotice />}
                {isNavigating && (
                    <LayoutProgress aria-label={t('navigating')} color="inherit"
                                    ownSx={{position: 'absolute', bottom: 0, left: 0, right: 0, height: NAVIGATING_BAR_PIXELS}} />
                )}
            </LayoutBar>
            {usesTabBar && <NewBuildNotice variant={NEW_BUILD_NOTICE_VARIANT.floating} />}
            {usesTabBar && (
                <MobileTabBar menuItems={menuItems} activeItem={activeItem} menuBadges={menuBadges} moreFooter={sidebarFooter} minimizeOnScroll={minimizeTabBarOnScroll}
                              onPinnedTabsChange={onMobileTabsChange}
                              account={(
                                  <HeaderTools headerActions={headerActions} accountSettings={accountSettings} showFontSizeToggle={showFontSizeToggle}
                                               showLanguageToggle={showLanguageToggle} showColorSchemeToggle={showColorSchemeToggle} user={user}
                                               profilePath={profilePath} accountMenuItems={accountMenuItems} onSignOut={onSignOut} isSigningOut={isSigningOut} />
                              )} />
            )}

            <LayoutBody ownSx={{display: 'flex', flexGrow: 1, minWidth: 0}}>
                {isSideMenu && (
                    <LayoutDrawer variant="permanent"
                            ownSx={(theme) => ({
                                display: 'none', [DESKTOP_MEDIA_QUERY]: {display: 'block'}, width: drawerWidth + panelGap, flexShrink: 0, whiteSpace: 'nowrap',
                                transition: drawerTransitionOf(theme),
                                '& .MuiDrawer-paper': {
                                    width: drawerWidth, left: panelGap, boxSizing: 'border-box', overflowX: 'hidden', transition: drawerTransitionOf(theme, ['width']),
                                    // justo debajo de la barra (su alto real, con avisos o sin ellos) y hasta abajo; si la barra se
                                    // fundió con el menú, de arriba a abajo
                                    ...(isBarMerged
                                        ? {top: panelGap, height: `calc(100% - ${panelGap * 2}px)`}
                                        : {top: `calc(${APP_BAR_HEIGHT} + ${panelGap}px)`, height: `calc(100% - ${APP_BAR_HEIGHT} - ${panelGap * 2}px)`}),
                                    // el panel flotante: separado de las orillas y sin la línea de la derecha (lo separa su brillo).
                                    // Encogido es una cápsula (radio de la mitad de su ancho), como las barras de pestañas de vidrio
                                    ...(isGlass && {
                                        border: 0,
                                        borderRadius: PANEL_RADIUS,
                                    }),
                                },
                            })}>
                        <SideMenu {...sideMenuProps} showBrand={false} collapsed={collapsed}
                                  railTop={isBarMerged ? (
                                      <>
                                          <CollapseMenuButton collapsed={collapsed} onToggle={toggleCollapsed} />
                                          {logo && <RailBrand logo={logo} brandName={brandName} homePath={homePath} />}
                                      </>
                                  ) : undefined}
                                  railBottom={isBarMerged ? (
                                      <HeaderTools vertical headerActions={headerActions} accountSettings={accountSettings} showFontSizeToggle={showFontSizeToggle}
                                                   showLanguageToggle={showLanguageToggle} showColorSchemeToggle={showColorSchemeToggle} user={user}
                                                   profilePath={profilePath} accountMenuItems={accountMenuItems} onSignOut={onSignOut}
                                                   isSigningOut={isSigningOut} />
                                  ) : undefined} />
                    </LayoutDrawer>
                )}

                <LayoutMain component="main" id={MAIN_CONTENT_ID} tabIndex={-1}
                     ownSx={(theme) => ({
                         flexGrow: 1, minWidth: 0, outline: 'none', px: {xs: 2, md: 3, lg: 4}, pt: 3, pb: 6,
                         // con la barra de pestañas abajo (teléfono): arriba, lugar para la hora y la cámara del iPhone; abajo,
                         // lugar para que la barra (que flota a GLASS_PANEL_GAP_PIXELS) no tape el final de la página
                         ...(usesTabBar && {
                             [PHONE_MEDIA_QUERY]: {
                                 pt: `calc(${theme.spacing(3)} + env(safe-area-inset-top))`,
                                 pb: `calc(${MOBILE_TAB_BAR_HEIGHT_PIXELS.portrait + GLASS_PANEL_GAP_PIXELS * 2}px + env(safe-area-inset-bottom) + ${theme.spacing(3)} + var(${FLOATING_BOTTOM_SPACE_CSS_VARIABLE}, 0px))`,
                             },
                         }),
                     })}>
                    {/* teléfono con cápsulas: el renglón de las acciones de la pantalla, arriba a la derecha. Va pegado (sticky)
                        y no fijo: así ocupa su lugar arriba de la página (no tapa las migas ni el título) y al bajar se queda
                        flotando. Vacío no se ve. Solo las cápsulas reciben clics: el hueco de la izquierda deja pasar el dedo
                        a lo de abajo */}
                    {usesPhoneFloatingActions && (
                        <LayoutPhoneSlot ref={setPhoneBarActionsSlot} data-phone-bar-actions=""
                             ownSx={(theme) => ({
                                 display: 'none',
                                 [PHONE_MEDIA_QUERY]: {
                                     display: 'flex', '&:empty': {display: 'none'},
                                     position: 'sticky', top: `calc(env(safe-area-inset-top) + ${GLASS_PANEL_GAP_PIXELS}px)`, zIndex: theme.zIndex.appBar,
                                     justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 2,
                                     pointerEvents: 'none', '& > *': {pointerEvents: 'auto'},
                                 },
                             })} />
                    )}
                    <LayoutContent ownSx={{maxWidth: contentMaxWidth, mx: 'auto'}}>{children}</LayoutContent>
                </LayoutMain>
            </LayoutBody>

            {/* el cajón del teléfono (los dos estilos): con el logo arriba, se cierra al elegir una pantalla */}
            <LayoutPhoneDrawer variant="temporary" open={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} ModalProps={{keepMounted: true}}
                    ownSx={{[DESKTOP_MEDIA_QUERY]: {display: 'none'}}}
                    slotProps={{paper: {sx: {width: DRAWER_WIDTH_EXPANDED, boxSizing: 'border-box', pt: 'env(safe-area-inset-top)', pb: 'env(safe-area-inset-bottom)'}}}}>
                <SideMenu {...sideMenuProps} collapsed={false} onNavigate={() => setIsMobileMenuOpen(false)} />
            </LayoutPhoneDrawer>
        </LayoutRoot>
        </BarActionsSlotContext.Provider>
    );
};

/**
 * @param {object} props
 * @param {import('react').ReactNode} [props.logo] el logo chico (28 px), en la barra junto al nombre y en el cajón del teléfono
 * @param {import('react').ReactNode | {light?: import('react').ReactNode, dark?: import('react').ReactNode}} [props.wordmark] el logo
 *     ancho, la marca con su nombre en una sola imagen (como el de muchas empresas), o uno para cada modo ({light, dark}: el de
 *     color en claro y el blanco en oscuro): va en lugar del logo y el nombre en la barra y arriba del menú del teléfono, a 24 px de alto. Con el menú
 *     encogido se queda el logo chico (logo), si lo hay. brandName sigue siendo su nombre para el lector de pantalla
 * @param {string} [props.brandName] el nombre de la app; por omisión el appName de ToolkitProvider
 * @param {string} [props.brandCaption] el renglón chico debajo del nombre («Panel de administración»)
 * @param {string} [props.homePath] por omisión '/'
 * @param {object[]} [props.menuItems] lo que regresa composeMenu
 * @param {'side'|'top'} [props.menuPosition] por omisión 'side' (MENU_POSITION)
 * @param {{name: string, email?: string, subtitle?: string, avatarUrl?: string}|null} [props.user] quién está dentro
 * @param {string} [props.profilePath] la ruta de Mi perfil
 * @param {object[]} [props.accountMenuItems] renglones propios en el menú de la cuenta ({to | onClick, label | labelKey, Icon})
 * @param {() => void} [props.onSignOut] sin él no sale «Salir» (una app sin sesión)
 * @param {boolean} [props.isSigningOut]
 * @param {import('react').ReactNode} [props.headerActions] botones propios en la barra, antes de la cuenta
 * @param {Record<string, number>} [props.menuBadges] los conteos del servidor por badgeKey de cada entrada del menú
 *     (useMenuBadges): lo pendiente de cada pantalla, como numerito
 * @param {import('react').ReactNode} [props.accountSettings] ajustes propios del proyecto dentro del menú de la cuenta, debajo de
 *     letra, idioma y claro u oscuro (con SettingSection, para que se vean igual)
 * @param {import('react').ReactNode} [props.sidebarFooter] lo de abajo del menú lateral (una tarjeta de ayuda…)
 * @param {boolean} [props.showFontSizeToggle] por omisión sí
 * @param {boolean} [props.showLanguageToggle] por omisión sí
 * @param {boolean} [props.showColorSchemeToggle] por omisión sí
 * @param {import('react').ReactNode} [props.ribbons] avisos propios dentro de la barra
 * @param {boolean} [props.isNavigating] la pantalla siguiente se está descargando (react-router: useIsNavigating)
 * @param {boolean} [props.defaultCollapsed] el menú lateral empieza encogido (la persona lo cambia y se recuerda)
 * @param {boolean} [props.minimizeTabBarOnScroll] en el teléfono con vidrio, la barra de pestañas se encoge al leer hacia
 *     abajo y regresa al subir (como iOS 26); por omisión sí
 * @param {number|string} [props.contentMaxWidth] por omisión 1400
 * @param {(collapsed: boolean) => void} [props.onMenuCollapse] la persona encogió (true) o abrió (false) el menú lateral
 * @param {(isOpen: boolean) => void} [props.onMobileMenuChange] se abrió o se cerró el menú del teléfono (el cajón)
 * @param {(keys: string[]|null) => void} [props.onMobileTabsChange] la persona eligió sus pestañas del teléfono (las llaves
 *     de menuItemKeyOf; null: regresó a las de omisión). Se recuerdan en el navegador; con esto el proyecto las puede guardar
 *     en su servidor
 * @param {object} [props.texts] los textos que cambian, con la forma de `layout` en los textos del paquete (para todo el marco)
 * @param {import('react').ReactNode} props.children el contenido
 */
export const AppLayout = (props) => {
    // lo que el proyecto puso en su tema (components.CalcitaAppLayout.defaultProps) y encima lo que llega aquí
    const {
    logo, wordmark, brandName, brandCaption, homePath = '/', menuItems = [], menuPosition = MENU_POSITION.side, user = null, profilePath, accountMenuItems = [], onSignOut,
    isSigningOut = false, headerActions, accountSettings, menuBadges, sidebarFooter, showFontSizeToggle = true, showLanguageToggle = true, showColorSchemeToggle = true, ribbons,
    isNavigating = false, defaultCollapsed = false, minimizeTabBarOnScroll = true, contentMaxWidth = 1400, onMenuCollapse, onMobileMenuChange, onMobileTabsChange,
    texts, children,
    ...unknownProps
} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {appName} = useToolkitSettings();
    // un ícono ya pintado (icon) se vuelve componente aquí, una vez: las piezas del menú pintan siempre Icon
    const shownMenuItems = useMemo(() => menuItemsWithIconsOf(menuItems), [menuItems]);
    const appMenu = useMemo(() => ({menuItems: shownMenuItems}), [shownMenuItems]);
    // los textos del marco llegan a todas sus piezas (la cuenta, el menú, las pestañas del teléfono), cada una lee los suyos
    return (
        <ComponentTexts namespace="layout" texts={texts}>
            <PageTitleProvider>
                <AppMenuContext.Provider value={appMenu}>
                    <AppLayoutFrame logo={logo} wordmark={wordmark} brandName={brandName ?? appName} brandCaption={brandCaption} homePath={homePath} menuItems={shownMenuItems} menuPosition={menuPosition}
                                    user={user} profilePath={profilePath} accountMenuItems={accountMenuItems} onSignOut={onSignOut} isSigningOut={isSigningOut}
                                    headerActions={headerActions} accountSettings={accountSettings} menuBadges={menuBadges} sidebarFooter={sidebarFooter} showFontSizeToggle={showFontSizeToggle}
                                    showLanguageToggle={showLanguageToggle} showColorSchemeToggle={showColorSchemeToggle} ribbons={ribbons}
                                    isNavigating={isNavigating} defaultCollapsed={defaultCollapsed} minimizeTabBarOnScroll={minimizeTabBarOnScroll}
                                    contentMaxWidth={contentMaxWidth} onMenuCollapse={onMenuCollapse} onMobileMenuChange={onMobileMenuChange}
                                    onMobileTabsChange={onMobileTabsChange}>
                        {children}
                    </AppLayoutFrame>
                </AppMenuContext.Provider>
            </PageTitleProvider>
        </ComponentTexts>
    );
};
