// El estilo minimalista (createToolkitTheme({look: 'minimal'})): plano y tonal, como pidió el autor («casi solo colores, sin
// bordes, que el mismo color diga dónde están las superficies»; su referencia: BELOW y Samurai Jack, formas de bloques de
// color sin contorno y una sola luz de acento).
//
// Las reglas:
//   - sin bordes ni sombras: las superficies se separan por su tono, por omisión con los grises de Apple (MINIMAL_TONES: el
//     fondo agrupado gris y las tarjetas un escalón arriba; los campos, el gris de relleno; lo que flota, un gris más). Cada
//     proyecto puede pasar los suyos (createToolkitTheme minimalTones) y el minimalista se pinta con su marca;
//   - un solo color de acento: el botón principal, lo elegido (un tinte suave de su color, sin marco) y las ligas; lo demás
//     neutro. El botón con borde y la etiqueta con borde pasan a «tonales»: el tinte de su color, sin la raya;
//   - sin vidrio ni degradados: superficies sólidas.
// Va encima de los ajustes del framework (toolkitComponents) y el proyecto puede sumar los suyos encima.
//
// Funciones puras, sin React: function (regla de la casa).
import {paletteOf} from '@/theme/components/paletteOf.js';
import {textSizeOf} from '@/theme/appleTracking.js';
import {accentTextStylesOf, fieldWellStylesOf} from '@/theme/glassSurface.js';
import {lightDarkStylesOf} from '@/theme/lightDarkStyles.js';
import {cssTokenOf} from '@/theme/cssTokens.js';

/**
 * Los tonos del minimalista por omisión, los grises de Apple, en claro y en oscuro:
 *   - default: el fondo de la página (el gris agrupado);
 *   - paper: las tarjetas, un escalón arriba;
 *   - fill: el relleno de campos, grupos y botones sin color (más claro que el fondo en oscuro);
 *   - floating: lo que flota sobre el contenido (la barra de pestañas del teléfono, el aviso de versión nueva), un escalón
 *     más oscuro que las tarjetas. Del color de las tarjetas «se perdía» sobre ellas (lo dijo el autor de la primera barra
 *     de abajo del minimalista); así se distingue sin borde ni sombra, sobre tarjetas y sobre el fondo.
 */
export const MINIMAL_TONES = Object.freeze({
    light: Object.freeze({default: '#F2F2F7', paper: '#FFFFFF', fill: 'rgba(118, 118, 128, 0.12)', floating: '#E5E5EA'}),
    dark: Object.freeze({default: '#000000', paper: '#1C1C1E', fill: 'rgba(118, 118, 128, 0.24)', floating: '#2C2C2E'}),
});

/** Los fondos del minimalista por omisión (los de MINIMAL_TONES): el gris agrupado de Apple y la tarjeta un escalón arriba. */
export const MINIMAL_BACKGROUND = Object.freeze({
    light: {default: MINIMAL_TONES.light.default, paper: MINIMAL_TONES.light.paper},
    dark: {default: MINIMAL_TONES.dark.default, paper: MINIMAL_TONES.dark.paper},
});

/**
 * Los tonos del minimalista con los del proyecto encima: lo que el proyecto no trae se queda con el gris de Apple.
 *
 * @param {{light?: object, dark?: object}} [projectTones] cualquiera de default, paper, fill y floating por modo
 * @returns {{light: {default: string, paper: string, fill: string, floating: string}, dark: {default: string, paper: string, fill: string, floating: string}}}
 */
export function minimalTonesOf(projectTones = {}) {
    return {
        light: {...MINIMAL_TONES.light, ...projectTones.light},
        dark: {...MINIMAL_TONES.dark, ...projectTones.dark},
    };
}

/** Los tonos con que se armó el tema (createToolkitTheme los guarda); sin ellos, los de Apple. */
function tonesOf(theme) {
    return theme.toolkit?.minimalTones ?? MINIMAL_TONES;
}
// el tinte de lo elegido y de los controles tonales (por ciento de su color) y al pasar el cursor
const TINT_PERCENT = Object.freeze({rest: 14, hover: 22, ring: 45});
// las esquinas: tarjetas y controles (px)
const RADIUS_PIXELS = Object.freeze({card: 16, control: 10, group: 12, segment: 9});
// los títulos chicos (overline), como se escriben (px)
const SMALL_TITLE_PIXELS = 13;

/**
 * El tinte de un color del tema (lo elegido, un botón tonal).
 *
 * @param {object} theme
 * @param {string} [colorName]
 * @param {number} [percent]
 * @returns {string}
 */
function tintOf(theme, colorName = 'primary', percent = TINT_PERCENT.rest) {
    const palette = paletteOf(theme);
    const color = (palette[colorName] ?? palette.primary).main;
    return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

/**
 * El relleno gris de un campo o de un grupo, en claro y en oscuro.
 *
 * @param {object} theme
 * @returns {object}
 */
function tonalFillOf(theme) {
    const tones = tonesOf(theme);
    return lightDarkStylesOf(theme, {backgroundColor: tones.light.fill}, {backgroundColor: tones.dark.fill});
}

/**
 * Lo elegido: el tinte suave del acento y su letra legible, sin marco ni gota.
 *
 * @param {object} theme
 * @returns {object}
 */
function selectedTintOf(theme) {
    return {backgroundColor: tintOf(theme), ...accentTextStylesOf(theme)};
}

/**
 * La superficie de lo que flota en el minimalista, sólida, en claro y en oscuro (el tono floating; ver MINIMAL_TONES).
 *
 * @param {object} theme
 * @returns {object}
 */
export function minimalFloatingStylesOf(theme) {
    const tones = tonesOf(theme);
    return lightDarkStylesOf(theme, {backgroundColor: tones.light.floating}, {backgroundColor: tones.dark.floating});
}

/**
 * @returns {object} el `components` del tema de MUI para el estilo minimalista
 */
export function minimalComponents() {
    return {
        MuiPaper: {
            defaultProps: {elevation: 0},
            styleOverrides: {
                root: {backgroundImage: 'none', boxShadow: 'none'},
                outlined: {border: 0},
                // las tarjetas: la variable de los paneles (cssTokens.js) con sus 16 px de respaldo
                rounded: {borderRadius: cssTokenOf('panelRadius', `${RADIUS_PIXELS.card}px`)},
            },
        },
        MuiCard: {defaultProps: {elevation: 0}},
        // la barra del mismo tono que el fondo: sin raya ni sombra, solo su contenido
        MuiAppBar: {
            defaultProps: {elevation: 0, color: 'inherit'},
            styleOverrides: {
                root: ({theme}) => ({backgroundColor: paletteOf(theme).background.default, color: paletteOf(theme).text.primary, boxShadow: 'none', borderBottom: 0}),
            },
        },
        // el menú lateral también del tono del fondo, sin raya: lo separa el espacio, no una línea
        MuiDrawer: {
            styleOverrides: {
                paper: ({theme}) => ({backgroundColor: paletteOf(theme).background.default, borderRight: 0, backgroundImage: 'none'}),
            },
        },
        MuiButton: {
            defaultProps: {disableElevation: true},
            styleOverrides: {
                root: {borderRadius: RADIUS_PIXELS.control, boxShadow: 'none'},
                // el de borde es «tonal»: el tinte de su color, sin la raya
                outlined: ({ownerState, theme}) => ({
                    border: 0,
                    backgroundColor: tintOf(theme, ownerState.color),
                    '&:hover': {border: 0, backgroundColor: tintOf(theme, ownerState.color, TINT_PERCENT.hover)},
                }),
            },
        },
        MuiButtonGroup: {defaultProps: {disableElevation: true}},
        MuiOutlinedInput: {
            styleOverrides: {
                // el campo: los tonos de los campos del tema (por omisión, el relleno del minimalista; ver createToolkitTheme)
                root: ({theme}) => ({
                    ...fieldWellStylesOf(theme, {radius: RADIUS_PIXELS.control}),
                    '&.Mui-focused': {outline: `2px solid ${tintOf(theme, 'primary', TINT_PERCENT.ring)}`},
                    '&.Mui-error': {outline: `2px solid ${tintOf(theme, 'error', TINT_PERCENT.ring)}`},
                }),
                notchedOutline: {border: 0},
            },
        },
        MuiFilledInput: {
            defaultProps: {disableUnderline: true},
            styleOverrides: {root: ({theme}) => fieldWellStylesOf(theme, {radius: RADIUS_PIXELS.control})},
        },
        // la etiqueta con borde también es tonal: el tinte de su color (o el gris si no lleva color)
        MuiChip: {
            styleOverrides: {
                outlined: ({ownerState, theme}) => ({
                    border: 0,
                    ...(ownerState.color && ownerState.color !== 'default' ? {backgroundColor: tintOf(theme, ownerState.color)} : tonalFillOf(theme)),
                }),
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: ({theme}) => ({borderRadius: RADIUS_PIXELS.control, '&.Mui-selected, &.Mui-selected:hover': selectedTintOf(theme)}),
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: ({theme}) => ({'&.Mui-selected, &.Mui-selected:hover': selectedTintOf(theme)}),
            },
        },
        // el grupo de botones (el control segmentado): una tira gris y lo elegido en blanco (claro) o un escalón arriba (oscuro)
        MuiToggleButtonGroup: {
            styleOverrides: {
                root: ({theme}) => ({...tonalFillOf(theme), border: 0, borderRadius: RADIUS_PIXELS.group, padding: 3, gap: 3}),
                // sin !important: el ajuste del tema va después de las reglas del grupo de MUI (las que quitan las esquinas de los
                // de en medio) y les gana igual; con !important ni el control segmentado ni el proyecto podían cambiar la forma
                grouped: {border: 0, borderRadius: RADIUS_PIXELS.segment},
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: ({theme}) => ({
                    border: 0,
                    ...lightDarkStylesOf(theme,
                        {'&.Mui-selected, &.Mui-selected:hover': {backgroundColor: paletteOf(theme).background.paper, color: paletteOf(theme).text.primary}},
                        {'&.Mui-selected, &.Mui-selected:hover': {backgroundColor: 'rgba(118, 118, 128, 0.36)'}}),
                }),
            },
        },
        MuiTab: {
            styleOverrides: {
                root: ({theme}) => ({'&.Mui-selected': accentTextStylesOf(theme)}),
            },
        },
        // las tablas sin rayas entre renglones: el encabezado se distingue por su tono
        MuiTableCell: {
            styleOverrides: {
                root: {borderBottom: 0},
                head: ({theme}) => ({...tonalFillOf(theme), fontWeight: 600}),
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {border: 0, '--DataGrid-rowBorderColor': 'transparent'},
                columnHeaders: ({theme}) => tonalFillOf(theme),
            },
        },
        MuiAlert: {styleOverrides: {root: {border: 0}}},
        // los títulos chicos como se escriben (Apple ya no los pone en mayúsculas), con el espaciado de su tamaño
        MuiTypography: {
            styleOverrides: {
                overline: {textTransform: 'none', fontWeight: 600, ...textSizeOf(SMALL_TITLE_PIXELS)},
            },
        },
    };
}
