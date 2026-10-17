// La ruta de «Perfiles y permisos».
import {APP_PATHS} from '@/core';

// lazy: la pantalla se descarga hasta que alguien la abre, no en la primera carga
export const routes = [
    {path: APP_PATHS.profiles, lazy: async () => ({Component: (await import('@/modules/profiles/ProfilesPage.jsx')).ProfilesPage})},
];
