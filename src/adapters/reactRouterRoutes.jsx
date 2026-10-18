// Lo que conecta los permisos y la barra con react-router (@stackcraftmx/calcita/react-router):
//
//   withAccess(access, routes)   un grupo de rutas con la regla del menu.js de su módulo: quien no puede ve la página de
//                                «sin permiso» en lugar de la pantalla
//   useIsNavigating()            la pantalla siguiente se está descargando (rutas lazy): para la rayita de AppLayout
//   withChunkRecovery(routes)    las rutas lazy recargan UNA vez si su archivo es de una versión que ya no existe
//   RouteErrorScreen             la pantalla de error de una ruta (errorElement / ErrorBoundary del router): «Hay una
//                                versión nueva» o «Algo falló», con su botón para recargar
//
//   import {access} from '@/modules/users/menu.js';
//   import {routes} from '@/modules/users/routes.js';
//   children: [withAccess(access, routes)]
//
// OJO: useIsNavigating solo funciona con un router de datos (createBrowserRouter); con <BrowserRouter> no hay estado de
// navegación.
//
// Genéricos del paquete: function (regla de la casa).
import {useEffect} from 'react';
import {Outlet, isRouteErrorResponse, useNavigation, useOutletContext, useRouteError} from 'react-router';

import RequireAccess from '@/access/RequireAccess.jsx';
import {isStaleChunkError, recoverFromStaleChunk} from '@/api/staleChunks.js';
import {createLogger} from '@/observability/logger.js';
import ErrorPage, {ERROR_PAGE_KIND} from '@/ui/layout/ErrorPage.jsx';

const log = createLogger('navigation');
const NOT_FOUND_STATUS = 404;

/**
 * El grupo con permiso: RequireAccess alrededor de las rutas hijas.
 *
 * OJO, trampa pagada: un <Outlet /> nuevo corta el contexto que la ruta de arriba le pasa a sus hijas (<Outlet
 * context={...} />, useOutletContext); el inicio de los ejemplos tronaba sin el menú. Aquí se pasa tal cual.
 *
 * @param {{access: object|undefined}} props
 */
function AccessOutlet({access}) {
    const parentContext = useOutletContext();
    return <RequireAccess access={access}><Outlet context={parentContext} /></RequireAccess>;
}

/**
 * Un grupo de rutas sin camino propio que pide permiso antes de pintar a sus hijas.
 *
 * @param {object|undefined} access la regla (accessRules.js); sin ella, el grupo es de todos
 * @param {object[]} routes las rutas del módulo
 * @returns {object} la ruta de react-router
 */
export function withAccess(access, routes) {
    return {element: <AccessOutlet access={access} />, children: routes};
}

/**
 * ¿Se está descargando la pantalla siguiente?
 *
 * @returns {boolean}
 */
export function useIsNavigating() {
    return useNavigation().state === 'loading';
}

/**
 * Las rutas con la recuperación de archivos viejos (staleChunks.js): cada `lazy`, también la de las hijas, recarga la
 * página UNA vez si el archivo de su pantalla ya no existe porque se publicó otra versión. Lo demás de la ruta no cambia.
 *
 * @param {object[]} routes
 * @returns {object[]}
 */
export function withChunkRecovery(routes) {
    return routes.map((route) => ({
        ...route,
        ...(typeof route.lazy === 'function' && {lazy: () => route.lazy().catch(recoverFromStaleChunk)}),
        ...(route.children && {children: withChunkRecovery(route.children)}),
    }));
}

/** Recargar la página: trae la versión publicada. */
function reloadPage() {
    window.location.reload();
}

/**
 * La pantalla de error de una ruta (la que el router enseña cuando la pantalla truena o no se pudo descargar): una ruta
 * que no existe es «Esta página no existe»; un archivo de otra versión, «Hay una versión nueva»; lo demás, «Algo falló de
 * nuestro lado». Las dos últimas con su botón para recargar.
 *
 *   createBrowserRouter([{path: '/', element: <App />, ErrorBoundary: RouteErrorScreen, children: [...]}])
 */
export function RouteErrorScreen() {
    const error = useRouteError();
    const isNotFound = isRouteErrorResponse(error) && error.status === NOT_FOUND_STATUS;
    const kind = isNotFound ? ERROR_PAGE_KIND.notFound : (isStaleChunkError(error) ? ERROR_PAGE_KIND.newVersion : ERROR_PAGE_KIND.serverError);

    useEffect(() => {
        if (!isNotFound) {
            log.error('una pantalla no se pudo pintar', {name: error?.name, message: error?.message ?? String(error)});
        }
    }, [error, isNotFound]);

    return <ErrorPage kind={kind} onRetry={isNotFound ? undefined : reloadPage} />;
}
