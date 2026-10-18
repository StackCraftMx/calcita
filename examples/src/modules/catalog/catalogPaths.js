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
    charts: `${CATALOG_ROOT}/charts`,
    timeline: `${CATALOG_ROOT}/timeline`,
});

export const BUILT_IN_PATHS = Object.freeze({
    account: `${BUILT_IN_ROOT}/account`,
    api: `${BUILT_IN_ROOT}/api`,
    translations: `${BUILT_IN_ROOT}/translations`,
    security: `${BUILT_IN_ROOT}/web-security`,
    maps: `${BUILT_IN_ROOT}/maps`,
    calendar: `${BUILT_IN_ROOT}/calendar`,
    kanban: `${BUILT_IN_ROOT}/kanban`,
    inbox: `${BUILT_IN_ROOT}/inbox`,
});
