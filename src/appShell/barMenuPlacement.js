// Hacia dónde abre un menú de la barra (la cuenta, los ajustes): hacia abajo si el botón está arriba de la pantalla, hacia
// ARRIBA si está abajo, y hacia la DERECHA si está en la orilla izquierda (el menú lateral encogido hace de barra). En el
// teléfono con vidrio la barra flota abajo, como la de Safari en el iPhone; un menú que abría hacia abajo no cabía y MUI lo
// subía encima del botón, tapándolo.
//
// Se decide al abrir (con la posición real del botón), no con el ancho de la pantalla: así sirve igual si la barra está
// arriba o abajo, y no depende de nada que el servidor no pueda saber.
//
// Funciones puras, sin React: function (regla de la casa).

// lo que se separa el menú de su botón (px)
const MENU_GAP_PIXELS = 8;
// abriendo de lado desde el menú encogido: lo que hay del botón a la orilla del panel (10 px), para que salga afuera
const SIDE_GAP_EXTRA_PIXELS = 10;

/**
 * @param {Element|null} anchorElement el botón que abre el menú
 * @returns {{anchorOrigin: object, transformOrigin: object, gapSx: object}} para el <Menu> de MUI (gapSx va en el sx del papel)
 */
export function barMenuPlacementOf(anchorElement) {
    const box = anchorElement && typeof window !== 'undefined' ? anchorElement.getBoundingClientRect() : null;
    const isInLowerHalf = Boolean(box) && box.top > window.innerHeight / 2;
    // en la orilla izquierda (el menú lateral encogido, que hace también de barra): abre HACIA LA DERECHA, o se saldría de
    // la pantalla. Arriba o abajo según dónde esté el botón
    const isOnLeftEdge = Boolean(box) && box.right < window.innerWidth / 4;
    if (isOnLeftEdge) {
        const vertical = isInLowerHalf ? 'bottom' : 'top';
        return {
            anchorOrigin: {vertical, horizontal: 'right'},
            transformOrigin: {vertical, horizontal: 'left'},
            gapSx: {ml: `${MENU_GAP_PIXELS + SIDE_GAP_EXTRA_PIXELS}px`},
        };
    }
    if (isInLowerHalf) {
        // la separación se cuenta desde la orilla de la BARRA, no del botón (que va adentro): si no, el menú tocaba la barra
        // la barra de arriba (header) o la de pestañas del teléfono (nav)
        const bar = anchorElement.closest('header, nav') ?? anchorElement;
        const insideBarPixels = Math.max(0, box.top - bar.getBoundingClientRect().top);
        return {
            anchorOrigin: {vertical: 'top', horizontal: 'right'},
            transformOrigin: {vertical: 'bottom', horizontal: 'right'},
            gapSx: {mt: `-${Math.round(insideBarPixels) + MENU_GAP_PIXELS}px`},
        };
    }
    return {
        anchorOrigin: {vertical: 'bottom', horizontal: 'right'},
        transformOrigin: {vertical: 'top', horizontal: 'right'},
        gapSx: {mt: `${MENU_GAP_PIXELS}px`},
    };
}
