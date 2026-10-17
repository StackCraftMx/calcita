// La ruta del ejemplo de vidrio líquido.
import {APP_PATHS} from '@/core';

// lazy: la pantalla se descarga hasta que alguien la abre, no en la primera carga
export const routes = [
    {path: APP_PATHS.glass, lazy: async () => ({Component: (await import('@/modules/glass/GlassPage.jsx')).GlassPage})},
];
