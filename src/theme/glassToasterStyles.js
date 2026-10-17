// Los avisos (el <Toaster/> de sonner) de vidrio, cuando el tema lo trae (createToolkitTheme({glass: true})). Los avisos
// flotan sobre todo: es justo donde la guía del vidrio lo pide.
//
// Cómo: sonner pinta sus colores con variables CSS (--normal-bg, --success-bg, --success-text…). Aquí se cambian por los
// colores del tema de MUI mezclados con transparencia, y a cada aviso se le pone el desenfoque y el brillo del borde. Los
// colores del tema van como variables de MUI: cambian solos con claro y oscuro.
//
// OJO, trampas de sonner:
//   - sus variables viven en [data-sonner-toaster][data-sonner-theme=light|dark]; sin el `html` de adelante, ganaba la de
//     sonner o la nuestra según qué hoja se cargara al final.
//   - su texto de error, aviso… es su propio color; aquí sale del tema: en claro el tono oscuro (`dark`) del color y en
//     oscuro el claro (`light`), para que se lea sobre el fondo teñido.
//   - el contorno del foco del teclado estaba en box-shadow, que aquí se reemplaza: se vuelve a poner.
//
// Funciones puras, sin React: function (regla de la casa).
import {paletteOf} from '@/theme/components/paletteOf.js';
import {GLASS_MENU_RADIUS_PIXELS, solidFallbackOf} from '@/theme/glassSurface.js';

// el texto de un aviso es chico: un poco más opaco que el resto del vidrio
const TOAST_OPACITY_PERCENT = 88;
// cuánto del color del aviso (éxito, error…) tiñe su fondo
const STATUS_TINT_PERCENT = 14;
const TOAST_STATUSES = Object.freeze(['success', 'info', 'warning', 'error']);
const GLASS_BLUR = 'blur(20px) saturate(180%)';

const TOASTER_LIGHT_SELECTOR = "html [data-sonner-toaster][data-sonner-theme='light']";
const TOASTER_DARK_SELECTOR = "html [data-sonner-toaster][data-sonner-theme='dark']";
const TOAST_SELECTOR = "html [data-sonner-toaster] [data-sonner-toast][data-styled='true']";

/**
 * Las variables de color de sonner con los colores del tema.
 *
 * @param {object} palette la paleta (con variables CSS si las hay)
 * @param {'light'|'dark'} textShade el tono del texto de cada color: en claro el oscuro, en oscuro el claro
 * @param {(color: string) => string} surfaceOf con o sin transparencia
 * @returns {object}
 */
function toasterVariablesOf(palette, textShade, surfaceOf) {
    const variables = {
        '--border-radius': `${GLASS_MENU_RADIUS_PIXELS}px`,
        '--normal-bg': surfaceOf(palette.background.paper),
        '--normal-border': palette.divider,
        '--normal-text': palette.text.primary,
    };
    TOAST_STATUSES.forEach((status) => {
        const statusColor = palette[status];
        variables[`--${status}-bg`] = surfaceOf(`color-mix(in srgb, ${statusColor.main} ${STATUS_TINT_PERCENT}%, ${palette.background.paper})`);
        variables[`--${status}-border`] = `color-mix(in srgb, ${statusColor.main} 35%, transparent)`;
        variables[`--${status}-text`] = statusColor[textShade];
    });
    return variables;
}

/**
 * Los estilos globales de los avisos de vidrio (para <GlobalStyles styles={…} />).
 *
 * @param {object} theme el tema de MUI
 * @returns {object}
 */
export function glassToasterStylesOf(theme) {
    const palette = paletteOf(theme);
    const glassOf = (color) => `color-mix(in srgb, ${color} ${TOAST_OPACITY_PERCENT}%, transparent)`;
    const solidOf = (color) => color;
    const toastShadow = 'inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 8px 24px rgba(0, 0, 0, 0.12)';
    return {
        [TOASTER_LIGHT_SELECTOR]: toasterVariablesOf(palette, 'dark', glassOf),
        [TOASTER_DARK_SELECTOR]: toasterVariablesOf(palette, 'light', glassOf),
        [TOAST_SELECTOR]: {
            backdropFilter: GLASS_BLUR,
            WebkitBackdropFilter: GLASS_BLUR,
            boxShadow: toastShadow,
            '&:focus-visible': {boxShadow: `${toastShadow}, 0 0 0 2px ${palette.primary.main}`},
        },
        // menos transparencia, más contraste o un navegador que no desenfoca: los mismos colores, sólidos
        ...solidFallbackOf({
            [TOASTER_LIGHT_SELECTOR]: toasterVariablesOf(palette, 'dark', solidOf),
            [TOASTER_DARK_SELECTOR]: toasterVariablesOf(palette, 'light', solidOf),
            [TOAST_SELECTOR]: {backdropFilter: 'none', WebkitBackdropFilter: 'none'},
        }),
    };
}
