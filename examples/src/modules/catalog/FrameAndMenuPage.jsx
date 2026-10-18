// Hecho en Calcita · el marco: lo que rodea a todas las pantallas (la barra, el menú, la cuenta). Cada sección dice para qué
// sirve en una línea, enseña el código mínimo y trae su tabla «Cómo se extiende» (cada opción, qué hace y un ejemplo).
// La de los botones de una pantalla tiene ejemplo vivo: pone sus cápsulas en la barra de esta misma app.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import ScreenCapsules from '@/modules/catalog/demos/shell/ScreenCapsules.tsx';

const loadLayout = () => import('@/modules/catalog/demos/shell/AppShellSetup.tsx?demo-source');
const loadMenu = () => import('@/modules/catalog/demos/shell/moduleMenu.tsx?demo-source');
const loadCapsules = () => import('@/modules/catalog/demos/shell/ScreenCapsules.tsx?demo-source');
const loadBack = () => import('@/modules/catalog/demos/shell/BackToList.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (shell.<sección>.extend.<id>)
const LAYOUT_EXTENSIONS = [
    {id: 'brand', option: 'logo · brandName · brandCaption', example: 'brandCaption="Panel de administración"'},
    {id: 'menuPosition', option: 'menuPosition', example: 'menuPosition={MENU_POSITION.top}'},
    {id: 'headerActions', option: 'headerActions', example: 'headerActions={<HelpButton />}'},
    {id: 'accountMenuItems', option: 'accountMenuItems', example: "accountMenuItems={[{to: '/billing', label: 'Facturación', Icon: ReceiptIcon}]}"},
    {id: 'accountSettings', option: 'accountSettings', example: 'accountSettings={<MySetting />}'},
    {id: 'sidebarFooter', option: 'sidebarFooter', example: 'sidebarFooter={<HelpCard />}'},
    {id: 'ribbons', option: 'ribbons', example: 'ribbons={<MaintenanceNotice />}'},
    {id: 'toggles', option: 'showFontSizeToggle · showLanguageToggle · showColorSchemeToggle', example: 'showLanguageToggle={false}'},
    {id: 'defaultCollapsed', option: 'defaultCollapsed', example: 'defaultCollapsed'},
    {id: 'minimizeTabBar', option: 'minimizeTabBarOnScroll', example: 'minimizeTabBarOnScroll={false}'},
    {id: 'contentMaxWidth', option: 'contentMaxWidth', example: 'contentMaxWidth={1200}'},
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
    {id: 'mobileTab', option: 'mobileTab', example: 'mobileTab: true'},
];
const CAPSULES_EXTENSIONS = [
    {id: 'barActions', option: '<BarActions>', example: '<BarActions label="Pedidos">…</BarActions>'},
    {id: 'barActionButton', option: '<BarActionButton>', example: '<BarActionButton label="Agregar" icon={<AddIcon />} onClick={open} />'},
    {id: 'more', option: '«⋯» en el teléfono', example: '(sale solo cuando no caben)'},
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

export const FrameAndMenuPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensions.map(({id, option, example}) => ({option, example, what: t(`shell.${section}.extend.${id}`)}));

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
        </Stack>
    );
};
