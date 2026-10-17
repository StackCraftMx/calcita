// Una pantalla (o un grupo de pantallas) que solo se ve con permiso, con la misma regla de su menu.js: quien no puede ve
// la página de «sin permiso» (403) en lugar de una pantalla vacía que truena al pedir sus datos.
//
//   <RequireAccess access={{ability: 'users.admin'}}><UsersPage /></RequireAccess>
//
// Con react-router, withAccess (@stackcraftmx/calcita/react-router) envuelve un grupo de rutas con esto.
//
// Genérico del paquete: function (regla de la casa).
import {useCan} from '@/access/useCan.js';
import ErrorPage, {ERROR_PAGE_KIND} from '@/ui/layout/ErrorPage.jsx';

/**
 * @param {object} props
 * @param {object} [props.access] la regla (accessRules.js); sin ella se ve
 * @param {import('react').ReactNode} props.children
 * @param {import('react').ReactNode} [props.fallback] lo que se ve sin permiso; por omisión la página de 403
 */
export default function RequireAccess({access, children, fallback}) {
    if (useCan(access)) {
        return children;
    }
    return fallback ?? <ErrorPage kind={ERROR_PAGE_KIND.forbidden} />;
}
