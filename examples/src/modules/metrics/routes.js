// Las rutas del ejemplo de métricas y gráficas.
import {APP_PATHS} from '@/core';

// lazy: la pantalla (y las gráficas de recharts) se descarga hasta que alguien la abre, no en la primera carga
export const routes = [
    {path: APP_PATHS.metrics, lazy: async () => ({Component: (await import('@/modules/metrics/MetricsPage.jsx')).MetricsPage})},
];
