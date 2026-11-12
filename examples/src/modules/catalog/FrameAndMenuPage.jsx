// Hecho en Calcita · el marco: lo que rodea a todas las pantallas (la barra, el menú, la cuenta). Cada sección dice para qué
// sirve en una línea, enseña el código mínimo y trae su tabla «Cómo se extiende» (cada opción, qué hace y un ejemplo).
// La de los botones de una pantalla tiene ejemplo vivo: pone sus cápsulas en la barra de esta misma app.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import HelpCarouselDemo from '@/modules/catalog/demos/shell/HelpCarouselDemo.tsx';
import PathIndexDemo from '@/modules/catalog/demos/shell/PathIndexDemo.tsx';
import RouteTabsDemo from '@/modules/catalog/demos/shell/RouteTabsDemo.tsx';
import ScreenCapsules from '@/modules/catalog/demos/shell/ScreenCapsules.tsx';

const loadLayout = () => import('@/modules/catalog/demos/shell/AppShellSetup.tsx?demo-source');
const loadMenu = () => import('@/modules/catalog/demos/shell/moduleMenu.tsx?demo-source');
const loadCapsules = () => import('@/modules/catalog/demos/shell/ScreenCapsules.tsx?demo-source');
const loadBack = () => import('@/modules/catalog/demos/shell/BackToList.tsx?demo-source');
const loadRouteTabs = () => import('@/modules/catalog/demos/shell/RouteTabsDemo.tsx?demo-source');
const loadHelpCarousel = () => import('@/modules/catalog/demos/shell/HelpCarouselDemo.tsx?demo-source');
const loadPathIndex = () => import('@/modules/catalog/demos/shell/PathIndexDemo.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (shell.<sección>.extend.<id>)
const LAYOUT_EXTENSIONS = [
    {id: 'brand', option: 'logo · brandName · brandCaption', example: 'brandCaption="Panel de administración"'},
    {id: 'wordmark', option: 'wordmark', example: 'wordmark={<img src={logoAncho} alt="" />}'},
    {id: 'wordmarkPair', option: 'wordmark {light, dark}', example: 'wordmark={{light: <img src={logoColor} alt="" />, dark: <img src={logoBlanco} alt="" />}}'},
    {id: 'menuPosition', option: 'menuPosition', example: 'menuPosition={MENU_POSITION.top}'},
    {id: 'headerActions', option: 'headerActions', example: 'headerActions={<HelpButton />}'},
    {id: 'accountMenuItems', option: 'accountMenuItems', example: "accountMenuItems={[{to: '/billing', label: 'Facturación', Icon: ReceiptIcon}]}"},
    {id: 'accountMenuLinks', option: 'accountMenuItems · href · onClick', example: "{label: 'Regresar al sistema', href: LEGACY_URL}"},
    {id: 'accountSettings', option: 'accountSettings', example: 'accountSettings={<MySetting />}'},
    {id: 'accountMenuPanel', option: 'CalcitaAccountMenu · slotProps.menu', example: "CalcitaAccountMenu: {defaultProps: {slotProps: {menu: {anchorOrigin: {vertical: 'top', horizontal: 'left'}}}}}"},
    {id: 'sidebarFooter', option: 'sidebarFooter', example: 'sidebarFooter={<HelpCard />}'},
    {id: 'ribbons', option: 'ribbons', example: 'ribbons={<MaintenanceNotice />}'},
    {id: 'toggles', option: 'showFontSizeToggle · showLanguageToggle · showColorSchemeToggle', example: 'showLanguageToggle={false}'},
    {id: 'defaultCollapsed', option: 'defaultCollapsed', example: 'defaultCollapsed'},
    {id: 'menuLabelOverflow', option: 'menuLabelOverflow', example: 'menuLabelOverflow={MENU_LABEL_OVERFLOW.wrap}'},
    {id: 'minimizeTabBar', option: 'minimizeTabBarOnScroll', example: 'minimizeTabBarOnScroll={false}'},
    {id: 'maxMobileTabs', option: 'maxMobileTabs', example: 'maxMobileTabs={6}'},
    {id: 'tabLabelLines', option: 'CalcitaMobileTabBar · tabLabelLines', example: 'CalcitaMobileTabBar: {defaultProps: {tabLabelLines: MOBILE_TAB_LABEL_LINES.one}}'},
    {id: 'mobileLabel', option: 'menu.js · mobileLabelKey', example: "{labelKey: 'reports:menu.label', mobileLabelKey: 'reports:menu.tabLabel'}"},
    {id: 'tabBarHeight', option: 'MOBILE_TAB_BAR_HEIGHT', example: 'bottom: `calc(${MOBILE_TAB_BAR_HEIGHT.portrait} + 24px)`'},
    {id: 'aboveTabBar', option: 'aboveMobileTabBarOf · PHONE_LANDSCAPE_MEDIA_QUERY', example: "sx={{position: 'fixed', right: 16, ...aboveMobileTabBarOf(8)}}"},
    {id: 'contentMaxWidth', option: 'contentMaxWidth', example: 'contentMaxWidth={1200}'},
    {id: 'scrollRestoration', option: 'scrollRestoration', example: 'scrollRestoration={false}  // el proyecto ya lo maneja por su cuenta'},
    {id: 'bar', option: 'createToolkitTheme({bar})', example: 'createToolkitTheme({glass: true, bar: TOP_BAR.band})'},
];
const MENU_EXTENSIONS = [
    {id: 'order', option: 'order', example: 'export const order = 10;'},
    {id: 'access', option: 'access', example: "export const access = {anyOf: ['orders.view', 'orders.admin']};"},
    {id: 'permissions', option: 'permissions', example: "export const permissions = [{key: 'orders.cancel', labelKey: '…'}];"},
    {id: 'buildMenuItems', option: 'buildMenuItems', example: 'export function buildMenuItems() { return [{…}, {…}]; }'},
    {id: 'label', option: 'label · labelKey', example: "label: 'Pedidos'"},
    {id: 'section', option: 'section · sectionKey', example: "section: 'Operación'"},
    {id: 'badgeKey', option: 'badgeKey', example: "badgeKey: 'orders'"},
    {id: 'badge', option: 'badge', example: "badge: 'Nuevo'"},
    {id: 'children', option: 'children', example: "children: [{to: '/orders/returns', label: 'Devoluciones'}]"},
    {id: 'href', option: 'href', example: "{href: 'https://sistema-anterior/inicio', label: 'Sistema anterior'}"},
    {id: 'icon', option: 'Icon · icon', example: 'icon: <Iconify icon="mdi:bank" />  // o Icon: AccountBalanceOutlinedIcon'},
    {id: 'mobileTab', option: 'mobileTab', example: 'mobileTab: true'},
    {id: 'matchPrefix', option: 'matchPrefix', example: "{to: '/rates/MXN', matchPrefix: '/rates'}"},
    {id: 'activeMenuPath', option: 'useActiveMenuPath()', example: "useActiveMenuPath('/orders')  // en la pantalla /receipts/15"},
];
const CAPSULES_EXTENSIONS = [
    {id: 'barActions', option: '<BarActions>', example: '<BarActions label="Pedidos">…</BarActions>'},
    {id: 'barActionButton', option: '<BarActionButton>', example: '<BarActionButton label="Agregar" icon={<AddIcon />} onClick={open} />'},
    {id: 'barActionLabel', option: 'showLabel', example: '<BarActionButton … showLabel={BAR_ACTION_LABEL.desktop} />'},
    {id: 'barActionDisabled', option: 'disabledSx', example: '<BarActionButton … disabled disabledSx={{opacity: 0.7}} />'},
    {id: 'more', option: '«⋯»', example: '(sale solo cuando no caben)'},
    {id: 'maxVisible', option: 'maxVisible', example: '<BarActions maxVisible={{phone: 3, desktop: 5}}>'},
    {id: 'order', option: 'order', example: '<BarActions order={1}>'},
    {id: 'sx', option: 'sx · inlineSx', example: "<BarActions sx={{gap: 1}} inlineSx={{justifyContent: 'flex-end'}}>"},
    {id: 'bare', option: 'bare', example: '<BarActions bare><MySearchBox /></BarActions>'},
    {id: 'pageHeading', option: 'PageHeading actions', example: '<PageHeading title="Pedidos" actions={<BarActionButton … />} />'},
    {id: 'headerActions', option: 'AppLayout headerActions', example: 'headerActions={<HelpButton />}'},
    {id: 'searchInBar', option: 'ServerTable searchInBar', example: '<ServerTable searchInBar … />'},
    {id: 'barCapsule', option: '<BarCapsule>', example: '<BarCapsule aria-label="Zoom">…</BarCapsule>'},
];
const BACK_EXTENSIONS = [
    {id: 'remember', option: 'useRememberListUrl(llave)', example: "useRememberListUrl('orders');"},
    {id: 'backButton', option: '<BackButton listKey>', example: "<BackButton listKey=\"orders\" fallbackTo=\"/orders\" />"},
    {id: 'fallbackTo', option: 'fallbackTo', example: 'fallbackTo="/orders"'},
    {id: 'label', option: 'label', example: 'label="Regresar a los pedidos"'},
];
const ROUTE_TABS_EXTENSIONS = [
    {id: 'path', option: 'tabs[].to · exact', example: "{to: `/customers/${id}/payments`, label: 'Pagos'}  // la activa sale de la ruta"},
    {id: 'query', option: 'mode="query" · paramName', example: '<RouteTabs mode={ROUTE_TABS_MODE.query} paramName="section" tabs={…} />'},
    {id: 'active', option: 'useActiveRouteTab', example: 'const activeTab = useActiveRouteTab(TABS, {mode: ROUTE_TABS_MODE.query});'},
    {id: 'replace', option: 'replace', example: '<RouteTabs mode={ROUTE_TABS_MODE.query} replace={false} …/>  // con ?tab= reemplazan el historial por omisión'},
    {id: 'perTab', option: 'icon · badge · access · disabled · hidden', example: "{value: 'files', label: 'Documentos', badge: 2, access: {ability: 'files.view'}}"},
    {id: 'onChange', option: 'onChange', example: 'onChange={(tab) => logTabView(tab.value)}'},
    {id: 'theme', option: 'theme.components.CalcitaRouteTabs', example: 'components: {CalcitaRouteTabs: {styleOverrides: {tab: {textTransform: \'none\'}}}}'},
];
const PATH_INDEX_EXTENSIONS = [
    {id: 'index', option: 'createPathIndex(glob)', example: "export const {pathOf} = createPathIndex(import.meta.glob('@/modules/**/paths.js', {eager: true}));"},
    {id: 'parts', option: 'pathOf(nombre, partes)', example: "pathOf('admin:profile:detail', {groupId: 2, userId: 7675, tab: 'documentos'})"},
    {id: 'api', option: "createPathIndex(glob, {exportName: 'uris'})", example: "api.get(uriOf('billing:invoice', {id}))  // las del API, igual"},
    {id: 'separator', option: "createPathIndex(glob, {separator: '.'})", example: "pathOf('admin.profile.detail', {groupId: 2, userId: 7675})  // con punto, como los textos"},
    {id: 'fill', option: 'fillPath(ruta, partes)', example: "fillPath('/orders/:orderId', {orderId: 12})  // '/orders/12'"},
    {id: 'base', option: 'documentBasePath()', example: "createBrowserRouter(routes, {basename: documentBasePath() || '/'})  // el prefijo del <base href>"},
    {id: 'texts', option: 'combineTexts(archivos)', example: "combineTexts(Object.values(import.meta.glob('@/modules/**/*Texts.js', {eager: true})).flatMap(Object.values))"},
];
const HELP_CAROUSEL_EXTENSIONS = [
    {id: 'steps', option: 'steps[].title · content · image · media', example: "{title: 'Filtre', content: 'Los filtros se guardan…', image: '/ayuda/filtros.png', imageAlt: 'Los filtros'}"},
    {id: 'when', option: 'useHelpCarousel({helpKey, version, autoOpen})', example: "const help = useHelpCarousel({helpKey: 'reports', version: '2'});"},
    {id: 'server', option: 'seen · onClose(reason, {dontShowAgain})', example: 'useHelpCarousel({helpKey, seen: !user.first_instructions})  // lo que sabe su servidor'},
    {id: 'button', option: '<HelpButton>', example: '<PageHeading … actions={<HelpButton onClick={help.openHelp} />} />'},
    {id: 'options', option: 'title · showDontShowAgain · onStepChange · initialStep', example: 'onStepChange={(index) => logHelpStep(index)}'},
    {id: 'theme', option: 'theme.components.CalcitaHelpCarouselDialog', example: 'components: {CalcitaHelpCarouselDialog: {styleOverrides: {media: {height: 240}}}}'},
];

export const FrameAndMenuPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `shell.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('shell.title')} description={t('shell.description')} />
            <CodeSection title={t('shell.layout.title')} description={t('shell.layout.description')}
                         extensions={rowsOf('layout', LAYOUT_EXTENSIONS)} loadSource={loadLayout} />
            <CodeSection title={t('shell.menu.title')} description={t('shell.menu.description')}
                         extensions={rowsOf('menu', MENU_EXTENSIONS)} loadSource={loadMenu} />
            <DemoSection title={t('shell.capsules.title')} description={t('shell.capsules.description')}
                         extensions={rowsOf('capsules', CAPSULES_EXTENSIONS)} Demo={ScreenCapsules} loadSource={loadCapsules} />
            <CodeSection title={t('shell.back.title')} description={t('shell.back.description')}
                         extensions={rowsOf('back', BACK_EXTENSIONS)} loadSource={loadBack} />
            <DemoSection title={t('shell.routeTabs.title')} description={t('shell.routeTabs.description')}
                         extensions={rowsOf('routeTabs', ROUTE_TABS_EXTENSIONS)} Demo={RouteTabsDemo} loadSource={loadRouteTabs} />
            <DemoSection title={t('shell.helpCarousel.title')} description={t('shell.helpCarousel.description')}
                         extensions={rowsOf('helpCarousel', HELP_CAROUSEL_EXTENSIONS)} Demo={HelpCarouselDemo} loadSource={loadHelpCarousel} />
            <DemoSection title={t('shell.pathIndex.title')} description={t('shell.pathIndex.description')}
                         extensions={rowsOf('pathIndex', PATH_INDEX_EXTENSIONS)} Demo={PathIndexDemo} loadSource={loadPathIndex} />
        </Stack>
    );
};
