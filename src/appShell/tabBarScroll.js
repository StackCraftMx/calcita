// Cuándo se encoge la barra de pestañas del teléfono (MobileTabBar), como la de iOS 26: al leer hacia abajo se vuelve una
// cápsula chica con la pestaña donde está la persona, y en cuanto sube un poco regresa completa.
//
//   - No cuenta cada evento de deslizar sino lo recorrido en la misma dirección: el navegador avisa de a 1 a 3 px y, si
//     se comparara evento contra evento, nunca pasaría del umbral.
//   - Cerca de arriba siempre va completa: ahí todavía no hay nada que leer debajo.
//
// Funciones puras, no renderizan: function (regla de la casa). Pruebas en tabBarScroll.test.js; el hook que las usa es
// useTabBarMinimized.js.

// lo que hay que bajar seguido para encogerla y subir para que regrese (px); subir regresa más rápido, como en iOS
export const MINIMIZE_AFTER_PIXELS = 24;
export const EXPAND_AFTER_PIXELS = 12;
// arriba de esto siempre va completa (px): lo alto de la barra
export const ALWAYS_EXPANDED_UNTIL_PIXELS = 60;

/** Al abrir la pantalla: completa, arriba y sin recorrido. */
export const TAB_BAR_SCROLL_START = Object.freeze({isMinimized: false, lastY: 0, travel: 0});

/**
 * El estado de la barra después de que la página se deslizó a scrollY.
 *
 * @param {{isMinimized: boolean, lastY: number, travel: number}} state travel: lo recorrido en la dirección de ahorita
 *     (positivo hacia abajo)
 * @param {number} scrollY cuánto está deslizada la página (window.scrollY)
 * @returns {{isMinimized: boolean, lastY: number, travel: number}}
 */
export function tabBarStateAfterScroll(state, scrollY) {
    const delta = scrollY - state.lastY;
    // si cambió de dirección, lo recorrido empieza de nuevo
    const travel = Math.sign(delta) === Math.sign(state.travel) ? state.travel + delta : delta;

    let isMinimized = state.isMinimized;
    if (scrollY <= ALWAYS_EXPANDED_UNTIL_PIXELS) {
        isMinimized = false;
    } else if (travel >= MINIMIZE_AFTER_PIXELS) {
        isMinimized = true;
    } else if (travel <= -EXPAND_AFTER_PIXELS) {
        isMinimized = false;
    }
    return {isMinimized, lastY: scrollY, travel};
}
