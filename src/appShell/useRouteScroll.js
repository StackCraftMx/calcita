// La página arriba al entrar a otra pantalla y donde iba al regresar, dentro del marco (AppLayout). La regla de qué toca en
// cada cambio está en routeScroll.js; aquí lo que hace el navegador.
//
// Sirve con cualquier navegación del paquete (react-router, Next o la del navegador): no usa el ScrollRestoration de
// react-router, que además solo funciona con createBrowserRouter y no con <BrowserRouter>.
//
// Cómo se sabe que la persona regresó: con «atrás» y «adelante» el navegador avisa «popstate». Hay dos casos, y los dos
// pasan (medido en Chrome con los ejemplos):
//   - el router pinta la pantalla de regreso DENTRO de ese aviso (react-router con createBrowserRouter, cuando la pantalla
//     ya estaba descargada): el aviso del marco todavía no corre, porque el del router se registró antes. Ahí se pregunta
//     al navegador qué aviso está atendiendo (window.event). OJO: escuchar en la fase de captura no lo adelanta;
//   - el router pinta después (una pantalla que se descarga, Next): para entonces el aviso del marco ya anotó a qué
//     dirección llevó, y cuenta solo si la pantalla que se pinta es esa.
//
// OJO, trampas:
//   - el navegador también regresa solo la página a donde iba, pero lo hace ANTES de que se pinte la pantalla de regreso:
//     con la de antes, más corta, quedaba a medias. Mientras el marco está montado se le apaga eso (scrollRestoration
//     manual) y al desmontarse se le regresa lo que tenía;
//   - una lista que se pide al servidor todavía no tiene su largo al regresar: se espera a que la página crezca, hasta
//     RESTORE_WAIT_MILLISECONDS, y se deja de esperar en cuanto la persona desliza, toca o teclea;
//   - lo que se desliza es la VENTANA: el marco no tiene un contenedor con su propio scroll. Si algún día lo tuviera, esto
//     tiene que deslizar ese contenedor, o deja de servir sin avisar;
//   - se desliza de golpe (behavior instant): con scroll-behavior smooth en el CSS del proyecto, la página se veía correr
//     desde la mitad de la lista hasta arriba.
//
// Hook genérico del paquete: function (regla de la casa).
import {useEffect, useLayoutEffect, useRef} from 'react';

import {ROUTE_SCROLL, rememberedPositionsOf, routeScrollOf, withRememberedPosition} from '@/appShell/routeScroll.js';

// dónde se guardan las posiciones en la sesión de la pestaña
const STORAGE_KEY = 'calcita:route-scroll';
// lo más que se espera a que crezca la pantalla de regreso (una lista que llega del servidor), en milisegundos
const RESTORE_WAIT_MILLISECONDS = 3000;
// lo que hace la persona para deslizar ella misma: ahí se deja de esperar y manda ella
const OWN_SCROLL_EVENTS = Object.freeze(['wheel', 'touchstart', 'keydown', 'mousedown']);
// la página se abrió recargando o con «atrás» desde otro sitio: la primera pantalla también regresa a donde iba
const RETURN_PAGE_LOADS = new Set(['reload', 'back_forward']);
// el navegador redondea lo deslizado a medio pixel
const SAME_PLACE_PIXELS = 1;

/** Lo guardado en la sesión; sin sessionStorage (bloqueado, modo privado viejo), nada. */
function readPositions() {
    try {
        return rememberedPositionsOf(window.sessionStorage.getItem(STORAGE_KEY));
    } catch {
        return {};
    }
}

/** Guarda en la sesión; si no se puede, se recuerda solo mientras la pestaña siga abierta. */
function writePositions(positions) {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch {
        // sin espacio o bloqueado: se queda en memoria
    }
}

function scrollInstantlyTo(top) {
    window.scrollTo({top, left: 0, behavior: 'instant'});
}

/** Arriba; o, si la dirección lleva #algo y eso existe en la pantalla, a ese lugar (como un enlace normal). */
function scrollToScreenStart() {
    const anchorId = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : '';
    const anchor = anchorId ? document.getElementById(anchorId) : null;
    if (anchor) {
        anchor.scrollIntoView({block: 'start', behavior: 'instant'});
        return;
    }
    scrollInstantlyTo(0);
}

/** La página se abrió recargando o con «atrás» (no con un enlace nuevo). */
function isReturnPageLoad() {
    const [pageLoad] = window.performance?.getEntriesByType?.('navigation') ?? [];
    return RETURN_PAGE_LOADS.has(pageLoad?.type);
}

/**
 * Lleva la página a `top` y, si la pantalla todavía no es tan larga, lo vuelve a intentar cada vez que crece.
 *
 * @param {number} top
 * @returns {() => void} para dejar de esperar
 */
function restoreTo(top) {
    scrollInstantlyTo(top);
    const isThere = () => Math.abs(window.scrollY - top) <= SAME_PLACE_PIXELS;
    if (isThere() || typeof ResizeObserver === 'undefined') {
        return () => {};
    }
    const observer = new ResizeObserver(() => {
        scrollInstantlyTo(top);
        if (isThere()) {
            stop();
        }
    });
    const timer = window.setTimeout(stop, RESTORE_WAIT_MILLISECONDS);
    function stop() {
        observer.disconnect();
        window.clearTimeout(timer);
        OWN_SCROLL_EVENTS.forEach((eventName) => window.removeEventListener(eventName, stop));
    }
    OWN_SCROLL_EVENTS.forEach((eventName) => window.addEventListener(eventName, stop, {passive: true}));
    observer.observe(document.body);
    return stop;
}

/**
 * @param {boolean} isEnabled false: la página no se toca (lo de antes; el navegador hace lo suyo)
 * @param {string} pathname la dirección de la pantalla, sin la consulta (useLocation de la navegación del proyecto)
 */
export function useRouteScroll(isEnabled, pathname) {
    // {dirección de la pantalla: px}: se lee de la sesión la primera vez que se necesita. La pantalla se reconoce por su
    // dirección sin la consulta (routeScroll.js dice por qué)
    const positions = useRef(null);
    // la dirección de la pantalla que se ve; null antes de la primera
    const shownPathname = useRef(null);
    // lo último deslizado en la pantalla que se ve. Se toma de los avisos de deslizar y no de window.scrollY al cambiar:
    // en ese momento la pantalla nueva ya está puesta y, si es más corta, el navegador ya recortó lo deslizado
    const latestTop = useRef(0);
    // la dirección a la que llevó «atrás» o «adelante», hasta que se pinte esa pantalla
    const historyMoveHref = useRef(null);
    // la dirección completa de la pantalla que ya se acomodó: un aviso que llega después de pintarla no se anota
    const settledHref = useRef(null);
    const stopRestoring = useRef(() => {});

    // mientras el marco esté montado: el navegador ya no regresa la página solo y se escucha lo que hace la persona
    useEffect(() => {
        if (!isEnabled) {
            return undefined;
        }
        const previousMode = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
        const onHistoryMove = () => {
            // el router ya la pintó dentro de este mismo aviso (y ya se acomodó): no queda nada pendiente
            if (settledHref.current !== window.location.href) {
                historyMoveHref.current = window.location.href;
            }
        };
        const onScroll = () => {
            latestTop.current = window.scrollY;
        };
        // al cerrar o recargar la pestaña se guarda dónde iba la pantalla que se ve
        const onPageHide = () => {
            if (shownPathname.current) {
                positions.current = withRememberedPosition(positions.current ?? {}, shownPathname.current, latestTop.current);
                writePositions(positions.current);
            }
        };
        window.addEventListener('popstate', onHistoryMove);
        window.addEventListener('scroll', onScroll, {passive: true});
        window.addEventListener('pagehide', onPageHide);
        return () => {
            window.removeEventListener('popstate', onHistoryMove);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('pagehide', onPageHide);
            stopRestoring.current();
            window.history.scrollRestoration = previousMode;
        };
    }, [isEnabled]);

    // cada pantalla nueva, antes de que se vea: se guarda dónde iba la anterior y se acomoda la nueva
    useLayoutEffect(() => {
        if (!isEnabled) {
            shownPathname.current = null;
            return;
        }
        const previousPathname = shownPathname.current;
        // la misma pantalla otra vez (React en modo estricto corre esto dos veces): nada cambió
        if (previousPathname === pathname) {
            return;
        }
        positions.current ??= readPositions();
        if (previousPathname) {
            positions.current = withRememberedPosition(positions.current, previousPathname, latestTop.current);
        }
        // «atrás» o «adelante»: lo anotó el aviso del marco, o el router está pintando dentro del aviso del navegador
        const isHistoryMove = historyMoveHref.current === window.location.href || window.event?.type === 'popstate';
        historyMoveHref.current = null;
        settledHref.current = window.location.href;
        shownPathname.current = pathname;
        stopRestoring.current();
        stopRestoring.current = () => {};

        const decision = previousPathname
            ? routeScrollOf({previousPathname, pathname, isHistoryMove})
            : (isReturnPageLoad() ? ROUTE_SCROLL.restore : ROUTE_SCROLL.stay);
        if (decision === ROUTE_SCROLL.top) {
            scrollToScreenStart();
        } else if (decision === ROUTE_SCROLL.restore) {
            stopRestoring.current = restoreTo(positions.current[pathname] ?? 0);
        }
        latestTop.current = window.scrollY;
        writePositions(positions.current);
    }, [isEnabled, pathname]);
}
