// Las rutas de la app con la recuperación de una versión publicada: cada pantalla viaja en su propio archivo (lazy) y, si
// se publicó otra versión con la pestaña abierta, su archivo ya no existe. withChunkRecovery recarga UNA vez; si vuelve a
// fallar, o la pantalla truena por otra cosa, RouteErrorScreen dice qué pasó con su botón para recargar.
import {createBrowserRouter} from 'react-router';
import {RouteErrorScreen, withChunkRecovery} from '@stackcraftmx/calcita/react-router';

export const appRouter = createBrowserRouter([
    {
        path: '/',
        lazy: async () => ({Component: (await import('./AppLayoutRoute')).default}),
        // 1. La pantalla de error de todas las rutas de adentro
        ErrorBoundary: RouteErrorScreen,
        // 2. Las pantallas, envueltas: si su archivo ya no existe, recarga una vez
        children: withChunkRecovery([
            {index: true, lazy: async () => ({Component: (await import('./HomePage')).default})},
            {path: 'orders', lazy: async () => ({Component: (await import('./OrdersPage')).default})},
        ]),
    },
]);
