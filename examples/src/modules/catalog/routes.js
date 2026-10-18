// Las rutas del catálogo de componentes: una pantalla por grupo de piezas.
import {CATALOG_PATHS} from '@/modules/catalog/catalogPaths.js';

// lazy: cada pantalla se descarga hasta que alguien la abre
export const routes = [
    {path: CATALOG_PATHS.buttons, lazy: async () => ({Component: (await import('@/modules/catalog/ButtonsPage.jsx')).ButtonsPage})},
    {path: CATALOG_PATHS.chips, lazy: async () => ({Component: (await import('@/modules/catalog/ChipsPage.jsx')).ChipsPage})},
    {path: CATALOG_PATHS.inputs, lazy: async () => ({Component: (await import('@/modules/catalog/InputsPage.jsx')).InputsPage})},
    {path: CATALOG_PATHS.selection, lazy: async () => ({Component: (await import('@/modules/catalog/SelectionPage.jsx')).SelectionPage})},
    {path: CATALOG_PATHS.feedback, lazy: async () => ({Component: (await import('@/modules/catalog/AlertsPage.jsx')).AlertsPage})},
    {path: CATALOG_PATHS.overlays, lazy: async () => ({Component: (await import('@/modules/catalog/OverlaysPage.jsx')).OverlaysPage})},
    {path: CATALOG_PATHS.navigation, lazy: async () => ({Component: (await import('@/modules/catalog/NavigationPage.jsx')).NavigationPage})},
    {path: CATALOG_PATHS.surfaces, lazy: async () => ({Component: (await import('@/modules/catalog/SurfacesPage.jsx')).SurfacesPage})},
    {path: CATALOG_PATHS.charts, lazy: async () => ({Component: (await import('@/modules/catalog/ChartsPage.jsx')).ChartsPage})},
    {path: CATALOG_PATHS.timeline, lazy: async () => ({Component: (await import('@/modules/catalog/TimelinePage.jsx')).TimelinePage})},
    {path: CATALOG_PATHS.translations, lazy: async () => ({Component: (await import('@/modules/catalog/TranslationsPage.jsx')).TranslationsPage})},
    {path: CATALOG_PATHS.api, lazy: async () => ({Component: (await import('@/modules/catalog/ApiPage.jsx')).ApiPage})},
];
