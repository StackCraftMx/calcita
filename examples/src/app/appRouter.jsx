// Las rutas de la app: AppProviders por fuera (conecta el framework), las de entrar (sin sesión) y las de cada módulo
// dentro del marco (AppShell, que pide sesión).
//
// Las rutas no se escriben aquí: cada módulo las declara en su routes.js y se descubren solas. `routes` van dentro del
// marco, cada grupo con el permiso del menu.js de su módulo (withAccess: quien no puede ve la página de «sin permiso»);
// `publicRoutes` van fuera (iniciar sesión, «¿olvidó su contraseña?»). Módulo nuevo = cero ediciones aquí.
//
// Cada pantalla viaja en su propio archivo (lazy): si se publicó otra versión con la pestaña abierta, withChunkRecovery
// recarga una vez, y si una pantalla truena RouteErrorScreen dice qué pasó con su botón para recargar.
import {createBrowserRouter} from 'react-router';
import {ERROR_PAGE_KIND, ErrorPage, FullPageLoader} from '@stackcraftmx/calcita';
import {RouteErrorScreen, withAccess, withChunkRecovery} from '@stackcraftmx/calcita/react-router';

import {AppProviders} from '@/app/AppProviders.jsx';
import {AppShell} from '@/app/AppShell.jsx';
import {APP_PATHS, ROUTER_BASENAME} from '@/core';

const ROUTE_MODULES = import.meta.glob('@/modules/*/routes.js', {eager: true});
const MENU_MODULES = import.meta.glob('@/modules/*/menu.js', {eager: true});

// el grupo de rutas de cada módulo, con la regla de su menu.js (el que está junto a su routes.js)
const moduleRouteGroups = Object.entries(ROUTE_MODULES)
    .filter(([, routeModule]) => routeModule.routes?.length)
    .map(([routesPath, routeModule]) => {
        const menuModule = MENU_MODULES[routesPath.replace(/routes\.js$/, 'menu.js')];
        return withAccess(menuModule?.access, routeModule.routes);
    });

// las pantallas de entrar: fuera del marco, sin sesión
const publicRoutes = Object.values(ROUTE_MODULES).flatMap((routeModule) => routeModule.publicRoutes ?? []);

export const appRouter = createBrowserRouter([
    {
        path: APP_PATHS.home,
        element: <AppProviders />,
        // lo que se ve al abrir la app directo en un ejemplo, mientras se descarga su pantalla (las rutas son lazy)
        HydrateFallback: FullPageLoader,
        ErrorBoundary: RouteErrorScreen,
        children: withChunkRecovery([
            ...publicRoutes,
            {
                element: <AppShell />,
                children: [
                    ...moduleRouteGroups,
                    {path: '*', element: <ErrorPage kind={ERROR_PAGE_KIND.notFound} />},
                ],
            },
        ]),
    },
// detrás de un proxy con prefijo (ASSET_URL=/demo) las rutas viven bajo /demo: el router lo quita al leer la dirección y lo
// pone en cada liga; las pantallas siguen escribiendo sus rutas desde la raíz (APP_PATHS)
], {basename: ROUTER_BASENAME});
