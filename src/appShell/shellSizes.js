// Las medidas y tiempos del marco de la app (AppLayout, del marco de walk-ot), en un solo lugar para que el menú, la barra y
// el botón flotante se muevan juntos.
//
// Funciones puras, sin React: function (regla de la casa).
import {GLASS_INSET_PIXELS} from '@/theme/glassSurface.js';

/** El id del contenido: a donde lleva «Saltar al contenido». */
export const MAIN_CONTENT_ID = 'main-content';

/** El menú lateral abierto (ícono y nombre; 240 como las plantillas de MUI) y encogido (solo íconos, el rail). */
export const DRAWER_WIDTH_EXPANDED = 240;
export const DRAWER_WIDTH_COLLAPSED = 64;

/** El alto de la barra de arriba (sin avisos). */
export const APP_BAR_HEIGHT_PIXELS = 56;

/**
 * Con vidrio (createToolkitTheme({glass: true})), el menú lateral y la barra flotan separados de la orilla de la ventana
 * y entre ellos, como los paneles de macOS 26: así el contenido pasa por detrás y el vidrio tiene qué desenfocar. Es la
 * misma separación que el tema les da a los cajones y a la hoja de abajo (GLASS_INSET_PIXELS), para que todo flote igual.
 */
export const GLASS_PANEL_GAP_PIXELS = GLASS_INSET_PIXELS;

/**
 * Teléfono o escritorio. Teléfono: angosto (menos de 900 px, el «md» de MUI) O bajito (menos de 500 px de alto: un teléfono
 * acostado). Solo con el ancho, un iPhone Pro Max acostado (932 × 430) salía con el marco de escritorio y su menú lateral
 * no cabía (lo reportaron). Van como media queries para usarse en sx: [PHONE_MEDIA_QUERY]: {...}. Se exportan: un proyecto que
 * ajusta una pieza del marco desde su tema (solo en escritorio o solo en el teléfono) usa la misma regla que el marco y no
 * una copia que se le pueda desfasar.
 */
export const PHONE_MEDIA_QUERY = '@media (max-width: 899.95px), (max-height: 499.95px)';
export const DESKTOP_MEDIA_QUERY = '@media (min-width: 900px) and (min-height: 500px)';
/** El teléfono acostado: la barra de pestañas va compacta (ícono y nombre lado a lado) para dejarle el alto al contenido. */
export const PHONE_LANDSCAPE_MEDIA_QUERY = '@media (max-height: 499.95px)';

/** La barra de pestañas del teléfono con vidrio (MobileTabBar): su alto parado y acostado. */
export const MOBILE_TAB_BAR_HEIGHT_PIXELS = Object.freeze({portrait: 60, landscape: 46});

// Lo que flota abajo encima de la barra de pestañas y dura un rato (las acciones de los elegidos de una tabla) pide su alto
// aquí mientras se ve: el marco lo suma al espacio de abajo del contenido y el final de la página (el paginador) no queda
// tapado. Lo pone quien flota con GlobalStyles; sin nada, vale 0.
export const FLOATING_BOTTOM_SPACE_CSS_VARIABLE = '--calcita-floating-bottom-space';

/**
 * Lo que flota abajo al centro en el teléfono con vidrio (el aviso de versión nueva, la invitación a instalar): encima de
 * la barra de pestañas, con la separación de la barra a la orilla, su alto, la separación pedida y la zona del gesto de
 * inicio del iPhone. Para el sx: ...aboveMobileTabBarOf(8).
 *
 * @param {number} gapPixels lo que se separa de la barra de pestañas (px)
 * @returns {object}
 */
export function aboveMobileTabBarOf(gapPixels) {
    return {
        [PHONE_MEDIA_QUERY]: {
            top: 'auto',
            bottom: `calc(${GLASS_PANEL_GAP_PIXELS + MOBILE_TAB_BAR_HEIGHT_PIXELS.portrait + gapPixels}px + env(safe-area-inset-bottom))`,
        },
        [PHONE_LANDSCAPE_MEDIA_QUERY]: {
            bottom: `calc(${GLASS_PANEL_GAP_PIXELS + MOBILE_TAB_BAR_HEIGHT_PIXELS.landscape + gapPixels}px + env(safe-area-inset-bottom))`,
        },
    };
}

/**
 * La transición que comparten el menú, la barra y el botón flotante: si cada uno usara la suya, terminarían en frames
 * distintos y el ojo lo lee como un salto.
 *
 * @param {object} theme el tema de MUI
 * @param {string[]} [properties] lo que se anima
 * @returns {string}
 */
export function drawerTransitionOf(theme, properties = ['width']) {
    return theme.transitions.create(properties, {easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen});
}
