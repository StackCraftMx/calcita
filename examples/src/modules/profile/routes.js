// La ruta de «Mi perfil». No está en el menú lateral (no tiene menu.js): se llega desde el menú de la cuenta (profilePath
// de AppLayout). Sin menu.js tampoco pide permiso: toda persona con sesión ve su perfil.
import {APP_PATHS} from '@/core';

// lazy: la pantalla se descarga hasta que alguien la abre, no en la primera carga
export const routes = [
    {path: APP_PATHS.profile, lazy: async () => ({Component: (await import('@/modules/profile/ProfilePage.jsx')).ProfilePage})},
];
