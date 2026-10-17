// La ruta del configurador de tema.
import {APP_PATHS} from '@/core';

// lazy: la pantalla se descarga hasta que alguien la abre, no en la primera carga
export const routes = [
    {path: APP_PATHS.themeBuilder, lazy: async () => ({Component: (await import('@/modules/themeBuilder/ThemeBuilderPage.jsx')).ThemeBuilderPage})},
];
