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
import HeaderTools from '@/appShell/HeaderTools.jsx';
import MobileTabBar from '@/appShell/MobileTabBar.jsx';
import {PageTitleProvider, usePageTitle} from '@/appShell/pageTitle.jsx';
import {
    APP_BAR_HEIGHT_PIXELS, DESKTOP_MEDIA_QUERY, DRAWER_WIDTH_COLLAPSED, DRAWER_WIDTH_EXPANDED, GLASS_PANEL_GAP_PIXELS, MAIN_CONTENT_ID,
    MOBILE_TAB_BAR_HEIGHT_PIXELS, PHONE_MEDIA_QUERY, drawerTransitionOf,
} from '@/appShell/shellSizes.js';
import SideMenu from '@/appShell/SideMenu.jsx';
import TopMenu from '@/appShell/TopMenu.jsx';
import {useDrawerCollapsed} from '@/appShell/useDrawerCollapsed.js';
import NewBuildNotice, {NEW_BUILD_NOTICE_VARIANT} from '@/feedback/NewBuildNotice.jsx';
import {activeMenuItemOf} from '@/navigation/appMenu.js';
import {useNavigationTrail} from '@/navigationTrail.js';
import {GLASS_PANEL_RADIUS_PIXELS, ambientBackgroundOf, isGlassTheme} from '@/theme/glassSurface.js';
import GlassLensFilter from '@/ui/layout/GlassLensFilter.jsx';
import {APP_BAR_HEIGHT, useAppBarHeightPublisher} from '@/ui/layout/appBarHeight.js';

/** Los dos estilos de barra. */
export const MENU_POSITION = Object.freeze({side: 'side', top: 'top'});

const NAVIGATING_BAR_PIXELS = 2;

/** «Saltar al contenido»: escondido arriba hasta que llega el foco del teclado. */
const SkipToContentLink = () => {
    const {t} = useToolkitTranslation('layout');
    return (
        <Link href={`#${MAIN_CONTENT_ID}`} sx={{
            position: 'absolute', left: 8, top: -48, zIndex: (theme) => theme.zIndex.tooltip + 1, bgcolor: 'background.paper',
            px: 1.5, py: 0.75, borderRadius: 1, boxShadow: 3, '&:focus': {top: 8},
        }}>
            {t('skipToContent')}
        </Link>
    );
};

/** El logo y el nombre de la app en la barra (con su renglón chico, si lo hay); lleva al inicio. */
const BarBrand = ({logo, brandName, brandCaption, homePath, sx}) => {
    const {Link: RouterLink} = useToolkitNavigation();
    return (
        <ButtonBase component={RouterLink} to={homePath}
                    sx={[{alignItems: 'center', gap: 1.25, borderRadius: 1, flexShrink: 0, minWidth: 0, pr: 1, textAlign: 'left'}, sx]}>
            {logo && <Box sx={{width: 28, height: 28, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{logo}</Box>}
            <Box sx={{minWidth: 0}}>
                <Typography variant="subtitle2" component="span" noWrap sx={{display: 'block', fontWeight: 600, lineHeight: 1.3}}>{brandName}</Typography>
                {/* el renglón chico hereda el color de la barra (sobre el naranja, el gris del texto secundario no se leía) */}
                {brandCaption && <Typography variant="caption" component="span" noWrap sx={{display: 'block', lineHeight: 1.3, opacity: 0.8}}>{brandCaption}</Typography>}
            </Box>
        </ButtonBase>
    );
};

/**
 * El título en la barra: en escritorio, después del nombre de la app y solo cuando el título grande ya no se ve; en el
 * teléfono siempre (o el nombre de la app).
 */
const BarTitle = ({brandName}) => {
    const {title, isTitleVisible} = usePageTitle();
    return (
        <Box sx={{flexGrow: 1, minWidth: 0}}>
            <Typography variant="subtitle1" component="p" noWrap sx={{display: 'block', [DESKTOP_MEDIA_QUERY]: {display: 'none'}, fontWeight: 600}}>{title ?? brandName}</Typography>
            <Fade in={Boolean(title) && !isTitleVisible}>
                <Typography variant="subtitle1" component="p" noWrap
                            sx={{display: 'none', [DESKTOP_MEDIA_QUERY]: {display: 'block'}, fontWeight: 600, ml: 1, pl: 2, borderLeft: '1px solid color-mix(in srgb, currentColor 30%, transparent)'}}>
                    {title}
                </Typography>
            </Fade>
        </Box>
    );
};

/** El logo solo, arriba del menú encogido que hace de barra; lleva al inicio. */
const RailBrand = ({logo, brandName, homePath}) => {
    const {Link: RouterLink} = useToolkitNavigation();
    return (
        <Tooltip title={brandName} placement="right">
            <ButtonBase component={RouterLink} to={homePath} aria-label={brandName}
                        sx={{width: 44, height: 44, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Box sx={{width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{logo}</Box>
            </ButtonBase>
        </Tooltip>
    );
};

/** La ☰ de escritorio: encoge el menú lateral a solo íconos o lo vuelve a abrir. */
const CollapseMenuButton = ({collapsed, onToggle}) => {
    const {t} = useToolkitTranslation('layout');
    const label = collapsed ? t('drawer.expand') : t('drawer.collapse');
    return (
        <Tooltip title={label}>
            <IconButton aria-label={label} aria-expanded={!collapsed} onClick={onToggle} sx={{display: 'none', [DESKTOP_MEDIA_QUERY]: {display: 'inline-flex'}, color: 'inherit'}}>
                {collapsed ? <MenuIcon /> : <MenuOpenIcon />}
            </IconButton>
        </Tooltip>
    );
};

const AppLayoutFrame = ({
    logo, brandName, brandCaption, homePath, menuItems, menuPosition, user, profilePath, accountMenuItems, onSignOut, isSigningOut, headerActions, accountSettings, menuBadges,
    sidebarFooter, showFontSizeToggle, showLanguageToggle, showColorSchemeToggle, ribbons, isNavigating, defaultCollapsed, minimizeTabBarOnScroll, contentMaxWidth,
    children,
}) => {
    const {t} = useToolkitTranslation('layout');
    const {useLocation} = useToolkitNavigation();
    const {pathname} = useLocation();
    const {collapsed, toggle} = useDrawerCollapsed(defaultCollapsed);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const appBarRef = useAppBarHeightPublisher();
    useNavigationTrail();

    const theme = useTheme();
    const isGlass = isGlassTheme(theme);
    // la barra de pestañas del teléfono (estilo Apple) va solo con vidrio; sin vidrio y con el minimalista se queda la barra de
    // MUI arriba con su cajón (en el minimalista la barra de abajo «se perdía», lo dijo el autor)
    const usesTabBar = isGlass;
    // con vidrio, la barra y el menú lateral flotan a GLASS_PANEL_GAP_PIXELS de la orilla: la columna del menú mide eso de más
    const panelGap = isGlass ? GLASS_PANEL_GAP_PIXELS : 0;

    const isSideMenu = menuPosition !== MENU_POSITION.top;
    // con vidrio y el menú encogido, en escritorio la barra de arriba desaparece y se funde con el menú: la ☰ y el logo van
    // arriba del menú y los ajustes y la cuenta abajo (lo pidió el autor). Si el proyecto trae avisos en la barra (ribbons),
    // la barra se queda: los avisos no tendrían dónde ir
    const isBarMerged = isGlass && isSideMenu && collapsed && !ribbons;
    const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED;
    const activeItem = activeMenuItemOf(menuItems, pathname);
    const sideMenuProps = {logo, brandName, brandCaption, homePath, menuItems, activeItem, menuBadges, footer: sidebarFooter};

    return (
        <Box sx={[{display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default'}, isGlass && ambientBackgroundOf]}>
            <SkipToContentLink />
            <GlassLensFilter />

            <AppBar ref={appBarRef} position="sticky"
                    sx={(theme) => ({
                        pt: 'env(safe-area-inset-top)',
                        // encima del menú lateral, como en el DashboardLayout de MUI
                        zIndex: theme.zIndex.drawer + 1,
                        // con vidrio flota: en escritorio arriba, separada de las orillas; en el teléfono ABAJO, en una cápsula,
                        // como la barra de Safari en el iPhone (en el teléfono se veía cuadrada y pegada arriba; lo reportaron).
                        // Abajo se suma la zona del gesto de inicio del iPhone (safe-area) a la separación
                        ...(isGlass && {
                            overflow: 'hidden',
                            [DESKTOP_MEDIA_QUERY]: {
                                top: panelGap, mt: `${panelGap}px`, mx: `${panelGap}px`, width: 'auto',
                                borderRadius: `${GLASS_PANEL_RADIUS_PIXELS}px`,
                                ...(isBarMerged && {display: 'none'}),
                            },
                        }),
                        // en el teléfono la barra de pestañas (MobileTabBar) la reemplaza: con ella van el menú y la cuenta
                        ...(usesTabBar && {[PHONE_MEDIA_QUERY]: {display: 'none'}}),
                    })}>
                {/* a la izquierda, la ☰ queda alineada con los íconos del menú lateral (los dos a 32 px de su orilla) */}
                <Toolbar disableGutters sx={{minHeight: {xs: APP_BAR_HEIGHT_PIXELS, sm: APP_BAR_HEIGHT_PIXELS}, gap: 1, pl: {xs: 1.5, md: isSideMenu ? 1.5 : 3}, pr: {xs: 1.5, md: 3}}}>
                    {/* OJO: en la cápsula del teléfono (vidrio) sin el margen negativo de «orilla de inicio» de MUI (-12 px): el
                        botón quedaba pegado a la curva. Así su círculo queda concéntrico con la cápsula (12 px de cada lado) */}
                    <IconButton edge="start" aria-label={t('drawer.open')} aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(true)}
                                sx={{display: 'inline-flex', [DESKTOP_MEDIA_QUERY]: {display: 'none'}, color: 'inherit', ...(isGlass && {ml: 0})}}>
                        <MenuIcon />
                    </IconButton>
                    {isSideMenu ? (
                        <>
                            <CollapseMenuButton collapsed={collapsed} onToggle={toggle} />
                            <BarBrand logo={logo} brandName={brandName} brandCaption={brandCaption} homePath={homePath} sx={{display: 'none', [DESKTOP_MEDIA_QUERY]: {display: 'flex'}}} />
                            <BarTitle brandName={brandName} />
                        </>
                    ) : (
                        <>
                            <BarBrand logo={logo} brandName={brandName} brandCaption={brandCaption} homePath={homePath} sx={{display: 'flex'}} />
                            <TopMenu menuItems={menuItems} activeItem={activeItem} />
                            <Box sx={{flexGrow: 1}} />
                        </>
                    )}
                    <HeaderTools headerActions={headerActions} accountSettings={accountSettings} showFontSizeToggle={showFontSizeToggle} showLanguageToggle={showLanguageToggle}
                                 showColorSchemeToggle={showColorSchemeToggle} user={user} profilePath={profilePath} accountMenuItems={accountMenuItems}
                                 onSignOut={onSignOut} isSigningOut={isSigningOut} />
                </Toolbar>
                {ribbons}
                {/* con vidrio el aviso de versión nueva flota aparte, en su cápsula (abajo); sin vidrio, franja dentro de la barra */}
                {!isGlass && <NewBuildNotice />}
                {isNavigating && (
                    <LinearProgress aria-label={t('navigating')} color="inherit"
                                    sx={{position: 'absolute', bottom: 0, left: 0, right: 0, height: NAVIGATING_BAR_PIXELS}} />
                )}
            </AppBar>
            {isGlass && <NewBuildNotice variant={NEW_BUILD_NOTICE_VARIANT.floating} />}
            {usesTabBar && (
                <MobileTabBar menuItems={menuItems} activeItem={activeItem} menuBadges={menuBadges} moreFooter={sidebarFooter} minimizeOnScroll={minimizeTabBarOnScroll}
                              account={(
                                  <HeaderTools headerActions={headerActions} accountSettings={accountSettings} showFontSizeToggle={showFontSizeToggle}
                                               showLanguageToggle={showLanguageToggle} showColorSchemeToggle={showColorSchemeToggle} user={user}
                                               profilePath={profilePath} accountMenuItems={accountMenuItems} onSignOut={onSignOut} isSigningOut={isSigningOut} />
                              )} />
            )}

            <Box sx={{display: 'flex', flexGrow: 1, minWidth: 0}}>
                {isSideMenu && (
                    <Drawer variant="permanent"
                            sx={(theme) => ({
                                display: 'none', [DESKTOP_MEDIA_QUERY]: {display: 'block'}, width: drawerWidth + panelGap, flexShrink: 0, whiteSpace: 'nowrap',
                                transition: drawerTransitionOf(theme),
                                '& .MuiDrawer-paper': {
                                    width: drawerWidth, boxSizing: 'border-box', overflowX: 'hidden', transition: drawerTransitionOf(theme, ['width']),
                                    // justo debajo de la barra (su alto real, con avisos o sin ellos) y hasta abajo; si la barra se
                                    // fundió con el menú, de arriba a abajo
                                    ...(isBarMerged
                                        ? {top: panelGap, height: `calc(100% - ${panelGap * 2}px)`}
                                        : {top: `calc(${APP_BAR_HEIGHT} + ${panelGap}px)`, height: `calc(100% - ${APP_BAR_HEIGHT} - ${panelGap * 2}px)`}),
                                    // el panel flotante: separado de las orillas y sin la línea de la derecha (lo separa su brillo).
                                    // Encogido es una cápsula (radio de la mitad de su ancho), como las barras de pestañas de vidrio
                                    ...(isGlass && {
                                        left: panelGap, border: 0,
                                        borderRadius: `${GLASS_PANEL_RADIUS_PIXELS}px`,
                                    }),
                                },
                            })}>
                        <SideMenu {...sideMenuProps} showBrand={false} collapsed={collapsed}
                                  railTop={isBarMerged ? (
                                      <>
                                          <CollapseMenuButton collapsed={collapsed} onToggle={toggle} />
                                          {logo && <RailBrand logo={logo} brandName={brandName} homePath={homePath} />}
                                      </>
                                  ) : undefined}
                                  railBottom={isBarMerged ? (
                                      <HeaderTools vertical headerActions={headerActions} accountSettings={accountSettings} showFontSizeToggle={showFontSizeToggle}
                                                   showLanguageToggle={showLanguageToggle} showColorSchemeToggle={showColorSchemeToggle} user={user}
                                                   profilePath={profilePath} accountMenuItems={accountMenuItems} onSignOut={onSignOut}
                                                   isSigningOut={isSigningOut} />
                                  ) : undefined} />
                    </Drawer>
                )}

                <Box component="main" id={MAIN_CONTENT_ID} tabIndex={-1}
                     sx={(theme) => ({
                         flexGrow: 1, minWidth: 0, outline: 'none', px: {xs: 2, md: 3, lg: 4}, pt: 3, pb: 6,
                         // con la barra de pestañas abajo (teléfono): arriba, lugar para la hora y la cámara del iPhone; abajo,
                         // lugar para que la barra (que flota a GLASS_PANEL_GAP_PIXELS) no tape el final de la página
                         ...(usesTabBar && {
                             [PHONE_MEDIA_QUERY]: {
                                 pt: `calc(${theme.spacing(3)} + env(safe-area-inset-top))`,
                                 pb: `calc(${MOBILE_TAB_BAR_HEIGHT_PIXELS.portrait + GLASS_PANEL_GAP_PIXELS * 2}px + env(safe-area-inset-bottom) + ${theme.spacing(3)})`,
                             },
                         }),
                     })}>
                    <Box sx={{maxWidth: contentMaxWidth, mx: 'auto'}}>{children}</Box>
                </Box>
            </Box>

            {/* el cajón del teléfono (los dos estilos): con el logo arriba, se cierra al elegir una pantalla */}
            <Drawer variant="temporary" open={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} ModalProps={{keepMounted: true}}
                    sx={{[DESKTOP_MEDIA_QUERY]: {display: 'none'}}}
                    slotProps={{paper: {sx: {width: DRAWER_WIDTH_EXPANDED, boxSizing: 'border-box', pt: 'env(safe-area-inset-top)', pb: 'env(safe-area-inset-bottom)'}}}}>
                <SideMenu {...sideMenuProps} collapsed={false} onNavigate={() => setIsMobileMenuOpen(false)} />
            </Drawer>
        </Box>
    );
};

/**
 * @param {object} props
 * @param {import('react').ReactNode} [props.logo] el logo chico (28 px), en la barra junto al nombre y en el cajón del teléfono
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
 * @param {import('react').ReactNode} props.children el contenido
 */
export const AppLayout = ({
    logo, brandName, brandCaption, homePath = '/', menuItems = [], menuPosition = MENU_POSITION.side, user = null, profilePath, accountMenuItems = [], onSignOut,
    isSigningOut = false, headerActions, accountSettings, menuBadges, sidebarFooter, showFontSizeToggle = true, showLanguageToggle = true, showColorSchemeToggle = true, ribbons,
    isNavigating = false, defaultCollapsed = false, minimizeTabBarOnScroll = true, contentMaxWidth = 1400, children,
}) => {
    const {appName} = useToolkitSettings();
    const appMenu = useMemo(() => ({menuItems}), [menuItems]);
    return (
        <PageTitleProvider>
            <AppMenuContext.Provider value={appMenu}>
                <AppLayoutFrame logo={logo} brandName={brandName ?? appName} brandCaption={brandCaption} homePath={homePath} menuItems={menuItems} menuPosition={menuPosition}
                                user={user} profilePath={profilePath} accountMenuItems={accountMenuItems} onSignOut={onSignOut} isSigningOut={isSigningOut}
                                headerActions={headerActions} accountSettings={accountSettings} menuBadges={menuBadges} sidebarFooter={sidebarFooter} showFontSizeToggle={showFontSizeToggle}
                                showLanguageToggle={showLanguageToggle} showColorSchemeToggle={showColorSchemeToggle} ribbons={ribbons}
                                isNavigating={isNavigating} defaultCollapsed={defaultCollapsed} minimizeTabBarOnScroll={minimizeTabBarOnScroll}
                                contentMaxWidth={contentMaxWidth}>
                    {children}
                </AppLayoutFrame>
            </AppMenuContext.Provider>
        </PageTitleProvider>
    );
};
