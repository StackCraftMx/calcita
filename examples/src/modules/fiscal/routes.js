// Las rutas de los documentos fiscales.
import {APP_PATHS} from '@/core';

export const routes = [
    {path: APP_PATHS.fiscal, lazy: async () => ({Component: (await import('@/modules/fiscal/FiscalPage.jsx')).FiscalPage})},
];
