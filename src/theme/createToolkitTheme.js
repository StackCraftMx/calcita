// El tema del framework: el estilo de Stackcraft (del tema de walk-ot) con claro y oscuro. Es opcional: ToolkitProvider
// funciona con cualquier tema de MUI.
//
//   const theme = createToolkitTheme();                                  // los colores de Stackcraft
//   const theme = createToolkitTheme({glass: true});                     // con vidrio líquido en lo que flota
//   const theme = createToolkitTheme({glass: {opacity: 0.7}});           // con vidrio más transparente (por omisión 0.8)
//   const theme = createToolkitTheme({glass: {surfaces: true}});         // también las tarjetas del contenido (con advertencia)
//   const theme = createToolkitTheme({glass: true, bar: TOP_BAR.band});  // la barra de arriba en franja (por omisión, cápsulas)
//   const theme = createToolkitTheme({colorSchemes: {light: {palette: {primary: {main: '#0B5FFF'}}}, dark: {...}}});
//
// Lo que trae, con su porqué:
//   - variables CSS y los dos modos: ColorSchemeToggle cambia de modo sin volver a pintar, y las gráficas leen sus colores
//     del tema (theme.vars): con variables cambian solas al cambiar de modo, sin ellas se quedarían con las del arranque.
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
import {minimalComponents, minimalTonesOf} from '@/theme/components/minimalComponents.js';
import {FIELD_TONES} from '@/theme/glassSurface.js';
import {cssTokenDeclarationsOf} from '@/theme/cssTokens.js';
import {createLogger} from '@/observability/logger.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

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
 * La barra de arriba, con vidrio y con el minimalista: por omisión como las ventanas de macOS Tahoe, sin franja (el nombre
 * y los botones en cápsulas por grupo; lo eligió el autor al verlas), o la franja de lado a lado. Con vidrio las cápsulas
 * son de vidrio y el contenido pasa por debajo desenfocado; con el minimalista son bloques del tono de las tarjetas sobre
 * el color del fondo (AppLayout). El estilo de Stackcraft sin vidrio se queda con su barra de siempre.
 */
export const TOP_BAR = Object.freeze({band: 'band', capsules: 'capsules'});

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

/** Las variables CSS del proyecto declaradas en :root (con el CssBaseline de MUI); sin valores, nada. */
function cssTokenComponentsOf(cssTokens) {
    const declarations = cssTokenDeclarationsOf(cssTokens);
    return Object.keys(declarations).length > 0 ? {MuiCssBaseline: {styleOverrides: {':root': declarations}}} : {};
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
 * @param {'capsules'|'band'} [options.bar] la barra de arriba con vidrio o con el minimalista (TOP_BAR): por omisión en
 *     cápsulas; 'band' la franja de lado a lado
 * @param {{light?: {default?: string, paper?: string, fill?: string, floating?: string}, dark?: {default?: string, paper?: string, fill?: string, floating?: string}}} [options.minimalTones]
 *     los tonos del minimalista con los colores de la marca, por modo: default (el fondo de la página), paper (las tarjetas,
 *     un escalón arriba), fill (el relleno de campos, grupos y botones sin color) y floating (la barra de pestañas del
 *     teléfono y lo que flota). Lo que no se pase se queda con los grises de Apple (MINIMAL_TONES). OJO: con el minimalista
 *     el fondo de la página sale de aquí y no de la paleta (sin minimalTones, los grises de Apple aunque la paleta traiga
 *     su background)
 * @param {{radius?: number, light?: {fill?: string, hoverFill?: string, border?: string, hoverBorder?: string}, dark?: {fill?: string, hoverFill?: string, border?: string, hoverBorder?: string}}} [options.fields]
 *     cómo se ven los campos de captura (con vidrio, con el minimalista y dentro de FormSection), por modo: fill (el
 *     relleno), hoverFill (con el cursor encima), border y hoverBorder (la orilla); y radius (las esquinas, en px). Lo que no
 *     se pase se queda como el estilo lo trae (FIELD_TONES: el gris de Apple; con el minimalista, su relleno). Van en la
 *     paleta de cada modo (palette.field), así que también se pueden escribir en colorSchemes y cambian solos con el modo.
 *     Ejemplo, campos blancos con borde en claro: {light: {fill: '#FFFFFF', hoverFill: '#FFFFFF', border: '#C4CDD5'}}
 * @param {{panelRadius?: number|string, menuRadius?: number|string, fieldRadius?: number|string, glassBlur?: number|string, glassSaturate?: number|string}} [options.cssTokens]
 *     los valores globales de Calcita como variables CSS (--calcita-panel-radius…, ver cssTokens.js): las esquinas de los
 *     paneles, los menús y los campos, y el desenfoque del vidrio. Se declaran en :root con el CssBaseline; un número va en
 *     px (glassSaturate en %). Sin la opción, cada estilo usa los suyos. También se pueden poner en CSS suelto
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
    bar = TOP_BAR.capsules,
    minimalTones = {},
    fields = {},
    cssTokens = {},
    components = {},
    overrides = {},
    ...unknownOptions
} = {}) {
    // una opción con otro nombre (glassBar en lugar de bar) se perdía sin decir nada: se avisa mientras se programa
    warnUnknownProps('createToolkitTheme', unknownOptions);
    // un nombre mal escrito dejaría la franja sin avisar: mejor que truene al armar el tema
    if (!Object.values(TOP_BAR).includes(bar)) {
        throw new RangeError(`createToolkitTheme: bar es '${TOP_BAR.capsules}' o '${TOP_BAR.band}' (llegó ${bar}).`);
    }
    const isMinimal = look === THEME_LOOK.minimal;
    // el minimalista es sólido: sin vidrio aunque se pida
    const glassSettings = isMinimal ? null : glassSettingsOf(glass);
    const frameworkComponents = isMinimal
        ? mergeComponents(toolkitComponents(), minimalComponents())
        : (glassSettings ? mergeComponents(toolkitComponents(), glassComponents({surfaces: glassSettings.surfaces})) : toolkitComponents());
    // el minimalista separa las superficies por su tono: el fondo de la página y la tarjeta un escalón arriba (los grises de
    // Apple o los tonos de la marca que pasó el proyecto)
    const tones = isMinimal ? minimalTonesOf(minimalTones) : null;
    // los campos de cada modo: lo del estilo (el gris de Apple o, con el minimalista, su relleno), encima lo de `fields` y
    // encima lo que el proyecto escribió en su paleta (palette.field)
    const fieldTonesOf = (mode, scheme) => {
        const lookTones = tones?.[mode]
            ? {...FIELD_TONES[mode], fill: tones[mode].fill, hoverFill: tones[mode].fill}
            : FIELD_TONES[mode] ?? FIELD_TONES.light;
        return {...lookTones, ...fields[mode], ...scheme?.palette?.field};
    };
    const schemes = Object.fromEntries(Object.entries(colorSchemes).map(([mode, scheme]) => [mode, {
        ...scheme,
        palette: {
            ...scheme?.palette,
            ...(isMinimal && {background: tones[mode] ? {default: tones[mode].default, paper: tones[mode].paper} : scheme?.palette?.background}),
            field: fieldTonesOf(mode, scheme),
        },
    }]));
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
        // las variables CSS del proyecto en :root (con el CssBaseline), y encima sus propios ajustes de componentes
        components: mergeComponents(mergeComponents(frameworkComponents, cssTokenComponentsOf(cssTokens)), components),
        // sin sombras en el minimalista: lo plano es la idea
        ...(isMinimal && {shadows: Array(SHADOW_LEVELS).fill('none')}),
        // minimalTones: los tonos con que se pintan los rellenos y lo que flota (minimalComponents los lee del tema)
        // fields: las esquinas de los campos (sus tonos van en la paleta: palette.field)
        toolkit: {glass: glassSettings, look, bar, minimalTones: tones, fields: {radius: fields.radius}},
        ...overrides,
    });
    return responsiveFontSizes(baseTheme);
}
