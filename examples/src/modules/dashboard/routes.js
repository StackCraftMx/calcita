// La ruta del tablero.
import {APP_PATHS} from '@/core';

// lazy: la pantalla se descarga hasta que alguien la abre, no en la primera carga
export const routes = [
    {path: APP_PATHS.dashboard, lazy: async () => ({Component: (await import('@/modules/dashboard/DashboardPage.jsx')).DashboardPage})},
];
