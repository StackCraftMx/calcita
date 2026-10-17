// Las rutas del ejemplo de subir archivos.
import {APP_PATHS} from '@/core';

// lazy: la pantalla (y FilePond que trae) se descarga hasta que alguien la abre, no en la primera carga
export const routes = [
    {path: APP_PATHS.uploads, lazy: async () => ({Component: (await import('@/modules/uploads/UploadsPage.jsx')).UploadsPage})},
];
