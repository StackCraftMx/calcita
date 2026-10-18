// Si el teléfono lleva la barra de pestañas de abajo (MobileTabBar, como iOS 26) en lugar de la barra de arriba con la ☰
// y el cajón: con vidrio siempre, y con el minimalista cuando la barra va en cápsulas (lo pidió el autor: «el mínimo con
// cápsulas también, con el comportamiento de vidrio en el menú»). Con el minimalista y la franja, la barra de arriba de
// siempre (estilo Material).
//
// Un solo lugar para la regla: la usan el marco (AppLayout) y lo que flota encima de esa barra (la invitación a instalar,
// el aviso de versión nueva), que tienen que saber si hay barra abajo para no taparla.
//
// Funciones puras, no renderizan: function (regla de la casa).
import {THEME_LOOK, TOP_BAR} from '@/theme/createToolkitTheme.js';
import {isGlassTheme} from '@/theme/glassSurface.js';

/**
 * @param {object} theme el tema de MUI
 * @returns {boolean}
 */
export function usesMobileTabBar(theme) {
    if (isGlassTheme(theme)) {
        return true;
    }
    return theme.toolkit?.look === THEME_LOOK.minimal && theme.toolkit?.bar === TOP_BAR.capsules;
}
