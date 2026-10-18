// La ruta de Mi perfil. No tiene menu.js: se llega desde el menú de la cuenta (profilePath de AppLayout).
import {APP_PATHS} from '@/core';

export const routes = [
    {path: APP_PATHS.profile, lazy: async () => ({Component: (await import('@/modules/profile/ProfilePage.jsx')).ProfilePage})},
];
