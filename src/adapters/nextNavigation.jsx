// La navegación de Next.js (App Router) para ToolkitProvider (@stackcraftmx/calcita/next): las tres piezas que piden los
// componentes del framework, sacadas de next/navigation y next/link.
//
//   <ToolkitProvider navigation={nextNavigation}>   (dentro de un componente de cliente: el de los proveedores)
//
// Decisiones, con su porqué:
//   - search se lee del navegador al pintar y NO con useSearchParams: useSearchParams obliga a envolver la página en
//     <Suspense> (si no, `next build` truena con «Missing Suspense boundary»). En el servidor no hay búsqueda: ''.
//   - useNavigate(-1) regresa (router.back): BackButton lo usa cuando hay historial.
//   - Link recibe `to` (como los componentes del framework, y como MUI con component={Link}) y se lo da a next/link como
//     href.
// OJO: el «Regresar» que dice a dónde regresa (navigationTrail) lee el índice del historial que pone react-router; con
// Next no existe, así que BackButton regresa a la última lista anotada o a fallbackTo.
//
// Genéricos del paquete: function (regla de la casa).
import {useCallback} from 'react';
import NextLink from 'next/link';
import {usePathname, useRouter} from 'next/navigation';

/**
 * navigate(to) del framework con el router de Next.
 *
 * @returns {(to: string|number, options?: {replace?: boolean}) => void}
 */
function useNextNavigate() {
    const router = useRouter();
    return useCallback((to, options) => {
        if (typeof to === 'number') {
            if (to < 0) {
                router.back();
            } else {
                router.forward();
            }
            return;
        }
        if (options?.replace) {
            router.replace(to);
        } else {
            router.push(to);
        }
    }, [router]);
}

/**
 * {pathname, search, key} de la página abierta.
 *
 * @returns {{pathname: string, search: string, key: string}}
 */
function useNextLocation() {
    const pathname = usePathname();
    const search = typeof window === 'undefined' ? '' : window.location.search;
    return {pathname, search, key: `${pathname}${search}`};
}

/**
 * next/link con la prop `to` del framework.
 *
 * @param {{to?: string, href?: string}} props
 */
function NextToLink({to, href, ...linkProps}) {
    return <NextLink href={to ?? href} {...linkProps} />;
}

export const nextNavigation = Object.freeze({useNavigate: useNextNavigate, useLocation: useNextLocation, Link: NextToLink});
