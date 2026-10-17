// Los colores de Stackcraft (la marca del autor del framework), para claro y oscuro: los que usa createToolkitTheme() si
// el proyecto no pasa los suyos. Vienen del tema de walk-ot, alineado al manual de identidad de Stackcraft v1.0.
//
// Las decisiones que ya se probaron, con su porqué:
//   1. El lienzo es Cloud #FAFAFA y las tarjetas blanco puro: se distinguen sin sombras.
//   2. Forge #FF6B1A es el principal en los DOS modos: 3.2:1 sobre Cloud (AA para texto en negrita de 14 px o más) y
//      6.78:1 sobre Carbon. Un solo naranja simplifica la marca.
//   3. El texto sobre Forge se invierte con el modo: Cloud (claro) en modo claro, Carbon (oscuro) en modo oscuro.
//   4. El aviso (warning) es ÁMBAR, no naranja: un naranja de aviso se confundía con el botón principal; el ámbar se
//      distingue también con daltonismo.
//   5. El secundario es neutro (Steel / Mist): una sola identidad de color y escala de grises (lo que hacen Vercel o
//      Linear). Si hace falta otro acento, Ember o Spark.
//   6. El texto en claro es Iron con transparencia 0.92, no negro puro: cansa menos la vista en jornadas largas.
//
// Funciones puras, sin React: function (regla de la casa).

/** Los tokens de la marca, para lo que la paleta de MUI no cubre (un SVG, una insignia decorativa). */
export const STACKCRAFT = Object.freeze({
    // principales
    forge: '#FF6B1A',
    ember: '#CC5614',
    spark: '#FF8A4D',
    // neutros
    carbon: '#0A0A0A',
    iron: '#1A1A1A',
    steel: '#4A4A4A',
    mist: '#E6E6E6',
    cloud: '#FAFAFA',
    // SOLO para «no aplica» / neutral sin estatus: un cuarto estado que no es éxito, aviso, error ni información. Frío para
    // equilibrar el Forge sin competir; 10.4:1 sobre Cloud.
    slateNavy: '#1E3A8A',
});

// la escala de grises de la marca (tonos cálidos entre Mist y Steel)
const STACKCRAFT_GREY = Object.freeze({
    50: STACKCRAFT.cloud,
    100: STACKCRAFT.mist,
    200: '#D6D3D1',
    300: '#A8A29E',
    400: '#78716C',
    500: STACKCRAFT.steel,
    600: '#3C3C3C',
    700: '#2A2A2A',
    800: STACKCRAFT.iron,
    900: STACKCRAFT.carbon,
});

/** La paleta del modo claro. */
export const stackcraftLightPalette = Object.freeze({
    primary: {main: STACKCRAFT.forge, light: STACKCRAFT.spark, dark: STACKCRAFT.ember, contrastText: STACKCRAFT.cloud},
    secondary: {main: STACKCRAFT.steel, light: STACKCRAFT.mist, dark: STACKCRAFT.iron, contrastText: STACKCRAFT.cloud},
    success: {main: '#15803d', light: '#4ade80', dark: '#14532d', contrastText: STACKCRAFT.cloud},
    warning: {main: '#b45309', light: '#fbbf24', dark: '#92400e', contrastText: STACKCRAFT.cloud},
    error: {main: '#b91c1c', light: '#f87171', dark: '#991b1b', contrastText: STACKCRAFT.cloud},
    info: {main: '#0369a1', light: '#38bdf8', dark: '#075985', contrastText: STACKCRAFT.cloud},
    grey: STACKCRAFT_GREY,
    text: {primary: 'rgba(26, 26, 26, 0.92)', secondary: 'rgba(26, 26, 26, 0.65)', disabled: 'rgba(26, 26, 26, 0.40)'},
    divider: 'rgba(26, 26, 26, 0.14)',
    background: {default: STACKCRAFT.cloud, paper: '#FFFFFF'},
    action: {hover: 'rgba(26, 26, 26, 0.045)', selected: 'rgba(26, 26, 26, 0.07)'},
});

/** La paleta del modo oscuro. */
export const stackcraftDarkPalette = Object.freeze({
    primary: {main: STACKCRAFT.forge, light: STACKCRAFT.spark, dark: STACKCRAFT.ember, contrastText: STACKCRAFT.carbon},
    secondary: {main: STACKCRAFT.mist, light: STACKCRAFT.cloud, dark: STACKCRAFT.steel, contrastText: STACKCRAFT.carbon},
    success: {main: '#4ade80', light: '#86efac', dark: '#16a34a', contrastText: STACKCRAFT.carbon},
    warning: {main: '#fbbf24', light: '#fde68a', dark: '#d97706', contrastText: STACKCRAFT.carbon},
    error: {main: '#f87171', light: '#fca5a5', dark: '#dc2626', contrastText: STACKCRAFT.carbon},
    info: {main: '#38bdf8', light: '#7dd3fc', dark: '#0284c7', contrastText: STACKCRAFT.carbon},
    grey: STACKCRAFT_GREY,
    text: {primary: 'rgba(230, 230, 230, 0.95)', secondary: 'rgba(230, 230, 230, 0.70)', disabled: 'rgba(230, 230, 230, 0.42)'},
    divider: STACKCRAFT.steel,
    background: {default: STACKCRAFT.carbon, paper: STACKCRAFT.iron},
    action: {hover: 'rgba(230, 230, 230, 0.05)', selected: 'rgba(230, 230, 230, 0.08)'},
});
