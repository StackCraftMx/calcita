// El alto real de la barra superior, publicado como variable CSS para quien necesite dejarle lugar. Si la barra flota
// separada de la orilla de arriba (el marco con vidrio), cuenta también esa separación: es lo que tapa.
//
// La barra superior se queda fija arriba al deslizar (sticky) y puede llevar adentro un aviso (una franja «Carga en
// curso»): no siempre mide lo mismo. Quien manda la vista a una sección de su página (scroll-margin-top) necesita el
// alto que la barra tiene EN ESE MOMENTO; con un número fijo, la barra con el aviso tapaba el título de la sección.
// El layout de la aplicación mide su barra (useAppBarHeightPublisher) y las páginas solo usan SCROLL_MARGIN_BELOW_APP_BAR.
//
// NOTA sobre la CSP (sin 'unsafe-inline'): la variable se pone con style.setProperty, que es el objeto de estilos del
// elemento y la CSP no lo bloquea; lo que bloquea es un atributo style="" escrito en el HTML.
//
// Helpers genéricos del paquete: function (regla de la casa).
import {useEffect, useLayoutEffect, useRef} from 'react';

/** Nombre de la variable CSS con el alto de la barra superior, en px. */
export const APP_BAR_HEIGHT_CSS_VARIABLE = '--app-bar-height';

// lo que mide la barra sin aviso (el minHeight de su Toolbar): vale mientras nadie ha medido
const APP_BAR_HEIGHT_WITHOUT_RIBBON_PIXELS = 56;

// se mide ANTES del primer pintado: el menú lateral empieza debajo de la barra y, con el alto de respaldo, brincaba al
// medirse. En el servidor useLayoutEffect avisa en consola; ahí no hay nada que medir
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// aire entre la barra y el título de la sección a la que se llega
const BREATHING_ROOM_BELOW_APP_BAR_PIXELS = 16;

/** El alto real de la barra, como valor de CSS: para lo que se acomoda justo debajo de ella (el diálogo de contenido). */
export const APP_BAR_HEIGHT = `var(${APP_BAR_HEIGHT_CSS_VARIABLE}, ${APP_BAR_HEIGHT_WITHOUT_RIBBON_PIXELS}px)`;

/** Valor de scroll-margin-top para una sección a la que se llega con un ancla: el alto real de la barra más un respiro. */
export const SCROLL_MARGIN_BELOW_APP_BAR = `calc(${APP_BAR_HEIGHT} + ${BREATHING_ROOM_BELOW_APP_BAR_PIXELS}px)`;

/**
 * Mide la barra superior y publica su alto en la variable CSS cada vez que cambia (aparece o se cierra un aviso, se
 * gira el teléfono, cambia el ancho de la ventana).
 *
 * @returns {import('react').RefObject<HTMLElement>} la referencia que se le pone a la barra
 */
export function useAppBarHeightPublisher() {
    const appBarElement = useRef(null);

    useBrowserLayoutEffect(() => {
        const element = appBarElement.current;
        // guard clause: sin elemento o sin ResizeObserver (navegador muy viejo) se queda el alto de respaldo
        if (!element || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const rootStyle = document.documentElement.style;
        // el alto más lo que la barra flota separada de la orilla de arriba (con vidrio, 8 px; si no, 0): lo que tapa la barra
        // cuando se queda fija. Al cambiar eso también cambia su ancho (sus márgenes), y el ResizeObserver lo vuelve a medir
        // OJO: en el teléfono con vidrio la barra flota ABAJO (como la de Safari): arriba no tapa nada y se publica 0; si no,
        // lo que se pega arriba al deslizar dejaba un hueco del alto de una barra que ya no está ahí
        const publishHeight = () => {
            const box = element.getBoundingClientRect();
            const isAtBottom = box.top > window.innerHeight / 2;
            const stickyTopPixels = Number.parseFloat(window.getComputedStyle(element).top) || 0;
            const coveredPixels = isAtBottom ? 0 : Math.round(box.height + stickyTopPixels);
            rootStyle.setProperty(APP_BAR_HEIGHT_CSS_VARIABLE, `${coveredPixels}px`);
        };

        publishHeight();
        const resizeObserver = new ResizeObserver(publishHeight);
        resizeObserver.observe(element);
        // al cambiar de ancho la barra puede pasar de arriba a abajo sin cambiar de tamaño
        window.addEventListener('resize', publishHeight);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', publishHeight);
            rootStyle.removeProperty(APP_BAR_HEIGHT_CSS_VARIABLE);
        };
    }, []);

    return appBarElement;
}
