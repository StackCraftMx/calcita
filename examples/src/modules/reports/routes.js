// Las rutas del ejemplo de descargas y Excel.
import {APP_PATHS} from '@/core';

// lazy: la pantalla se descarga hasta que alguien la abre, no en la primera carga
export const routes = [
    {path: APP_PATHS.reports, lazy: async () => ({Component: (await import('@/modules/reports/ReportsPage.jsx')).ReportsPage})},
];
