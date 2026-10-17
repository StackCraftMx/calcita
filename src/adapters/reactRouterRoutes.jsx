// Lo que conecta los permisos y la barra con react-router (@stackcraftmx/calcita/react-router):
//
//   withAccess(access, routes)   un grupo de rutas con la regla del menu.js de su módulo: quien no puede ve la página de
//                                «sin permiso» en lugar de la pantalla
//   useIsNavigating()            la pantalla siguiente se está descargando (rutas lazy): para la rayita de AppLayout
//
//   import {access} from '@/modules/users/menu.js';
//   import {routes} from '@/modules/users/routes.js';
//   children: [withAccess(access, routes)]
//
// OJO: useIsNavigating solo funciona con un router de datos (createBrowserRouter); con <BrowserRouter> no hay estado de
// navegación.
//
// Genéricos del paquete: function (regla de la casa).
import {Outlet, useNavigation, useOutletContext} from 'react-router';

import RequireAccess from '@/access/RequireAccess.jsx';

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
