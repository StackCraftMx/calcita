// Las rutas del catálogo: una pantalla por grupo de piezas, en «Componentes» y en «Hecho en Calcita».
import {BUILT_IN_PATHS, CATALOG_PATHS} from '@/modules/catalog/catalogPaths.js';

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
    {path: BUILT_IN_PATHS.account, lazy: async () => ({Component: (await import('@/modules/catalog/AccountPage.jsx')).AccountPage})},
    {path: BUILT_IN_PATHS.translations, lazy: async () => ({Component: (await import('@/modules/catalog/TranslationsPage.jsx')).TranslationsPage})},
    {path: BUILT_IN_PATHS.api, lazy: async () => ({Component: (await import('@/modules/catalog/ApiPage.jsx')).ApiPage})},
    {path: BUILT_IN_PATHS.security, lazy: async () => ({Component: (await import('@/modules/catalog/SecurityPage.jsx')).SecurityPage})},
    {path: BUILT_IN_PATHS.maps, lazy: async () => ({Component: (await import('@/modules/catalog/MapsPage.jsx')).MapsPage})},
    {path: BUILT_IN_PATHS.calendar, lazy: async () => ({Component: (await import('@/modules/catalog/CalendarPage.jsx')).CalendarPage})},
    {path: BUILT_IN_PATHS.kanban, lazy: async () => ({Component: (await import('@/modules/catalog/KanbanPage.jsx')).KanbanPage})},
    {path: BUILT_IN_PATHS.inbox, lazy: async () => ({Component: (await import('@/modules/catalog/InboxPage.jsx')).InboxPage})},
];
