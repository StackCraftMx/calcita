// Las rutas del ejemplo de avisos, confirmación y espera.
import {APP_PATHS} from '@/core';

// lazy: la pantalla se descarga hasta que alguien la abre, no en la primera carga
export const routes = [
    {path: APP_PATHS.feedback, lazy: async () => ({Component: (await import('@/modules/feedback/FeedbackPage.jsx')).FeedbackPage})},
];
