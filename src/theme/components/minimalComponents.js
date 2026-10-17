// El estilo minimalista (createToolkitTheme({look: 'minimal'})): plano y tonal, como pidió el autor («casi solo colores, sin
// bordes, que el mismo color diga dónde están las superficies»; su referencia: BELOW y Samurai Jack, formas de bloques de
// color sin contorno y una sola luz de acento).
//
// Las reglas:
//   - sin bordes ni sombras: las superficies se separan por su tono, con los grises de Apple (el fondo agrupado gris y las
//     tarjetas un escalón arriba, MINIMAL_BACKGROUND; los campos, el gris de relleno, TONAL_FILL);
//   - un solo color de acento: el botón principal, lo elegido (un tinte suave de su color, sin marco) y las ligas; lo demás
//     neutro. El botón con borde y la etiqueta con borde pasan a «tonales»: el tinte de su color, sin la raya;
//   - sin vidrio ni degradados: superficies sólidas.
// Va encima de los ajustes del framework (toolkitComponents) y el proyecto puede sumar los suyos encima.
//
// Funciones puras, sin React: function (regla de la casa).
import {paletteOf} from '@/theme/components/paletteOf.js';
import {textSizeOf} from '@/theme/appleTracking.js';
import {accentTextStylesOf} from '@/theme/glassSurface.js';

/** Los fondos del minimalista: el gris agrupado de Apple y la tarjeta un escalón arriba, en claro y en oscuro. */
export const MINIMAL_BACKGROUND = Object.freeze({
    light: {default: '#F2F2F7', paper: '#FFFFFF'},
    dark: {default: '#000000', paper: '#1C1C1E'},
});

// el gris de relleno de Apple para campos y grupos (más claro que el fondo en oscuro)
const TONAL_FILL = Object.freeze({light: 'rgba(118, 118, 128, 0.12)', dark: 'rgba(118, 118, 128, 0.24)'});
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
    return {backgroundColor: TONAL_FILL.light, ...theme.applyStyles('dark', {backgroundColor: TONAL_FILL.dark})};
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
 * @returns {object} el `components` del tema de MUI para el estilo minimalista
 */
export function minimalComponents() {
    return {
        MuiPaper: {
            defaultProps: {elevation: 0},
            styleOverrides: {
                root: {backgroundImage: 'none', boxShadow: 'none'},
                outlined: {border: 0},
                rounded: {borderRadius: RADIUS_PIXELS.card},
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
                root: ({theme}) => ({
                    ...tonalFillOf(theme),
                    borderRadius: RADIUS_PIXELS.control,
                    '&.Mui-focused': {outline: `2px solid ${tintOf(theme, 'primary', TINT_PERCENT.ring)}`},
                    '&.Mui-error': {outline: `2px solid ${tintOf(theme, 'error', TINT_PERCENT.ring)}`},
                }),
                notchedOutline: {border: 0},
            },
        },
        MuiFilledInput: {
            defaultProps: {disableUnderline: true},
            styleOverrides: {root: ({theme}) => ({...tonalFillOf(theme), borderRadius: RADIUS_PIXELS.control})},
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
                grouped: {border: 0, borderRadius: `${RADIUS_PIXELS.segment}px !important`},
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: ({theme}) => ({
                    border: 0,
                    '&.Mui-selected, &.Mui-selected:hover': {backgroundColor: paletteOf(theme).background.paper, color: paletteOf(theme).text.primary},
                    ...theme.applyStyles('dark', {'&.Mui-selected, &.Mui-selected:hover': {backgroundColor: 'rgba(118, 118, 128, 0.36)'}}),
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
