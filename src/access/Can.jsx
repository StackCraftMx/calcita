// Pinta lo de adentro solo si la sesión puede (la misma regla del menú y las rutas):
//
//   <Can access={{ability: 'orders.cancel'}}><Button>Cancelar pedido</Button></Can>
//
// Lo que no se puede, no se ve (fallback, si se quiere enseñar otra cosa). El backend vuelve a revisar cada petición.
//
// Genérico del paquete: function (regla de la casa).
import {useCan} from '@/access/useCan.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {object} props
 * @param {object} props.access la regla (accessRules.js)
 * @param {import('react').ReactNode} props.children
 * @param {import('react').ReactNode} [props.fallback] lo que se pinta si no puede; por omisión nada
 */
export default function Can({access, children, fallback = null, ...unknownProps}) {
    warnUnknownProps('Can', unknownProps);
    return useCan(access) ? children : fallback;
}
