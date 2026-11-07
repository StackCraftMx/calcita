// El menú de la app al alcance de las páginas: AppLayout lo pone y PageHeading lo lee para armar sus migas solas (Inicio ›
// Sección › Pantalla) sin que cada página las escriba. Fuera de AppLayout el menú está vacío y no hay migas automáticas.
//
// También es por donde una pantalla le dice al marco a qué entrada del menú pertenece (useActiveMenuPath), cuando su
// dirección no lo dice: un detalle que vive en otra raíz que su lista.
//
// Hook genérico del paquete: function (regla de la casa).
import {createContext, useContext, useLayoutEffect} from 'react';

export const AppMenuContext = createContext({menuItems: [], declaredPath: null, declarePath: () => {}});

/**
 * @returns {{menuItems: object[], declaredPath: string|null}} lo que AppLayout recibió de composeMenu y la dirección que
 *     declaró la pantalla abierta (useActiveMenuPath), si declaró una
 */
export function useAppMenu() {
    return useContext(AppMenuContext);
}

/**
 * La pantalla dice a qué entrada del menú pertenece: el menú, la barra del teléfono y las migas marcan esa entrada aunque
 * la dirección sea otra. Para el detalle que vive en otra raíz que su lista (/users/detail/4/15 es de «Compradores», cuya
 * lista es /users/buyers), o que solo se distingue por un número del negocio:
 *
 *   const BUYERS_LIST_PATH = '/users/buyers';
 *   const UserDetailPage = () => {
 *       const {groupId} = useParams();
 *       useActiveMenuPath(LIST_PATH_BY_GROUP[groupId]);   // la pantalla sabe de qué lista viene
 *       …
 *   };
 *
 * Al salir de la pantalla el menú vuelve a marcarse por la dirección. Sin dirección (undefined o '') no declara nada.
 * Fuera de AppLayout no hace nada.
 *
 * OJO: va con useLayoutEffect y no con useEffect para que la entrada salga marcada desde el primer cuadro; con useEffect el
 * menú parpadeaba sin marca al entrar al detalle.
 *
 * @param {string|null|undefined} path la dirección de la entrada del menú (su `to`, o una que empiece con su matchPrefix)
 */
export function useActiveMenuPath(path) {
    const {declarePath} = useContext(AppMenuContext);
    useLayoutEffect(() => {
        if (!path) {
            return undefined;
        }
        declarePath(path);
        // al irse la pantalla se borra lo que ella declaró; si otra ya declaró la suya, se queda la de la otra
        return () => declarePath((current) => (current === path ? null : current));
    }, [path, declarePath]);
}
