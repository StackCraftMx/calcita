// El «vidrio líquido» (Liquid Glass de Apple, 2025) en su versión de CSS: una superficie poco transparente que deja ver,
// desenfocado, lo que pasa por detrás, con un brillo en el borde de arriba. La guía de Apple (Human Interface Guidelines,
// «Materials»: https://developer.apple.com/design/human-interface-guidelines/materials) separa dos capas, y aquí igual:
//   - VIDRIO (glassStylesOf): «a distinct functional layer for controls and navigation elements… that floats above the
//     content layer». En el framework: la barra de arriba, el menú lateral, los menús y ventanitas, los diálogos, los
//     tooltips, los avisos, el panel de descargas, el botón flotante y, en los controles, la «gota» que marca lo elegido.
//   - MATERIAL (materialStylesOf): «Don't use Liquid Glass in the content layer»; el contenido usa los materiales estándar
//     (vidrio esmerilado, sin el brillo del borde) y los gruesos, más opacos, porque «provide better contrast for text».
//     Es lo que llevan las tarjetas con createToolkitTheme({glass: {surfaces: true}}).
//
// Decisiones, con su porqué:
//   - 60 % opaco por omisión. Con 80 %, en claro el vidrio era casi blanco sobre un lienzo casi blanco y se leía como
//     «cápsulas con sombra» (lo dijo el autor), no como vidrio: Apple dice que el vidrio «has no inherent color, and
//     instead takes on colors from the content directly behind it», y para eso tiene que dejar pasar el color. El material
//     del contenido es «delgado» (MATERIAL_OPACITY_OFFSET): con 74 % las tarjetas se veían planas, de un solo color (lo dijo
//     el autor); con el desenfoque de 20 px el texto se sigue leyendo. El proyecto lo cambia con
//     createToolkitTheme({glass: {opacity: 0.8}}), que mueve las dos.
//   - Lo que dibuja el vidrio es su filo de luz, como la orilla de una lente: brillante arriba a la izquierda (de donde
//     viene la luz), más suave abajo a la derecha, y un resplandor por dentro; la sombra de afuera es corta.
//   - Se pinta sólido si la persona pidió menos transparencia o más contraste en su equipo, o si el navegador no sabe
//     desenfocar: la misma guía pide respetar «Reducir transparencia», y Apple tuvo que agregar el control en iOS 26.1
//     porque el texto sobre vidrio no se leía.
//   - Con vidrio, el lienzo lleva unas manchas de color (ambientBackgroundOf): sobre un lienzo liso, el vidrio no
//     se distingue de una superficie sólida, porque no hay nada que desenfocar.
//   - Esquinas concéntricas: la de afuera es la de adentro más el margen (los renglones del menú lateral son de 12 px a 8 px
//     del borde, así que el panel es de 20 px). Apple lo pide así; si no, las esquinas «no casan» y se nota.
//   - Sin refracción (la lupa que deforma lo de atrás): en la web solo sale con filtros SVG que hoy funcionan nada más en
//     Chrome, o con WebGL. Esto es la versión que funciona en todos.
//   - color-mix y no alpha(): sirve igual con las variables CSS del tema (var(--mui-palette-…)) que con un color normal.
//
// OJO: backdrop-filter vuelve a la superficie el «contenedor» de lo que lleve adentro con position: fixed. Lo que deba
// quedar fijo a la ventana va fuera de ella (los menús de MUI ya van en un portal).
//
// Funciones puras, sin React: function (regla de la casa).
import {paletteOf} from '@/theme/components/paletteOf.js';
import {lightDarkStylesOf} from '@/theme/lightDarkStyles.js';
import {cssTokenOf} from '@/theme/cssTokens.js';

/** Qué tan opaca es la superficie (0 a 1). */
export const GLASS_OPACITY = 0.6;

/** Las esquinas de lo que flota grande (menú lateral, barra, diálogos): renglones de 12 px a 8 px del borde. */
export const GLASS_PANEL_RADIUS_PIXELS = 20;

/** Las esquinas de los menús y ventanitas: renglones de 8 px a 4 px del borde. */
export const GLASS_MENU_RADIUS_PIXELS = 12;

// las esquinas y el desenfoque como variables CSS que el proyecto cambia de un jalón (cssTokens.js), con el valor de siempre
// como respaldo
export const PANEL_RADIUS = cssTokenOf('panelRadius', `${GLASS_PANEL_RADIUS_PIXELS}px`);
export const MENU_RADIUS = cssTokenOf('menuRadius', `${GLASS_MENU_RADIUS_PIXELS}px`);

/**
 * Lo que se separa de la orilla de la ventana lo que flota (la barra, el menú lateral, los cajones y la hoja de abajo):
 * Apple lo pide para que el contenido se asome por detrás («half sheets are inset from the edge of the display to allow
 * content to peek through from beneath them», Adopting Liquid Glass).
 */
export const GLASS_INSET_PIXELS = 8;

export const GLASS_BLUR = `blur(${cssTokenOf('glassBlur')}) saturate(${cssTokenOf('glassSaturate')})`;

/**
 * El lente de cada tamaño (ver lensRulesOf), medido en capturas de Chrome: el control chico (botón, chip) más claro y con
 * la orilla más marcada; el panel (barra, menú, diálogo) más grueso, porque lleva texto («Liquid Glass appears more opaque
 * in larger elements like sidebars to preserve legibility», HIG «Color»). edgeFraction y scale van en fracción del tamaño
 * del vidrio; clearerBy es cuánto menos tinte lleva que el esmerilado.
 */
export const GLASS_LENS = Object.freeze({
    control: {filterId: 'toolkit-glass-lens-control', edgeFraction: 0.25, scale: 0.2, blurPixels: 3, clearerBy: 0.25},
    panel: {filterId: 'toolkit-glass-lens-panel', edgeFraction: 0.12, scale: 0.05, blurPixels: 10, clearerBy: 0.1},
});

// el gris de la gota en oscuro (por ciento de blanco): lo elegido se tiene que notar (glassDropOf)
const DARK_DROP_WHITE_PERCENT = 18;
// cuánto negro (en claro) o blanco (en oscuro) lleva un texto del color del tema para leerse (accentTextStylesOf)
const ACCENT_TEXT_SHADE_PERCENT = 30;
// el pozo de los campos (fieldWellStylesOf): el gris de relleno de Apple en claro y un oscurecido en oscuro
const FIELD_WELL_RADIUS_PIXELS = 12;
const FIELD_WELL_FILL = Object.freeze({
    light: {rest: 'rgba(118, 118, 128, 0.12)', hover: 'rgba(118, 118, 128, 0.18)'},
    // en oscuro el gris de Apple, MÁS CLARO que lo de atrás (su «tertiary fill»): con negro al 32 % el campo se perdía
    dark: {rest: 'rgba(118, 118, 128, 0.24)', hover: 'rgba(118, 118, 128, 0.30)'},
});
// el campo suelto sobre el lienzo (canvasFieldStylesOf): lámina clara en claro, oscura en oscuro, con su filo
const CANVAS_FIELD = Object.freeze({
    light: {rest: 'rgba(255, 255, 255, 0.62)', hover: 'rgba(255, 255, 255, 0.78)', edge: 'rgba(15, 23, 42, 0.10)'},
    // en oscuro, el gris de relleno de Apple (más claro que el fondo). Con negro al 34 % el campo contra el fondo casi negro
    // medía 1.01 : 1 y no se veía (lo reportaron: el buscador «se pierde»); con este, 1.26 : 1, y su filo aparte
    dark: {rest: 'rgba(118, 118, 128, 0.24)', hover: 'rgba(118, 118, 128, 0.30)', edge: 'rgba(255, 255, 255, 0.10)'},
});
// el contraste mínimo de WCAG para letra normal, y cómo se oscurece un relleno hasta lograrlo (whiteLabelFillOf)
const MIN_TEXT_CONTRAST = 4.5;
const FILL_SHARE_STEP_PERCENT = 5;
const MIN_FILL_SHARE_PERCENT = 30;

/** La marca que GlassLensFilter pone en <body> cuando el navegador sí pinta el lente. */
export const GLASS_LENS_FLAG_SELECTOR = 'body[data-glass-lens="on"]';

/**
 * El selector de «este control está dentro de una tarjeta» (cualquier Paper: tarjeta, diálogo, menú), donde el control ya
 * no es vidrio. Va en dos versiones, sin y con la marca del lente: la regla del lente (una etiqueta y dos clases) le ganaba
 * a la de la tarjeta (dos clases) y los botones dentro de una tarjeta volvían a ser vidrio. Medido en Chrome.
 *
 * @param {string} [suffix] lo que va pegado al control (p. ej. ':not(.MuiButtonGroup-grouped)')
 * @returns {string}
 */
export function insideContentSelectorOf(suffix = '') {
    return `.MuiPaper-root &${suffix}, ${GLASS_LENS_FLAG_SELECTOR} .MuiPaper-root &${suffix}`;
}
const REDUCED_TRANSPARENCY_QUERY = '@media (prefers-reduced-transparency: reduce), (prefers-contrast: more)';
const NO_BACKDROP_FILTER_QUERY = '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))';

// qué tan fuertes son las manchas del lienzo (por ciento del color). En oscuro van MÁS fuertes que en claro: sobre un lienzo
// casi negro, unas manchas tenues no dan nada que desenfocar y el vidrio se ve como un gris sólido.
// La de en medio (center) va detrás del contenido: sin ella, en claro las tarjetas de vidrio quedaban sobre blanco y se
// veían sólidas (medido en las capturas de Chrome).
const AMBIENT_STRENGTH_LIGHT = Object.freeze({primary: 40, info: 30, accent: 30, center: 16});
// en oscuro: manchas de los tonos oscuros sobre un casi negro con un toque azul (como los fondos oscuros de Apple). Antes
// eran los tonos vivos al 36 % sobre #0A0A0A: aclaraban el fondo hasta el gris de las tarjetas y los elementos se perdían
// (lo reportaron; medido: tarjeta contra fondo 1.12 : 1). Ahora 1.28 : 1 en el peor punto
const AMBIENT_STRENGTH_DARK = Object.freeze({primary: 18, info: 18, accent: 12, center: 10});
const DARK_CANVAS = Object.freeze({base: '#05070B'});

// el filo de la lente: la luz de arriba a la izquierda (rimLight), la de abajo a la derecha más suave (rimShade), un
// resplandor por dentro (innerGlow), una línea fina de afuera que lo separa del lienzo (outline) y la sombra que lo
// despega (shadow). En oscuro el filo es más tenue, pero la sombra más fuerte: una negra suave no se ve sobre casi negro.
// Un control chico (botón, chip) lleva una sombra corta (controlShadow): la de un panel se veía como neblina alrededor y,
// dentro de una tira que se desliza (los filtros rápidos), la tira la cortaba en un rectángulo.
const GLASS_EDGE_LIGHT = Object.freeze({
    rimLight: 'rgba(255, 255, 255, 0.95)', rimShade: 'rgba(255, 255, 255, 0.5)', innerGlow: 'rgba(255, 255, 255, 0.45)',
    outline: 'rgba(15, 23, 42, 0.07)', shadow: '0 6px 20px rgba(15, 23, 42, 0.10)',
    controlShadow: '0 1px 2px rgba(15, 23, 42, 0.10), 0 2px 6px rgba(15, 23, 42, 0.06)',
});
const GLASS_EDGE_DARK = Object.freeze({
    rimLight: 'rgba(255, 255, 255, 0.32)', rimShade: 'rgba(255, 255, 255, 0.12)', innerGlow: 'rgba(255, 255, 255, 0.07)',
    outline: 'rgba(0, 0, 0, 0.35)', shadow: '0 8px 28px rgba(0, 0, 0, 0.45)',
    controlShadow: '0 1px 2px rgba(0, 0, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.25)',
});
// lo ancho del resplandor de adentro (px): lo que se ve como el grosor del vidrio en la orilla
const INNER_GLOW_PIXELS = 12;
// en oscuro el vidrio se aclara un poco sobre su color: un gris igual de oscuro que el lienzo no se distingue de él aunque
// desenfoque. Es lo que Apple hace en oscuro: lo que va al frente usa los colores «elevated», más claros, «making
// foreground interfaces appear to advance» (HIG, Dark Mode). Con 8 % las tarjetas y los controles se perdían en el fondo
// oscuro (lo reportaron); con 16 % y el lienzo nuevo (DARK_CANVAS) la tarjeta se separa 1.28 : 1 del fondo y el control
// 1.32 : 1 (medido; Apple, su tarjeta #1C1C1E sobre negro: 1.23 : 1)
const DARK_GLASS_LIFT_PERCENT = 16;

// el material del contenido: sin brillo de borde (eso es del vidrio de los controles), con una línea fina de afuera que lo
// separa del lienzo y una sombra suave. En oscuro la línea es clara: una oscura no se ve sobre casi negro
const MATERIAL_EDGE_LIGHT = Object.freeze({outline: 'rgba(15, 23, 42, 0.08)', shadow: '0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)'});
const MATERIAL_EDGE_DARK = Object.freeze({outline: 'rgba(255, 255, 255, 0.08)', shadow: '0 8px 24px rgba(0, 0, 0, 0.35)'});
// el material del contenido es «delgado» (HIG «Materials»: «Thinner materials… help people retain their context by
// providing a visible reminder of the content that's in the background»): menos opaco que el vidrio de los controles. Con
// el «grueso» (+0.14, 74 %) las tarjetas se veían planas; el texto se lee por el desenfoque de 20 px, y con «Reducir
// transparencia» se pinta sólido. En oscuro resta menos: con 45 % la tarjeta casi no se separaba del fondo (medido 1.12 : 1)
const MATERIAL_OPACITY_OFFSET = Object.freeze({light: -0.15, dark: -0.05});
// el material «grueso» (por ciento): tapa lo que pasa por debajo, como la columna fija de una tabla
const THICK_MATERIAL_PERCENT = 92;

/**
 * Si el tema trae el vidrio prendido (createToolkitTheme({glass: …})). Lo usan los componentes del framework que flotan
 * (el marco, el panel de descargas, los avisos) y lo puede usar el proyecto para lo suyo.
 *
 * @param {object} theme el tema de MUI
 * @returns {boolean}
 */
export function isGlassTheme(theme) {
    return Boolean(theme?.toolkit?.glass);
}

/**
 * La opacidad del vidrio del tema: la que pidió el proyecto o GLASS_OPACITY.
 *
 * @param {object} theme
 * @returns {number}
 */
export function glassOpacityOf(theme) {
    return theme?.toolkit?.glass?.opacity ?? GLASS_OPACITY;
}

/**
 * El estilo de una superficie de vidrio sobre un color.
 *
 * @param {string} solidColor el color sólido de la superficie (p. ej. palette.background.paper o primary.main)
 * @param {object} [options]
 * @param {number} [options.opacity] por omisión GLASS_OPACITY
 * @param {boolean} [options.isDark] en oscuro el vidrio se aclara un poco y su filo brilla más
 * @param {boolean} [options.isControl] un control chico (botón, chip): sombra corta en vez de la de un panel
 * @returns {object} estilos para styleOverrides o sx
 */
export function glassSurfaceOf(solidColor, {opacity = GLASS_OPACITY, isDark = false, isControl = false} = {}) {
    const edge = isDark ? GLASS_EDGE_DARK : GLASS_EDGE_LIGHT;
    const tint = isDark ? `color-mix(in srgb, ${solidColor}, white ${DARK_GLASS_LIFT_PERCENT}%)` : solidColor;
    return {
        backgroundColor: `color-mix(in srgb, ${tint} ${Math.round(opacity * 100)}%, transparent)`,
        backdropFilter: GLASS_BLUR,
        WebkitBackdropFilter: GLASS_BLUR,
        backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0) 40%)',
        boxShadow: [
            `inset 1px 1px 0 ${edge.rimLight}`,
            `inset -1px -1px 0 ${edge.rimShade}`,
            `inset 0 0 ${INNER_GLOW_PIXELS}px ${edge.innerGlow}`,
            `0 0 0 1px ${edge.outline}`,
            isControl ? edge.controlShadow : edge.shadow,
        ].join(', '),
        ...solidFallbackOf({backgroundColor: solidColor, backdropFilter: 'none', WebkitBackdropFilter: 'none'}),
    };
}

/**
 * Lo que se pinta en lugar del vidrio si la persona pidió menos transparencia o más contraste, o si el navegador no sabe
 * desenfocar. Para lo transparente que no es una superficie (el fondo oscuro detrás de un diálogo, la perilla del
 * deslizador al arrastrarla).
 *
 * @param {object} solidStyle los estilos sólidos
 * @returns {object}
 */
export function solidFallbackOf(solidStyle) {
    return {[REDUCED_TRANSPARENCY_QUERY]: solidStyle, [NO_BACKDROP_FILTER_QUERY]: solidStyle};
}

/**
 * El vidrio sobre un color del tema en claro y en oscuro, con la opacidad del tema. Es lo que usan los ajustes de
 * componentes, y lo que usa el proyecto para algo suyo que flote:
 *   sx={(theme) => glassStylesOf(theme)}                                          // sobre el color de las tarjetas
 *   sx={(theme) => glassStylesOf(theme, {color: paletteOf(theme).primary.main})}  // vidrio del color principal
 *
 * @param {object} theme el tema de MUI
 * @param {object} [options]
 * @param {string} [options.color] el color de la superficie; por omisión el de las tarjetas (background.paper)
 * @param {string} [options.darkColor] el de modo oscuro, si es otro; por omisión el mismo
 * @param {number} [options.opacity] por omisión la del tema
 * @param {boolean} [options.isControl] un control chico (botón, chip): sombra corta en vez de la de un panel
 * @returns {object}
 */
export function glassStylesOf(theme, {color, darkColor, opacity, isControl = false} = {}) {
    const lightColor = color ?? paletteOf(theme).background.paper;
    const glassOpacity = opacity ?? glassOpacityOf(theme);
    return {
        ...lightDarkStylesOf(theme,
            glassSurfaceOf(lightColor, {opacity: glassOpacity, isControl}),
            glassSurfaceOf(darkColor ?? lightColor, {opacity: glassOpacity, isDark: true, isControl})),
        ...lensRulesOf(theme, {lightColor, darkColor: darkColor ?? lightColor, opacity: glassOpacity, isControl}),
    };
}

/**
 * El LENTE: lo que, según Apple, define al vidrio líquido («The primary way Liquid Glass visually defines itself is through
 * something called Lensing… previous materials scattered light, this new set of materials dynamically bends, shapes, and
 * concentrates light», WWDC25 «Meet Liquid Glass»). La orilla dobla lo de atrás (un filtro SVG de desplazamiento,
 * GlassLensFilter) y el centro queda más claro: menos tinte y menos desenfoque que el esmerilado.
 *
 * Solo en Chrome y sus parientes (Edge, Brave, Arc): son los únicos que aplican un filtro SVG en backdrop-filter; Firefox
 * lo acepta sin pintarlo (el vidrio se quedaría sin desenfoque) y Safari no lo entiende. Por eso va detrás de la marca que
 * GlassLensFilter pone en <body> solo en esos navegadores; en los demás queda el esmerilado. Con «Reducir transparencia» o
 * «Aumentar contraste» se pinta sólido igual que siempre.
 *
 * OJO: el modo oscuro va en su propia regla y no anidado: el selector de oscuro vive en <html> y, anidado debajo de la
 * marca de <body>, buscaría un .dark DENTRO de <body> y nunca coincidiría.
 *
 * @param {object} theme
 * @param {{lightColor: string, darkColor: string, opacity: number, isControl: boolean}} options
 * @returns {object}
 */
function lensRulesOf(theme, {lightColor, darkColor, opacity, isControl}) {
    const lens = isControl ? GLASS_LENS.control : GLASS_LENS.panel;
    const lensOpacity = Math.max(0, opacity - lens.clearerBy);
    const backdrop = `blur(${lens.blurPixels}px) saturate(180%) url(#${lens.filterId})`;
    const lensSurfaceOf = (solidColor, isDark) => {
        const tint = isDark ? `color-mix(in srgb, ${solidColor}, white ${DARK_GLASS_LIFT_PERCENT}%)` : solidColor;
        return {
            backgroundColor: `color-mix(in srgb, ${tint} ${Math.round(lensOpacity * 100)}%, transparent)`,
            backdropFilter: backdrop,
            WebkitBackdropFilter: backdrop,
            ...solidFallbackOf({backgroundColor: solidColor, backdropFilter: 'none', WebkitBackdropFilter: 'none'}),
        };
    };
    const lensKey = `${GLASS_LENS_FLAG_SELECTOR} &`;
    // la regla de oscuro del tema: un selector (*:where(.dark) &) o una media query, según cómo elija el modo el proyecto
    const darkKey = Object.keys(theme.applyStyles('dark', {}))[0];
    if (!darkKey) {
        return {[lensKey]: lensSurfaceOf(lightColor, false)};
    }
    const darkLens = darkKey.startsWith('@')
        ? {[darkKey]: {[lensKey]: lensSurfaceOf(darkColor, true)}}
        : {[darkKey.replace('&', lensKey)]: lensSurfaceOf(darkColor, true)};
    return {[lensKey]: lensSurfaceOf(lightColor, false), ...darkLens};
}

/**
 * El mapa de desplazamiento del lente (una imagen SVG): rojo para lo de lado y verde para lo de arriba abajo; 128 en medio
 * es «no mover». En la orilla de la izquierda y la de arriba vale más (toma de adentro) y en la de la derecha y la de
 * abajo, menos (también de adentro): así la orilla dobla lo de atrás hacia el centro, como una lente convexa, y nunca toma
 * de afuera del vidrio (afuera no hay imagen y la orilla se quedaba en blanco).
 *
 * @param {number} edgeFraction lo ancho de la orilla que dobla (0 a 0.5 del tamaño del vidrio)
 * @returns {string} data URI para el feImage del filtro
 */
export function lensDisplacementMapOf(edgeFraction) {
    const inner = 1 - edgeFraction;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" preserveAspectRatio="none"><defs>'
        + `<linearGradient id="x" x1="0" x2="1"><stop offset="0" stop-color="#ff0000"/><stop offset="${edgeFraction}" stop-color="#800000"/>`
        + `<stop offset="${inner}" stop-color="#800000"/><stop offset="1" stop-color="#000000"/></linearGradient>`
        + `<linearGradient id="y" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#00ff00"/><stop offset="${edgeFraction}" stop-color="#008000"/>`
        + `<stop offset="${inner}" stop-color="#008000"/><stop offset="1" stop-color="#000000"/></linearGradient>`
        + '</defs><rect width="100" height="100" fill="url(#x)"/><rect width="100" height="100" fill="url(#y)" style="mix-blend-mode:screen"/></svg>';
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * El material del contenido sobre un color: esmerilado como el vidrio pero sin el brillo del borde, y más transparente.
 *
 * @param {string} solidColor
 * @param {object} [options]
 * @param {number} [options.opacity] la del vidrio; el material le suma MATERIAL_OPACITY_OFFSET de su modo (le resta)
 * @param {boolean} [options.isDark]
 * @returns {object}
 */
export function materialSurfaceOf(solidColor, {opacity = GLASS_OPACITY, isDark = false} = {}) {
    const edge = isDark ? MATERIAL_EDGE_DARK : MATERIAL_EDGE_LIGHT;
    const tint = isDark ? `color-mix(in srgb, ${solidColor}, white ${DARK_GLASS_LIFT_PERCENT}%)` : solidColor;
    const offset = isDark ? MATERIAL_OPACITY_OFFSET.dark : MATERIAL_OPACITY_OFFSET.light;
    const materialOpacity = Math.min(1, Math.max(0, opacity + offset));
    return {
        backgroundColor: `color-mix(in srgb, ${tint} ${Math.round(materialOpacity * 100)}%, transparent)`,
        backdropFilter: GLASS_BLUR,
        WebkitBackdropFilter: GLASS_BLUR,
        backgroundImage: 'none',
        boxShadow: `0 0 0 1px ${edge.outline}, ${edge.shadow}`,
        ...solidFallbackOf({backgroundColor: solidColor, backdropFilter: 'none', WebkitBackdropFilter: 'none'}),
    };
}

/**
 * El material del contenido en claro y en oscuro (las tarjetas con glass: {surfaces: true}). Para algo del proyecto que va
 * en el contenido: sx={(theme) => materialStylesOf(theme)}.
 *
 * @param {object} theme
 * @param {object} [options]
 * @param {string} [options.color] por omisión el de las tarjetas (background.paper)
 * @param {string} [options.darkColor] por omisión el mismo
 * @returns {object}
 */
export function materialStylesOf(theme, {color, darkColor} = {}) {
    const lightColor = color ?? paletteOf(theme).background.paper;
    const opacity = glassOpacityOf(theme);
    return lightDarkStylesOf(theme, materialSurfaceOf(lightColor, {opacity}), materialSurfaceOf(darkColor ?? lightColor, {opacity, isDark: true}));
}

/**
 * Solo el fondo del material, sin su línea ni su sombra: para lo que va DENTRO de una tarjeta y debe tapar lo que pasa por
 * debajo sin verse como un parche sólido (la columna pegada de la tabla al deslizarla de lado). Va como capa
 * (background-image) y no como color: así el color propio del elemento (el del renglón: la cebra, el cursor encima) se
 * sigue pintando encima.
 *
 * Con {thick: true}, el material «grueso» de Apple (HIG «Materials»: los gruesos son para leer sobre otro contenido): el
 * mismo desenfoque al 92 %. Es el de la columna fija de una tabla: con el delgado de la tarjeta (45 a 55 %) se veían pasar
 * por detrás las otras columnas (lo reportaron).
 *
 * @param {object} theme
 * @param {object} [options]
 * @param {boolean} [options.thick] el material grueso, para tapar lo que pasa por debajo
 * @returns {object}
 */
export function materialBackgroundOf(theme, {thick = false} = {}) {
    const paper = paletteOf(theme).background.paper;
    const opacityOf = (offset) => (thick ? THICK_MATERIAL_PERCENT : Math.round(Math.min(1, Math.max(0, glassOpacityOf(theme) + offset)) * 100));
    const layerOf = (color) => `linear-gradient(${color}, ${color})`;
    const frostedOf = (tint, opacity) => ({
        backgroundImage: layerOf(`color-mix(in srgb, ${tint} ${opacity}%, transparent)`),
        backdropFilter: GLASS_BLUR,
        WebkitBackdropFilter: GLASS_BLUR,
    });
    return {
        ...lightDarkStylesOf(theme,
            frostedOf(paper, opacityOf(MATERIAL_OPACITY_OFFSET.light)),
            frostedOf(`color-mix(in srgb, ${paper}, white ${DARK_GLASS_LIFT_PERCENT}%)`, opacityOf(MATERIAL_OPACITY_OFFSET.dark))),
        ...solidFallbackOf({backgroundImage: layerOf(paper), backdropFilter: 'none', WebkitBackdropFilter: 'none'}),
    };
}

/**
 * La «gota» que marca lo elegido dentro de un control (la pestaña, la opción, el renglón del menú lateral): en claro, una
 * pastilla blanca con su brillo y su sombra; en oscuro, un relleno gris parejo, como el renglón elegido de las barras
 * laterales de Apple en oscuro. No es transparente del todo: va DENTRO de algo que ya puede ser de vidrio (un menú), y
 * vidrio sobre vidrio no se lee.
 * OJO, oscuro: con blanco al 14 % casi no se veía, y su línea de luz arriba dibujaba un arco raro en la esquina («no se
 * nota la selección», «se ve raro»; lo reportaron). Va al 18 % y sin línea.
 *
 * @param {object} theme
 * @returns {object}
 */
export function glassDropOf(theme) {
    const palette = paletteOf(theme);
    return lightDarkStylesOf(theme, {
        backgroundColor: palette.background.paper,
        color: palette.text.primary,
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 3px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
    }, {
        backgroundColor: `color-mix(in srgb, ${palette.common.white} ${DARK_DROP_WHITE_PERCENT}%, transparent)`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
    });
}

/**
 * El relleno de un control lleno de color (el botón principal, la etiqueta elegida) para llevar letra BLANCA y que se lea:
 * el color del tema oscurecido lo justo para llegar a 4.5 : 1 (WCAG). En oscuro la paleta trae letra negra sobre el
 * naranja («El suyo», «Guardar»: se veía feo, lo reportaron) y el blanco sobre el naranja tal cual da 2.85 : 1; con el
 * naranja al 75 % y blanco da 4.79 : 1. Se calcula con el color que elija el proyecto, no con uno fijo.
 *
 * @param {string} rawColor el color en #RRGGBB o #RGB (el de la paleta, no la variable CSS)
 * @returns {string|null} el relleno en #RRGGBB; null si el color no viene en hexadecimal
 */
export function whiteLabelFillOf(rawColor) {
    const channels = hexChannelsOf(rawColor);
    if (!channels) {
        return null;
    }
    // del color tal cual hacia el negro, en pasos de 5 %, hasta que la letra blanca se lea
    for (let share = 100; share >= MIN_FILL_SHARE_PERCENT; share -= FILL_SHARE_STEP_PERCENT) {
        const mixed = channels.map((channel) => Math.round((channel * share) / 100));
        if (contrastWithWhiteOf(mixed) >= MIN_TEXT_CONTRAST) {
            return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
        }
    }
    return `#${channels.map((channel) => Math.round((channel * MIN_FILL_SHARE_PERCENT) / 100).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Los tres canales de un color #RRGGBB o #RGB (0 a 255); null si no es hexadecimal.
 *
 * @param {string} color
 * @returns {number[]|null}
 */
function hexChannelsOf(color) {
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color ?? '').trim());
    if (!match) {
        return null;
    }
    const digits = match[1].length === 3 ? [...match[1]].map((digit) => digit + digit).join('') : match[1];
    return [0, 2, 4].map((start) => parseInt(digits.slice(start, start + 2), 16));
}

/**
 * El contraste de la letra blanca sobre un color (fórmula de WCAG).
 *
 * @param {number[]} channels
 * @returns {number}
 */
function contrastWithWhiteOf(channels) {
    const [red, green, blue] = channels.map((channel) => {
        const unit = channel / 255;
        return unit <= 0.03928 ? unit / 12.92 : ((unit + 0.055) / 1.055) ** 2.4;
    });
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    return 1.05 / (luminance + 0.05);
}

/**
 * Los tonos de los campos por omisión, por modo: fill (el relleno), hoverFill (con el cursor encima), border y hoverBorder
 * (la orilla; transparente: el pozo de Apple no lleva). createToolkitTheme los pone en la paleta de cada modo
 * (palette.field) y el proyecto los cambia con `fields` o con su paleta: blancos con borde, del tono de su marca…
 */
export const FIELD_TONES = Object.freeze({
    light: Object.freeze({fill: FIELD_WELL_FILL.light.rest, hoverFill: FIELD_WELL_FILL.light.hover, border: 'transparent', hoverBorder: 'transparent'}),
    dark: Object.freeze({fill: FIELD_WELL_FILL.dark.rest, hoverFill: FIELD_WELL_FILL.dark.hover, border: 'transparent', hoverBorder: 'transparent'}),
});

/**
 * Los tonos de los campos del tema (palette.field, que llena createToolkitTheme; con sus variables CSS cambian solos con el
 * modo, sin reglas de oscuro), o null si el tema no los trae (un createTheme de MUI sin Calcita).
 *
 * @param {object} theme
 * @returns {{fill: string, hoverFill: string, border: string, hoverBorder: string}|null}
 */
export function fieldPaletteOf(theme) {
    return paletteOf(theme).field ?? null;
}

/** La orilla de un campo: una línea por dentro (sombra inset), que no mueve el texto ni pelea con el aro del foco (outline). */
function fieldEdgeOf(color) {
    return `inset 0 0 0 1px ${color}`;
}

/**
 * Las esquinas de los campos: las que pidió el proyecto en su tema (createToolkitTheme fields.radius), o la variable
 * --calcita-field-radius con las de cada estilo de respaldo.
 */
function fieldRadiusOf(theme, lookRadius) {
    return theme.toolkit?.fields?.radius ?? cssTokenOf('fieldRadius', `${lookRadius}px`);
}

/**
 * El «pozo» de un campo de texto dentro del contenido (una tarjeta, un formulario agrupado), como los de Apple: un relleno
 * parejo con esquinas de 12 px, del gris de relleno de Apple («tertiary fill»): tenue en claro y más claro que la tarjeta en
 * oscuro (con negro, en oscuro se perdía). Sin vidrio adentro de la tarjeta: ahí no tiene nada que dejar
 * ver. Con el cursor encima se marca apenas; antes el relleno salía solo con el cursor y en cuadro («hovers espantosos»).
 * Los tonos y las esquinas los puede cambiar el proyecto (createToolkitTheme fields).
 *
 * @param {object} theme
 * @param {{radius?: number}} [options] las esquinas del estilo que lo pide (el minimalista las tiene más chicas)
 * @returns {object}
 */
export function fieldWellStylesOf(theme, {radius = FIELD_WELL_RADIUS_PIXELS} = {}) {
    const base = {backgroundImage: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none', borderRadius: fieldRadiusOf(theme, radius)};
    const field = fieldPaletteOf(theme);
    if (field) {
        return {
            ...base,
            backgroundColor: field.fill,
            boxShadow: fieldEdgeOf(field.border),
            '&:hover': {backgroundColor: field.hoverFill, boxShadow: fieldEdgeOf(field.hoverBorder)},
        };
    }
    const {light, dark} = FIELD_TONES;
    return {
        ...base,
        ...lightDarkStylesOf(theme,
            {backgroundColor: light.fill, boxShadow: fieldEdgeOf(light.border), '&:hover': {backgroundColor: light.hoverFill, boxShadow: fieldEdgeOf(light.hoverBorder)}},
            {backgroundColor: dark.fill, boxShadow: fieldEdgeOf(dark.border), '&:hover': {backgroundColor: dark.hoverFill, boxShadow: fieldEdgeOf(dark.hoverBorder)}}),
    };
}

/**
 * Los tonos de los campos como variables (--calcita-field-*) para un contenedor: el renglón de FormSection las pone en sí
 * mismo y sus campos las leen (fieldWellFromVariablesOf). OJO, trampa pagada: el renglón le gana al tema con selectores
 * largos («html body &&& .MuiOutlinedInput-root») y una regla de oscuro anidada ahí abajo nunca aplicaba (en oscuro el
 * campo salía con el gris de claro). En el contenedor la regla de oscuro sí aplica, y los campos heredan la variable.
 *
 * @param {object} theme
 * @returns {object}
 */
export function fieldVariablesOf(theme) {
    const variablesOf = (tones) => ({
        '--calcita-field-fill': tones.fill,
        '--calcita-field-hover-fill': tones.hoverFill,
        '--calcita-field-edge': fieldEdgeOf(tones.border),
        '--calcita-field-hover-edge': fieldEdgeOf(tones.hoverBorder),
    });
    const field = fieldPaletteOf(theme);
    if (field) {
        return variablesOf(field);
    }
    return {...variablesOf(FIELD_TONES.light), ...theme.applyStyles('dark', variablesOf(FIELD_TONES.dark))};
}

/**
 * El pozo de un campo leyendo las variables de su contenedor (fieldVariablesOf).
 *
 * @param {object} theme
 * @returns {object}
 */
export function fieldWellFromVariablesOf(theme) {
    return {
        backgroundImage: 'none',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        borderRadius: fieldRadiusOf(theme, FIELD_WELL_RADIUS_PIXELS),
        backgroundColor: 'var(--calcita-field-fill)',
        boxShadow: 'var(--calcita-field-edge)',
        '&:hover': {backgroundColor: 'var(--calcita-field-hover-fill)', boxShadow: 'var(--calcita-field-hover-edge)'},
    };
}

/**
 * Un campo de texto suelto sobre el lienzo (fuera de una tarjeta): una lámina de vidrio clara en claro y el gris de relleno
 * de Apple en oscuro, más claro que el fondo casi negro. Con «Reducir transparencia» se pinta sólido.
 *
 * @param {object} theme
 * @returns {object}
 */
export function canvasFieldStylesOf(theme) {
    const paper = paletteOf(theme).background.paper;
    return {
        backgroundImage: 'none',
        backdropFilter: GLASS_BLUR,
        WebkitBackdropFilter: GLASS_BLUR,
        borderRadius: cssTokenOf('fieldRadius', `${FIELD_WELL_RADIUS_PIXELS}px`),
        ...lightDarkStylesOf(theme, {
            backgroundColor: CANVAS_FIELD.light.rest,
            boxShadow: `0 0 0 1px ${CANVAS_FIELD.light.edge}`,
            '&:hover': {backgroundColor: CANVAS_FIELD.light.hover},
        }, {
            backgroundColor: CANVAS_FIELD.dark.rest,
            boxShadow: `0 0 0 1px ${CANVAS_FIELD.dark.edge}`,
            '&:hover': {backgroundColor: CANVAS_FIELD.dark.hover},
        }),
        ...solidFallbackOf({backgroundColor: paper, backdropFilter: 'none', WebkitBackdropFilter: 'none'}),
    };
}

/**
 * El color de un TEXTO que debe ir del color del tema (una liga, un botón de solo texto, el renglón elegido del menú, el
 * valor de una fecha): el color de la paleta oscurecido en claro y aclarado en oscuro, para que se lea. Medido (WCAG pide
 * 4.5 : 1 en letra normal): el naranja de la marca sobre una tarjeta clara daba 2.78 : 1 y sobre su propio tinte en oscuro
 * 4.41 : 1 (el reporte: «cuesta leer», «se pierde»); con 30 % de negro en claro da 5.24 : 1 y con 30 % de blanco en
 * oscuro 8.23 : 1. Los botones con relleno de color NO usan esto: van con letra de un solo color (HIG «Buttons»: «Avoid
 * applying a similar color to button labels and content layer backgrounds»).
 *
 * @param {object} theme
 * @param {string} [colorName] primary, error, success… (por omisión primary)
 * @returns {object} {color, y el de oscuro}
 */
export function accentTextStylesOf(theme, colorName = 'primary') {
    const palette = paletteOf(theme);
    const main = (palette[colorName] ?? palette.primary).main;
    const keep = 100 - ACCENT_TEXT_SHADE_PERCENT;
    return lightDarkStylesOf(theme, {color: `color-mix(in srgb, ${main} ${keep}%, black)`}, {color: `color-mix(in srgb, ${main} ${keep}%, white)`});
}

/**
 * Un fondo FIJO a la ventana que no se mueve al deslizar, también en el iPhone: va en una capa aparte (::before con
 * position: fixed) detrás del contenido del elemento. Así el vidrio se ve pasar por encima de un fondo quieto.
 *
 * OJO: background-attachment: fixed no sirve para esto. Safari del iPhone y del iPad lo ignora y el fondo se movía con
 * todo (lo vio el autor en el teléfono); además, en escritorio vuelve a pintar todo el fondo en cada paso al deslizar.
 * La capa va con z-index -1 dentro de un contexto propio (isolation): queda arriba del color del elemento y abajo de su
 * contenido. Si el elemento es una caja con esquinas (la escena de un ejemplo), clip-path la recorta a la caja.
 *
 * @param {object} layerStyles el fondo de la capa (backgroundColor, backgroundImage…; puede llevar el modo oscuro)
 * @param {object} [options]
 * @param {string} [options.clipPath] p. ej. 'inset(0 round 20px)' para una caja; sin él, la capa ocupa toda la ventana
 * @returns {object} estilos para el sx del elemento
 */
export function fixedBackgroundLayerOf(layerStyles, {clipPath} = {}) {
    return {
        isolation: 'isolate',
        ...(clipPath && {clipPath}),
        // OJO, iPhone: con inset: 0 el alto de la capa cambia cuando la barra de Safari se esconde al deslizar, y el fondo
        // «seguía al scroll» (lo vio el autor en su teléfono). Medida fija de toda la pantalla (100vw × 100lvh, el alto con
        // la barra escondida; 100vh donde no hay lvh) y su propia capa de composición (translateZ), que es lo que la deja
        // quieta en WebKit
        '&::before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            '@supports (height: 100lvh)': {height: '100lvh'},
            transform: 'translateZ(0)',
            willChange: 'transform',
            zIndex: -1,
            pointerEvents: 'none',
            ...layerStyles,
        },
    };
}

/**
 * El fondo del lienzo con vidrio: manchas del color principal y del de información, fijas a la ventana, para
 * que el vidrio tenga algo que desenfocar. AppLayout ya lo pone; una pantalla fuera del marco (el inicio de sesión) lo usa
 * con sx={(theme) => ambientBackgroundOf(theme)}.
 *
 * @param {object} theme
 * @returns {object}
 */
export function ambientBackgroundOf(theme) {
    const palette = paletteOf(theme);
    const washOf = (strength, tones) => [
        `radial-gradient(60vmax 45vmax at 0% 0%, color-mix(in srgb, ${tones.primary} ${strength.primary}%, transparent), transparent 70%)`,
        `radial-gradient(50vmax 40vmax at 100% 15%, color-mix(in srgb, ${tones.info} ${strength.info}%, transparent), transparent 70%)`,
        `radial-gradient(55vmax 45vmax at 70% 100%, color-mix(in srgb, ${tones.accent} ${strength.accent}%, transparent), transparent 70%)`,
        `radial-gradient(45vmax 35vmax at 45% 50%, color-mix(in srgb, ${tones.info} ${strength.center}%, transparent), transparent 70%)`,
    ].join(', ');
    const lightTones = {primary: palette.primary.main, info: palette.info.main, accent: palette.primary.light};
    // en oscuro, los tonos OSCUROS de la paleta sobre un casi negro: el color tiñe sin aclarar el fondo, y las tarjetas y el
    // vidrio (más claros) no se pierden (ver DARK_CANVAS)
    const darkTones = {primary: palette.primary.dark, info: palette.info.dark, accent: palette.primary.dark};
    return {
        ...lightDarkStylesOf(theme, {backgroundColor: palette.background.default}, {backgroundColor: DARK_CANVAS.base}),
        ...fixedBackgroundLayerOf(lightDarkStylesOf(theme,
            {backgroundColor: palette.background.default, backgroundImage: washOf(AMBIENT_STRENGTH_LIGHT, lightTones)},
            {backgroundColor: DARK_CANVAS.base, backgroundImage: washOf(AMBIENT_STRENGTH_DARK, darkTones)})),
    };
}

// la orilla de arriba con la barra en cápsulas: cuánto tinte del lienzo lleva y cuánto desenfoca (px)
const SCROLL_EDGE_TINT_PERCENT = 55;
const SCROLL_EDGE_BLUR_PIXELS = 12;

/**
 * La orilla de arriba cuando la barra va en cápsulas (TOP_BAR.capsules con vidrio, como las ventanas de macOS Tahoe; Apple le
 * llama «scroll edge effect»): lo que pasa por debajo se desenfoca y se desvanece hacia el contenido, para que el título
 * y las cápsulas se lean sobre cualquier cosa. Con «Reducir transparencia» o sin backdrop-filter, el color del lienzo.
 *
 * @param {object} theme
 * @returns {object}
 */
export function scrollEdgeStylesOf(theme) {
    const palette = paletteOf(theme);
    const tintOf = (canvas) => `color-mix(in srgb, ${canvas} ${SCROLL_EDGE_TINT_PERCENT}%, transparent)`;
    const blur = `blur(${SCROLL_EDGE_BLUR_PIXELS}px)`;
    // de arriba (cubre) hacia abajo (se desvanece): sin raya donde termina
    const fade = 'linear-gradient(to bottom, black 45%, transparent)';
    return {
        ...lightDarkStylesOf(theme, {backgroundColor: tintOf(palette.background.default)}, {backgroundColor: tintOf(DARK_CANVAS.base)}),
        backdropFilter: blur,
        WebkitBackdropFilter: blur,
        maskImage: fade,
        WebkitMaskImage: fade,
        ...solidFallbackOf({backgroundColor: palette.background.default, backdropFilter: 'none', WebkitBackdropFilter: 'none'}),
    };
}
