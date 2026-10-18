// Las direcciones del catálogo: «Componentes» (los de MUI con el estilo de Calcita) y «Hecho en Calcita» (las piezas
// propias del framework). Una página por grupo.
const CATALOG_ROOT = '/components';
const BUILT_IN_ROOT = '/built-in';

export const CATALOG_PATHS = Object.freeze({
    buttons: `${CATALOG_ROOT}/buttons`,
    chips: `${CATALOG_ROOT}/chips`,
    inputs: `${CATALOG_ROOT}/inputs`,
    selection: `${CATALOG_ROOT}/selection`,
    feedback: `${CATALOG_ROOT}/feedback`,
    overlays: `${CATALOG_ROOT}/overlays`,
    navigation: `${CATALOG_ROOT}/navigation`,
    surfaces: `${CATALOG_ROOT}/surfaces`,
    timeline: `${CATALOG_ROOT}/timeline`,
});

export const BUILT_IN_PATHS = Object.freeze({
    account: `${BUILT_IN_ROOT}/account`,
    charts: `${BUILT_IN_ROOT}/charts`,
    api: `${BUILT_IN_ROOT}/api`,
    downloads: `${BUILT_IN_ROOT}/downloads`,
    translations: `${BUILT_IN_ROOT}/translations`,
    security: `${BUILT_IN_ROOT}/web-security`,
    maps: `${BUILT_IN_ROOT}/maps`,
    calendar: `${BUILT_IN_ROOT}/calendar`,
    kanban: `${BUILT_IN_ROOT}/kanban`,
    inbox: `${BUILT_IN_ROOT}/inbox`,
    installApp: `${BUILT_IN_ROOT}/install-app`,
    errorsAndLogs: `${BUILT_IN_ROOT}/errors-and-logs`,
    themeAndGlass: `${BUILT_IN_ROOT}/theme-and-glass`,
    shell: `${BUILT_IN_ROOT}/frame-and-menu`,
    forms: `${BUILT_IN_ROOT}/forms`,
    permissions: `${BUILT_IN_ROOT}/permissions`,
    uploads: `${BUILT_IN_ROOT}/file-uploads`,
    excelReports: `${BUILT_IN_ROOT}/excel-and-csv`,
    formats: `${BUILT_IN_ROOT}/formats-and-money`,
    dictionaries: `${BUILT_IN_ROOT}/dictionaries`,
    cards: `${BUILT_IN_ROOT}/headers-and-cards`,
    confirmAndNotify: `${BUILT_IN_ROOT}/confirm-and-notify`,
    serverTable: `${BUILT_IN_ROOT}/server-table`,
});
