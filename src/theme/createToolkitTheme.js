// El tema del framework: el estilo de Stackcraft (del tema de walk-ot) con claro y oscuro. Es opcional: ToolkitProvider
// funciona con cualquier tema de MUI.
//
//   const theme = createToolkitTheme();                                  // los colores de Stackcraft
//   const theme = createToolkitTheme({glass: true});                     // con vidrio líquido en lo que flota
//   const theme = createToolkitTheme({glass: {opacity: 0.7}});           // con vidrio más transparente (por omisión 0.8)
//   const theme = createToolkitTheme({glass: {surfaces: true}});         // también las tarjetas del contenido (con advertencia)
//   const theme = createToolkitTheme({colorSchemes: {light: {palette: {primary: {main: '#0B5FFF'}}}, dark: {...}}});
//
// Lo que trae, con su porqué:
//   - variables CSS y los dos modos: ColorSchemeToggle cambia de modo sin volver a pintar, y las gráficas leen sus colores
//     de las variables (var(--mui-palette-text-primary)); sin ellas su texto se quedaba negro en oscuro.
//   - colorSchemeSelector 'class': el modo lo elige la persona con el botón (con 'media' solo mandaría el sistema
//     operativo y el botón no haría nada). Con Next.js va con <InitColorSchemeScript attribute="class" />.
//   - letra base de 16 px: con menos, el iPhone hace zoom al entrar a un campo. body1 16 px y body2 15 px en el teléfono;
//     responsiveFontSizes los ajusta por ancho de pantalla.
//   - transiciones de 220 ms, iguales al abrir y al cerrar: más ágiles que las de Material (300 ms) y sin el desfase de
//     30 ms entre lo que solo conoce una transición (la barra) y lo que conoce dos (el menú lateral).
//   - esquinas de 8 px y los ajustes de componentes de toolkitComponents().
//   - glass: el vidrio líquido en lo que flota y en los controles (glassSurface.js explica dónde y por qué). Queda anotado
//     en theme.toolkit.glass para que los componentes del framework que flotan (el marco, los avisos) lo sepan sin otra prop.
//   - components: los ajustes propios del proyecto se SUMAN a los del framework (mergeComponents), no los borran.
//
// Funciones puras, sin React: function (regla de la casa).
import {createTheme, responsiveFontSizes} from '@mui/material/styles';

import {glassComponents} from '@/theme/components/glassComponents.js';
import {GLASS_OPACITY} from '@/theme/glassSurface.js';
import {mergeComponents} from '@/theme/mergeComponents.js';
import {stackcraftDarkPalette, stackcraftLightPalette} from '@/theme/stackcraftPalette.js';
import {trackingOf} from '@/theme/appleTracking.js';
import {toolkitComponents} from '@/theme/toolkitComponents.js';
import {MINIMAL_BACKGROUND, minimalComponents} from '@/theme/components/minimalComponents.js';
import {createLogger} from '@/observability/logger.js';

const log = createLogger('theme');
// el aviso de las tarjetas de vidrio sale una vez por pestaña: el tema se vuelve a armar cada vez que cambia algo (un
// configurador de tema lo arma en cada clic) y la consola se llenaba del mismo aviso
let hasWarnedAboutGlassSurfaces = false;

const SYSTEM_FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const CORNER_RADIUS_PIXELS = 8;
// cuántos niveles de sombra trae el tema de MUI (del 0 al 24)
const SHADOW_LEVELS = 25;

/** El estilo del tema: el de Stackcraft (con vidrio o sin él) o el minimalista, plano y tonal. */
export const THEME_LOOK = Object.freeze({standard: 'standard', minimal: 'minimal'});

/**
 * Lo que pidió el proyecto del vidrio, ya revisado: false (sin vidrio) o {opacity, surfaces}.
 *
 * @param {boolean|{opacity?: number, surfaces?: boolean}} glass
 * @returns {false|{opacity: number, surfaces: boolean}}
 */
function glassSettingsOf(glass) {
    if (!glass) {
        return false;
    }
    const requested = glass === true ? {} : glass;
    const opacity = requested.opacity ?? GLASS_OPACITY;
    // un 80 en lugar de 0.8 daría un color inválido y la barra saldría sin fondo, sin ningún aviso
    if (typeof opacity !== 'number' || opacity < 0 || opacity > 1) {
        throw new RangeError(`createToolkitTheme: glass.opacity va de 0 a 1 (llegó ${opacity}).`);
    }
    const surfaces = Boolean(requested.surfaces);
    // se permite, pero con advertencia: la guía de Apple pide el contenido sin vidrio y cada tarjeta desenfoca lo de atrás
    if (surfaces && !hasWarnedAboutGlassSurfaces) {
        hasWarnedAboutGlassSurfaces = true;
        log.warn('glass.surfaces pone vidrio también en el contenido (tarjetas, avisos, tabla): pesa más en equipos modestos '
            + 'y la guía de Apple no lo recomienda («no use Liquid Glass en la capa del contenido»). Úselo en una portada o una '
            + 'demostración, no en pantallas de trabajo.');
    }
    return {opacity, surfaces};
}

/**
 * @param {object} [options]
 * @param {{light?: object|boolean, dark?: object|boolean}} [options.colorSchemes] los colores de cada modo; por omisión los de
 *     Stackcraft; true: los de MUI tal cual
 * @param {'class'|'data'|'media'|string} [options.colorSchemeSelector] cómo se elige el modo; por omisión 'class'
 * @param {string} [options.fontFamily] por omisión la letra del sistema
 * @param {boolean|{opacity?: number, surfaces?: boolean}} [options.glass] vidrio líquido en lo que flota y en los
 *     controles; por omisión no. Con {opacity} se elige qué tan opaco (0 a 1; por omisión GLASS_OPACITY, 0.6) y con
 *     {surfaces: true} también las tarjetas del contenido (por omisión sólidas, como pide la guía; avisa en consola)
 * @param {'standard'|'minimal'} [options.look] el estilo (THEME_LOOK): el de Stackcraft (por omisión) o el minimalista,
 *     plano y tonal (sin bordes ni sombras: las superficies se separan por su tono; sin vidrio aunque se pida)
 * @param {object} [options.components] ajustes propios de componentes (se suman; en el mismo estilo ganan los del proyecto)
 * @param {object} [options.overrides] cualquier otra cosa de createTheme (breakpoints, spacing…)
 * @returns {object} el tema de MUI
 */
export function createToolkitTheme({
    colorSchemes = {light: {palette: stackcraftLightPalette}, dark: {palette: stackcraftDarkPalette}},
    colorSchemeSelector = 'class',
    fontFamily = SYSTEM_FONT_FAMILY,
    glass = false,
    look = THEME_LOOK.standard,
    components = {},
    overrides = {},
} = {}) {
    const isMinimal = look === THEME_LOOK.minimal;
    // el minimalista es sólido: sin vidrio aunque se pida
    const glassSettings = isMinimal ? null : glassSettingsOf(glass);
    const frameworkComponents = isMinimal
        ? mergeComponents(toolkitComponents(), minimalComponents())
        : (glassSettings ? mergeComponents(toolkitComponents(), glassComponents({surfaces: glassSettings.surfaces})) : toolkitComponents());
    // el minimalista separa las superficies por su tono: el fondo gris agrupado y la tarjeta un escalón arriba
    const schemes = isMinimal
        ? Object.fromEntries(Object.entries(colorSchemes).map(([mode, scheme]) => [mode, {
            ...scheme, palette: {...scheme.palette, background: MINIMAL_BACKGROUND[mode] ?? scheme.palette?.background},
        }]))
        : colorSchemes;
    const baseTheme = createTheme({
        cssVariables: {colorSchemeSelector},
        colorSchemes: schemes,
        // el espaciado entre letras (tracking) de la tabla de SF Pro de Apple para cada tamaño (appleTracking.js). MUI
        // trae uno POSITIVO pensado para Roboto (+0.15 px en el texto, +0.4 px en botones y textos chicos) y con la letra del
        // sistema se veía la letra separada (lo reportaron: «kerning»); Apple, de 13 a 22 pt, lo cierra
        typography: {
            fontFamily,
            h1: {letterSpacing: trackingOf(96)},
            h2: {letterSpacing: trackingOf(60)},
            h3: {letterSpacing: trackingOf(48)},
            h4: {letterSpacing: trackingOf(34)},
            h5: {fontWeight: 600, letterSpacing: trackingOf(24)},
            h6: {fontWeight: 600, letterSpacing: trackingOf(20)},
            subtitle1: {letterSpacing: trackingOf(16)},
            subtitle2: {letterSpacing: trackingOf(14)},
            body1: {fontSize: '1rem', letterSpacing: trackingOf(16)},
            body2: {fontSize: '0.9375rem', letterSpacing: trackingOf(15)},
            button: {fontSize: '0.9375rem', textTransform: 'none', fontWeight: 500, letterSpacing: trackingOf(15)},
            caption: {letterSpacing: trackingOf(12)},
        },
        transitions: {
            duration: {
                shortest: 150,
                shorter: 180,
                short: 200,
                standard: 220,
                complex: 280,
                enteringScreen: 220,
                leavingScreen: 220,
            },
        },
        shape: {borderRadius: CORNER_RADIUS_PIXELS},
        components: mergeComponents(frameworkComponents, components),
        // sin sombras en el minimalista: lo plano es la idea
        ...(isMinimal && {shadows: Array(SHADOW_LEVELS).fill('none')}),
        toolkit: {glass: glassSettings, look},
        ...overrides,
    });
    return responsiveFontSizes(baseTheme);
}
