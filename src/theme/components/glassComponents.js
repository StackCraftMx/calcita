// Los ajustes de componentes de MUI para el vidrio líquido: la interpretación de cada componente según la guía de Apple
// (Human Interface Guidelines; glassSurface.js explica las dos capas). Cada bloque cita la regla de la que sale.
//
//   - VIDRIO en lo que flota y en la navegación: la barra de arriba, los menús y ventanitas (Popover, las listas del
//     Autocomplete, el calendario de MUI X, los menús y paneles de la tabla), los cajones y el menú lateral, los diálogos,
//     los tooltips y los avisos de MUI (Snackbar), el botón flotante (Fab) y la barra de abajo (BottomNavigation).
//   - VIDRIO en los controles que van sobre el lienzo: el botón con borde, el grupo de botones y los chips que se pican son
//     cápsulas de vidrio. DENTRO de una tarjeta, un diálogo o un menú son el «bordered» de Apple (un relleno tenue de su
//     color), porque ahí el vidrio no tiene nada que dejar ver. El principal lleva el brillo; la «gota» marca lo elegido
//     (pestañas, botones de opción, paginación, la barra de abajo); el interruptor es el de iPhone y su perilla, como la del
//     deslizador, crece al apretarla; el «cargando» es la ruedita de iPhone y la barra de progreso, una cápsula delgada.
//   - MATERIAL en el contenido, solo si el proyecto lo pide con createToolkitTheme({glass: {surfaces: true}}): tarjetas
//     (Paper outlined y Card), acordeón, avisos (Alert) y la tabla sin fondo propio.
//   - Esquinas concéntricas (los renglones de los menús a 4 px del borde) y títulos sin mayúsculas.
// createToolkitTheme({glass: …}) los suma después de los normales (mergeComponents).
//
// Lo que NO lleva vidrio a propósito: un diálogo a pantalla completa (fullScreen) y ContentDialog, que son para leer, y lo
// que solo informa dentro del contenido (la etiqueta del estado en un renglón de la tabla).
//
// Funciones puras, sin React: function (regla de la casa).
import {
    GLASS_INSET_PIXELS, GLASS_LENS_FLAG_SELECTOR, GLASS_MENU_RADIUS_PIXELS, GLASS_PANEL_RADIUS_PIXELS, accentTextStylesOf, glassDropOf, glassOpacityOf,
    canvasFieldStylesOf, fieldWellStylesOf, glassStylesOf, glassSurfaceOf, whiteLabelFillOf,
    insideContentSelectorOf, materialStylesOf, solidFallbackOf,
} from '@/theme/glassSurface.js';
import {mergeStyles} from '@/theme/mergeComponents.js';
import {lightDarkStylesOf} from '@/theme/lightDarkStyles.js';
import {textSizeOf} from '@/theme/appleTracking.js';
import {paletteOf} from '@/theme/components/paletteOf.js';

// los renglones de un menú quedan a 4 px del borde, con la esquina del menú menos ese margen
const MENU_ROW_INSET_PIXELS = 4;
// lo que se hunde un botón al apretarlo y lo que crece la perilla del interruptor y del deslizador
const PRESSED_SCALE = 0.97;
const PRESSED_THUMB_SCALE = 1.25;
// el deslizador de Apple (la imagen de «Sliders»): perilla en cápsula blanca, pista de 6 px y el resto de la pista gris
const SLIDER_THUMB = Object.freeze({long: 30, short: 20, shadow: '0 1px 2px rgba(0, 0, 0, 0.25), 0 3px 8px rgba(0, 0, 0, 0.18)'});
const SLIDER_TRACK_PIXELS = 6;
const SLIDER_RAIL = Object.freeze({light: 'rgba(120, 120, 128, 0.24)', dark: 'rgba(120, 120, 128, 0.40)'});
const PILL_RADIUS = 999;
// el alto de un botón de un renglón por tamaño (el que tenía con el interlineado de MUI) y el interlineado cuando se parte
const BUTTON_HEIGHT_PIXELS = Object.freeze({small: 31, medium: 38, large: 42});
const BUTTON_LINE_HEIGHT = 1.3;
// el brillo del vidrio sobre algo sólido de color (el botón principal, la etiqueta elegida): luz arriba y sombra abajo
const PROMINENT_SHEEN_IMAGE = 'linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 55%)';
const PROMINENT_SHEEN_SHADOW = 'inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(0, 0, 0, 0.12)';
// cuánto color de su tipo lleva el material de un aviso (por ciento sobre el color de las tarjetas): en oscuro un poco más,
// porque sobre gris oscuro el tinte se apaga
const ALERT_TINT_PERCENT = Object.freeze({light: 14, dark: 20});
// los tooltips y los avisos de MUI son oscuros en los dos modos: un poco más opacos, porque su texto es chico
const DARK_FLOATING_OPACITY = 0.88;
// la palomita del renglón elegido de un menú (con texto alterno vacío: el lector de pantalla ya dice «seleccionado»)
const MENU_CHECKMARK_CONTENT = '"✓" / ""';
// los títulos chicos que eran en mayúsculas (overline): con vidrio, como se escriben
const SENTENCE_CASE_TITLE_PIXELS = 13;
const REDUCED_MOTION_QUERY = '@media (prefers-reduced-motion: reduce)';
// la ruedita de «cargando» de iPhone: 8 rayitas que giran a saltos (una vuelta en 0.8 s), la de adelante más fuerte y
// las de atrás desvanecidas como cola
const ACTIVITY_SPOKE_COUNT = 8;
const ACTIVITY_SPIN_DURATION = '0.8s';
const ACTIVITY_TAIL_MIN_OPACITY = 0.15;
const ACTIVITY_TAIL_MAX_OPACITY = 0.85;
// la barra de progreso de Apple: una cápsula delgada
const PROGRESS_BAR_HEIGHT_PIXELS = 6;
// lo más ancho de una hoja que sale de arriba o de abajo en una pantalla ancha
const SHEET_MAX_WIDTH_PIXELS = 640;
// el relleno del control «bordered» (por ciento de su color): quieto y con el cursor encima; en oscuro, más, porque sobre
// gris oscuro un tinte tenue no se ve
const TINTED_FILL_PERCENT = Object.freeze({light: {rest: 12, hover: 18}, dark: {rest: 22, hover: 30}});
// la letra de los controles llenos de color, y cuánto más se oscurecen con el cursor encima (whiteLabelOf)
export const WHITE_LABEL = '#FFFFFF';
const PROMINENT_HOVER_SHADE_PERCENT = 12;
// el círculo de los pasos que faltan, con su número blanco: grises de Apple que leen el blanco a 4.5 : 1 o más
const STEP_PENDING_GRAY = Object.freeze({light: '#6E6E73', dark: '#48484A'});
// el fondo del monograma (avatar con iniciales): grises de Apple; con blanco encima, 5.07 : 1 en claro y 6.07 : 1 en oscuro
// lo que se separa el texto de su interruptor (px)
const SWITCH_LABEL_GAP_PIXELS = 12;
export const MONOGRAM_GRAY = Object.freeze({light: '#6E6E73', dark: '#636366'});
// el botón flotante de color con letra blanca va lleno: con vidrio al 92 % lo claro de atrás le bajaba el contraste a
// 4.23 : 1 (medido con la auditoría)
const PROMINENT_GLASS_OPACITY = 1;
// los campos: la esquina dentro de una tarjeta, el gris del relleno (por ciento del color del texto) y qué tan fuerte es el
// aro al escribir
const FIELD_RADIUS_PIXELS = 12;
const FIELD_RING_PERCENT = 40;
const FIELD_RING_PIXELS = Object.freeze({focused: 3, error: 2});
// el botoncito del combo box (px)
const COMBO_BUTTON_PIXELS = 28;
const COMBO_BUTTON_RADIUS_PIXELS = 6;
// lo que se separa el botón de la orilla del campo, el aire entre la ⓧ y el botón, y lo que mide la ⓧ
const COMBO_INSET_PIXELS = 6;
const COMBO_GAP_PIXELS = 6;
const COMBO_CLEAR_PIXELS = 26;
// los chevrones de Apple como máscaras (el ⌃⌄ de las listas y el ⌄ del combo box): los pinta el color del texto
const CHEVRON_PATHS = Object.freeze({upDown: 'M8 9.5l4-4 4 4M8 14.5l4 4 4-4', down: 'M6 9.5l6 6 6-6'});
const chevronSvgOf = (path) => `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`,
)}")`;
const UP_DOWN_CHEVRON_MASK = chevronSvgOf(CHEVRON_PATHS.upDown);
const CHEVRON_DOWN_MASK = chevronSvgOf(CHEVRON_PATHS.down);

/**
 * Un chevrón dibujado con máscara: el color lo pone el texto (currentColor).
 *
 * @param {string} mask el url(...) del dibujo
 * @returns {object}
 */
function chevronMaskOf(mask) {
    return {
        backgroundColor: 'currentColor',
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
    };
}
// el interruptor de iPhone (px): cápsula con la perilla blanca adentro; el chico, para renglones densos
const SWITCH_SIZES = Object.freeze({
    medium: {width: 46, height: 28, thumb: 24},
    small: {width: 36, height: 22, thumb: 18},
});
const SWITCH_THUMB_MARGIN_PIXELS = 2;
// la pista apagada del interruptor: el gris de relleno de Apple (systemFill), en claro y en oscuro
const SWITCH_OFF_TRACK = Object.freeze({light: 'rgba(120, 120, 128, 0.20)', dark: 'rgba(120, 120, 128, 0.36)'});

/**
 * El dibujo de la ruedita (SVG con 8 rayitas redondeadas, cada una con su opacidad) para usarlo como máscara: el color lo
 * pone el fondo (currentColor), así sigue al `color` del componente en claro y en oscuro.
 *
 * @returns {string} el valor para mask-image
 */
function activitySpokesMaskOf() {
    const degreesPerSpoke = 360 / ACTIVITY_SPOKE_COUNT;
    const tailStep = (ACTIVITY_TAIL_MAX_OPACITY - ACTIVITY_TAIL_MIN_OPACITY) / (ACTIVITY_SPOKE_COUNT - 2);
    const spokes = Array.from({length: ACTIVITY_SPOKE_COUNT}, (unused, index) => {
        // la rayita 0 (arriba) es la de adelante; girando a la derecha, la siguiente es la más tenue y la cola crece hacia atrás
        const opacity = index === 0 ? 1 : ACTIVITY_TAIL_MIN_OPACITY + (index - 1) * tailStep;
        return `<rect x="11" y="2" width="2" height="6" rx="1" opacity="${opacity.toFixed(2)}" transform="rotate(${index * degreesPerSpoke} 12 12)"/>`;
    }).join('');
    return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${spokes}</svg>`)}")`;
}

const ACTIVITY_SPOKES_MASK = activitySpokesMaskOf();

/**
 * Lo que se hunde al apretar (sin movimiento si la persona pidió reducirlo).
 *
 * @param {string} pressedTransform el transform al apretar
 * @returns {object}
 */
function pressedMotionOf(pressedTransform) {
    return {
        '&:active': {transform: pressedTransform},
        [REDUCED_MOTION_QUERY]: {'&:active': {transform: 'none'}},
    };
}

/**
 * El vidrio de un color de la paleta (primary, secondary…) o, para 'default', el de las tarjetas.
 *
 * @param {object} theme
 * @param {string|undefined} colorName el `color` del componente
 * @returns {object}
 */
function tintedGlassOf(theme, colorName) {
    const tint = colorName && colorName !== 'default' && colorName !== 'inherit' ? paletteOf(theme)[colorName]?.main : null;
    return tint ? glassSurfaceOf(tint, {opacity: glassOpacityOf(theme)}) : glassStylesOf(theme);
}

/**
 * El vidrio de lo que es oscuro en los dos modos (tooltip, aviso de MUI), sobre su propio color.
 *
 * @param {string} darkColor
 * @returns {object}
 */
function darkGlassOf(darkColor) {
    return glassSurfaceOf(darkColor, {opacity: DARK_FLOATING_OPACITY, isDark: true});
}

/**
 * Una tarjeta del contenido de material: el borde de la tarjeta se vuelve transparente (la línea fina del material ya la
 * marca; con los dos se veía doble) y conserva su grosor para que nada se mueva.
 *
 * @param {object} theme
 * @returns {object}
 */
function contentMaterialOf(theme) {
    return {...materialStylesOf(theme), borderColor: 'transparent'};
}

/**
 * Un control lleno de color (botón principal, etiqueta elegida, numerito) lleva letra BLANCA sobre su color oscurecido lo
 * justo para leerse (whiteLabelFillOf), en claro y en oscuro. En oscuro la paleta traía letra negra sobre el naranja y se
 * veía feo («El suyo», «Guardar»); en claro, el blanco sobre el naranja tal cual daba 2.85 : 1 (lo reportaron: «les está
 * costando leerlo»). Sale del color crudo de cada paleta: con el color que elija el proyecto; los que ya se leen no cambian.
 *
 * @param {object} theme
 * @param {string} colorName primary, error, success…
 * @returns {object} los estilos de claro y de oscuro (sin ellos si el color no viene en hexadecimal)
 */
function whiteLabelOf(theme, colorName) {
    const schemeStylesOf = (scheme) => {
        const fill = whiteLabelFillOf(theme.colorSchemes?.[scheme]?.palette?.[colorName]?.main);
        if (!fill) {
            return {};
        }
        return {
            backgroundColor: fill,
            color: WHITE_LABEL,
            '&:hover': {backgroundColor: `color-mix(in srgb, ${fill} ${100 - PROMINENT_HOVER_SHADE_PERCENT}%, black)`},
        };
    };
    return lightDarkStylesOf(theme, schemeStylesOf('light'), schemeStylesOf('dark'));
}

/**
 * El monograma de Apple: iniciales blancas sobre gris, en claro y en oscuro (MONOGRAM_GRAY).
 *
 * @param {object} theme
 * @returns {object}
 */
function monogramOf(theme) {
    return lightDarkStylesOf(theme, {color: WHITE_LABEL, backgroundColor: MONOGRAM_GRAY.light}, {color: WHITE_LABEL, backgroundColor: MONOGRAM_GRAY.dark});
}

/**
 * Un control dentro del contenido (un botón con borde o un chip que se pica dentro de una tarjeta): el botón «bordered» de
 * Apple, un relleno tenue de su color sin vidrio, sin borde y sin sombra. La letra va de UN SOLO color (la del texto) y el
 * color va en el relleno: con la letra naranja sobre su tinte naranja, en oscuro daba 4.41 : 1 y no se leía (reporte: «el
 * blanco sería mejor opción para las letras»); con la letra del texto da 9.14 : 1. HIG «Buttons»: «Avoid applying a
 * similar color to button labels and content layer backgrounds».
 *
 * @param {object} theme
 * @param {string} toneColor el color del control (el principal, el de error… o el del texto si es neutro)
 * @returns {object}
 */
function tintedControlOf(theme, toneColor) {
    const fillOf = (percent) => `color-mix(in srgb, ${toneColor} ${percent}%, transparent)`;
    const plain = {backgroundImage: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none', boxShadow: 'none', borderColor: 'transparent'};
    return {
        ...plain,
        color: paletteOf(theme).text.primary,
        ...lightDarkStylesOf(theme,
            {backgroundColor: fillOf(TINTED_FILL_PERCENT.light.rest), '&:hover': {...plain, backgroundColor: fillOf(TINTED_FILL_PERCENT.light.hover)}},
            {backgroundColor: fillOf(TINTED_FILL_PERCENT.dark.rest), '&:hover': {backgroundColor: fillOf(TINTED_FILL_PERCENT.dark.hover)}}),
    };
}

/**
 * Un campo dentro de una tarjeta: el «pozo» de Apple (fieldWellStylesOf, en glassSurface.js, el mismo de FormSection).
 *
 * @param {object} theme
 * @returns {object}
 */
function fieldFillOf(theme) {
    return fieldWellStylesOf(theme);
}

/**
 * El aro de un campo: del color principal al escribir y rojo si tiene error. Es un contorno (outline) y no un borde, para
 * que nada se mueva y siga la esquina del campo.
 *
 * @param {object} theme
 * @returns {object}
 */
function fieldRingsOf(theme) {
    const palette = paletteOf(theme);
    const ringOf = (color, width) => ({outline: `${width}px solid color-mix(in srgb, ${color} ${FIELD_RING_PERCENT}%, transparent)`, outlineOffset: 0});
    return {
        '&.Mui-focused': ringOf(palette.primary.main, FIELD_RING_PIXELS.focused),
        '&.Mui-error': ringOf(palette.error.main, FIELD_RING_PIXELS.error),
        '&.Mui-error.Mui-focused': ringOf(palette.error.main, FIELD_RING_PIXELS.focused),
    };
}

/**
 * Un cajón que sale encima del contenido (el menú del teléfono, un panel de la derecha, la hoja de abajo): flota separado
 * de la orilla con sus esquinas, como las hojas de Apple. El fijo del menú lateral lo acomoda AppLayout.
 *
 * @param {string} anchor de qué orilla sale
 * @returns {object}
 */
function floatingDrawerOf(anchor) {
    const inset = `${GLASS_INSET_PIXELS}px`;
    const fullLength = `calc(100% - ${GLASS_INSET_PIXELS * 2}px)`;
    // la hoja de arriba o de abajo, en una pantalla ancha, va al centro y no de orilla a orilla (como las hojas de iPad y Mac)
    const centeredSheet = {maxWidth: SHEET_MAX_WIDTH_PIXELS, marginInline: 'auto'};
    const placementByAnchor = {
        left: {top: inset, left: inset, height: fullLength},
        right: {top: inset, right: inset, height: fullLength},
        top: {top: inset, left: inset, right: inset, maxHeight: fullLength, ...centeredSheet},
        bottom: {bottom: inset, left: inset, right: inset, maxHeight: fullLength, ...centeredSheet},
    };
    return {...placementByAnchor[anchor], borderRadius: GLASS_PANEL_RADIUS_PIXELS};
}

/**
 * @param {object} [options]
 * @param {boolean} [options.surfaces] también el contenido (tarjetas, acordeón, avisos, tabla) con material; por omisión no
 * @returns {object} el `components` del tema de MUI
 */
export function glassComponents({surfaces = false} = {}) {
    return {
        ...(surfaces && {
            MuiPaper: {
                styleOverrides: {
                    root: ({ownerState, theme}) => (ownerState.variant === 'outlined' ? contentMaterialOf(theme) : {}),
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: ({theme}) => contentMaterialOf(theme),
                },
            },
            // el acordeón (HIG «Disclosure controls»): cada sección es su propia tarjeta de material, separada de la
            // siguiente, en vez de la línea gris de MUI entre ellas; todas con la misma esquina (MUI redondeaba solo la
            // primera y la última)
            MuiAccordion: {
                styleOverrides: {
                    root: ({theme}) => ({
                        ...contentMaterialOf(theme),
                        '&, &:first-of-type, &:last-of-type': {borderRadius: GLASS_MENU_RADIUS_PIXELS},
                        '&::before': {display: 'none'},
                        '&, &.Mui-expanded': {margin: `0 0 ${GLASS_INSET_PIXELS}px`},
                        '&:last-of-type, &.Mui-expanded:last-of-type': {marginBottom: 0},
                    }),
                },
            },
            // los avisos dentro del contenido (Alert): el de omisión, material teñido del color de su tipo (verde, rojo,
            // ámbar, azul): HIG «Color» permite color en el vidrio para «status indicators»; el de borde, material sin tinte
            // con su borde de color; el relleno, de su color con el brillo del botón principal
            MuiAlert: {
                styleOverrides: {
                    root: ({ownerState, theme}) => {
                        if (ownerState.variant === 'filled') {
                            return {backgroundImage: PROMINENT_SHEEN_IMAGE, boxShadow: PROMINENT_SHEEN_SHADOW};
                        }
                        if (ownerState.variant === 'outlined') {
                            return materialStylesOf(theme);
                        }
                        const palette = paletteOf(theme);
                        const severityColor = (palette[ownerState.colorSeverity] ?? palette.info).main;
                        const tintOf = (percent) => `color-mix(in srgb, ${severityColor} ${percent}%, ${palette.background.paper})`;
                        return materialStylesOf(theme, {color: tintOf(ALERT_TINT_PERCENT.light), darkColor: tintOf(ALERT_TINT_PERCENT.dark)});
                    },
                },
            },
        }),
        // los títulos chicos en mayúsculas (variant="overline": el de SectionCard, MetricCard, los campos, los ajustes): Apple
        // dejó de poner los encabezados en mayúsculas («section headers no longer render entirely in capital letters»,
        // Adopting Liquid Glass) y los títulos de sus cajas van «sentence-style» (HIG «Boxes»)
        MuiTypography: {
            styleOverrides: {
                overline: {textTransform: 'none', fontWeight: 600, ...textSizeOf(SENTENCE_CASE_TITLE_PIXELS)},
            },
        },
        // la barra de arriba (la del color principal, fija o no): vidrio NEUTRO en claro y en oscuro. HIG «Toolbars»: «Reduce
        // the use of toolbar backgrounds and tinted controls»; un vidrio naranja al 80 % se veía sólido. El brillo del borde
        // ya la separa del contenido: la línea de abajo sobra
        MuiAppBar: {
            styleOverrides: {
                root: ({ownerState, theme}) => {
                    const isPrimary = (ownerState.color ?? 'primary') === 'primary';
                    if (!isPrimary) {
                        return {};
                    }
                    return {...glassStylesOf(theme), color: paletteOf(theme).text.primary, borderBottom: 'none'};
                },
            },
        },
        MuiPopover: {
            styleOverrides: {
                paper: ({theme}) => ({...glassStylesOf(theme), borderRadius: GLASS_MENU_RADIUS_PIXELS}),
            },
        },
        // los renglones de un menú: concéntricos con el menú, y el elegido (la opción actual de una lista) con su palomita
        // y no con un fondo de color (HIG «Menus»: «Consider using a checkmark to show that an attribute is currently in
        // effect»)
        MuiMenuItem: {
            styleOverrides: {
                root: ({theme}) => ({
                    marginInline: MENU_ROW_INSET_PIXELS,
                    borderRadius: GLASS_MENU_RADIUS_PIXELS - MENU_ROW_INSET_PIXELS,
                    '&.Mui-selected': {backgroundColor: 'transparent'},
                    '&.Mui-selected:hover': {backgroundColor: paletteOf(theme).action.hover},
                    // con el teclado encima, el renglón elegido sí se marca: si no, no se ve dónde está el foco
                    '&.Mui-selected.Mui-focusVisible, &.Mui-selected:focus-visible': {backgroundColor: paletteOf(theme).action.selected},
                    '&.Mui-selected::after': {
                        content: MENU_CHECKMARK_CONTENT,
                        marginInlineStart: 'auto',
                        paddingInlineStart: theme.spacing(2),
                        ...accentTextStylesOf(theme),
                        fontWeight: 600,
                    },
                }),
            },
        },
        // el «combo box» de Apple (HIG «Combo boxes»): el campo con un botoncito cuadrado del color principal y su ⌄ blanco
        // al final; abierto, el ⌄ no gira (en Apple se queda igual)
        MuiAutocomplete: {
            styleOverrides: {
                paper: ({theme}) => ({...glassStylesOf(theme), borderRadius: GLASS_MENU_RADIUS_PIXELS}),
                option: {marginInline: MENU_ROW_INSET_PIXELS, borderRadius: GLASS_MENU_RADIUS_PIXELS - MENU_ROW_INSET_PIXELS},
                popupIndicator: ({theme}) => ({
                        width: COMBO_BUTTON_PIXELS,
                        height: COMBO_BUTTON_PIXELS,
                        padding: 0,
                        borderRadius: COMBO_BUTTON_RADIUS_PIXELS,
                        backgroundImage: PROMINENT_SHEEN_IMAGE,
                        ...whiteLabelOf(theme, 'primary'),
                        '& svg': {display: 'none'},
                        '&::after': {content: '""', width: 14, height: 14, ...chevronMaskOf(CHEVRON_DOWN_MASK)},
                }),
                popupIndicatorOpen: {transform: 'none'},
                // el botón y la ⓧ con aire: el botón a 6 px de la orilla, con esquina concéntrica con la del campo (12 - 6), y la
                // ⓧ separada de él (iban pegados entre sí y a la orilla: «pegadísimo», lo reportaron)
                // OJO: MUI ya lo centra (top 50% + translate); restarle la mitad del botón lo subía 14 px fuera del campo
                endAdornment: {right: COMBO_INSET_PIXELS, display: 'flex', alignItems: 'center', gap: COMBO_GAP_PIXELS},
                clearIndicator: ({theme}) => ({padding: 4, marginRight: 0, color: paletteOf(theme).text.secondary, '& .MuiSvgIcon-root': {fontSize: '1.125rem'}}),
                inputRoot: {
                    '.MuiAutocomplete-hasPopupIcon &': {paddingRight: COMBO_INSET_PIXELS + COMBO_BUTTON_PIXELS + COMBO_GAP_PIXELS * 2},
                    '.MuiAutocomplete-hasPopupIcon.MuiAutocomplete-hasClearIcon &': {paddingRight: COMBO_INSET_PIXELS + COMBO_BUTTON_PIXELS + COMBO_GAP_PIXELS * 3 + COMBO_CLEAR_PIXELS},
                },
            },
        },
        // las listas para elegir (Select): el ⌃⌄ de los botones de Apple que abren una lista («pop-up buttons») en lugar del
        // triángulo de MUI; tampoco gira al abrir
        MuiSelect: {
            styleOverrides: {
                icon: {
                    width: 16,
                    height: 16,
                    top: 'calc(50% - 8px)',
                    '& path': {display: 'none'},
                    ...chevronMaskOf(UP_DOWN_CHEVRON_MASK),
                },
                iconOpen: {transform: 'none'},
            },
        },
        // el calendario de MUI X (/date-pickers) en escritorio; en el teléfono sale en un diálogo (MuiDialog)
        MuiPickerPopper: {
            styleOverrides: {
                paper: ({theme}) => ({...glassStylesOf(theme), borderRadius: GLASS_MENU_RADIUS_PIXELS}),
            },
        },
        // la tabla (MUI X Data Grid): el menú de cada columna y los paneles de filtros y columnas
        MuiDataGrid: {
            styleOverrides: {
                // con el contenido de material: la tabla va dentro de su tarjeta (ServerTable la pone en un Paper outlined)
                // y su fondo propio, sólido, tapaba el material. La columna pegada a la izquierda sigue sólida (ServerTable le
                // pone el papel) para que no se vea lo que pasa por debajo al deslizar de lado.
                // OJO: la tabla pone sus colores con una etiqueta <style> propia (clase MuiDataGridVariables-…) que va después
                // en la página; con la misma fuerza ganaba ella y la tabla seguía blanca. Con dos clases (&.MuiDataGrid-root)
                // gana esta.
                ...(surfaces && {
                    root: {'&.MuiDataGrid-root': {'--DataGrid-t-color-background-base': 'transparent', '--DataGrid-t-header-background-base': 'transparent'}},
                }),
                panelContent: ({theme}) => ({...glassStylesOf(theme), borderRadius: GLASS_MENU_RADIUS_PIXELS}),
                menu: ({theme}) => ({'& .MuiPaper-root': {...glassStylesOf(theme), borderRadius: GLASS_MENU_RADIUS_PIXELS}}),
            },
        },
        // los cajones: de vidrio; los que salen encima del contenido flotan separados de la orilla (Adopting Liquid Glass:
        // «half sheets are inset from the edge of the display to allow content to peek through from beneath them»)
        MuiDrawer: {
            styleOverrides: {
                paper: ({ownerState, theme}) => ({
                    ...glassStylesOf(theme),
                    ...(ownerState.variant === 'temporary' && floatingDrawerOf(ownerState.anchor ?? 'left')),
                }),
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: ({ownerState, theme}) => (ownerState.fullScreen ? {} : {...glassStylesOf(theme), borderRadius: GLASS_PANEL_RADIUS_PIXELS}),
                // la hoja de lectura (ContentDialog) deja la barra de arriba a la vista para no perder dónde se está: sin
                // desenfoque detrás, o la barra se volvía ilegible
                backdrop: ({ownerState}) => (ownerState.fullScreen
                    ? {'&:not(.MuiBackdrop-invisible)': {backdropFilter: 'none', WebkitBackdropFilter: 'none'}}
                    : {}),
            },
        },
        // detrás de un diálogo: menos oscuro y desenfocado (el vidrio del diálogo se lee mejor sobre algo ya borroso)
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    '&:not(.MuiBackdrop-invisible)': {
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                        ...solidFallbackOf({backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'none', WebkitBackdropFilter: 'none'}),
                    },
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: ({theme}) => ({...darkGlassOf(paletteOf(theme).Tooltip?.bg ?? paletteOf(theme).grey[700]), borderRadius: 8}),
                arrow: ({theme}) => ({color: darkGlassOf(paletteOf(theme).Tooltip?.bg ?? paletteOf(theme).grey[700]).backgroundColor}),
            },
        },
        MuiSnackbarContent: {
            styleOverrides: {
                root: ({theme}) => ({...darkGlassOf(paletteOf(theme).SnackbarContent?.bg ?? paletteOf(theme).grey[900]), borderRadius: GLASS_MENU_RADIUS_PIXELS}),
            },
        },
        MuiFab: {
            styleOverrides: {
                root: ({ownerState, theme}) => {
                    const surface = tintedGlassOf(theme, ownerState.color);
                    const fillOf = (scheme) => whiteLabelFillOf(theme.colorSchemes?.[scheme]?.palette?.[ownerState.color]?.main);
                    const lightFill = fillOf('light');
                    const darkFill = fillOf('dark');
                    return {
                        ...surface,
                        // de color: su vidrio lleva el color oscurecido lo justo para la letra blanca (whiteLabelFillOf)
                        ...lightDarkStylesOf(theme,
                            lightFill ? {...glassSurfaceOf(lightFill, {opacity: PROMINENT_GLASS_OPACITY}), color: WHITE_LABEL} : {},
                            darkFill ? {...glassSurfaceOf(darkFill, {opacity: PROMINENT_GLASS_OPACITY, isDark: true}), color: WHITE_LABEL} : {}),
                        transition: theme.transitions.create(['background-color', 'box-shadow', 'transform'], {duration: theme.transitions.duration.short}),
                        // MUI cambia el fondo y la sombra al pasar y al apretar: el vidrio se queda, y al apretar se hunde
                        '&:hover': {backgroundColor: surface.backgroundColor},
                        '&:active': {boxShadow: surface.boxShadow, transform: `scale(${PRESSED_SCALE})`},
                        [REDUCED_MOTION_QUERY]: {'&:active': {transform: 'none'}},
                    };
                },
            },
        },
        MuiBottomNavigation: {
            styleOverrides: {
                root: ({theme}) => ({...glassStylesOf(theme), borderRadius: PILL_RADIUS, padding: MENU_ROW_INSET_PIXELS, gap: MENU_ROW_INSET_PIXELS, height: 64}),
            },
        },
        MuiBottomNavigationAction: {
            styleOverrides: {
                root: ({theme}) => ({
                    borderRadius: PILL_RADIUS,
                    minWidth: 0,
                    // con mergeStyles: las dos partes traen su modo oscuro y la suma simple borraba la de la gota
                    '&.Mui-selected': mergeStyles(glassDropOf(theme), accentTextStylesOf(theme)),
                }),
            },
        },
        // los botones (HIG «Buttons»): cápsulas («prefer circular or capsule-shape buttons»), que se hunden al apretarlas
        // («Always include a press state»)
        MuiButton: {
            styleOverrides: {
                // con texto largo la etiqueta se parte en dos renglones: con el interlineado de MUI (1.75) y la esquina de cápsula
                // salía un óvalo grande con los renglones separados (lo reportaron). Interlineado 1.3, el MISMO alto de un renglón
                // que antes (minHeight) y la esquina de la mitad de ese alto: con un renglón es cápsula; con dos, rectángulo
                // redondeado, como los botones de Apple que no caben
                root: ({ownerState, theme}) => ({
                    lineHeight: BUTTON_LINE_HEIGHT,
                    minHeight: BUTTON_HEIGHT_PIXELS[ownerState.size ?? 'medium'] ?? BUTTON_HEIGHT_PIXELS.medium,
                    borderRadius: `${(BUTTON_HEIGHT_PIXELS[ownerState.size ?? 'medium'] ?? BUTTON_HEIGHT_PIXELS.medium) / 2}px`,
                    transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color', 'color', 'transform'], {
                        duration: theme.transitions.duration.short,
                    }),
                    ...pressedMotionOf(`scale(${PRESSED_SCALE})`),
                }),
                // el principal (contained) es el «prominente» de Apple: el color va en el fondo («To emphasize primary
                // actions, apply color to the background rather than to symbols or text», HIG «Color»), con el brillo del
                // vidrio para que se lea sobre cualquier cosa
                contained: ({ownerState, theme}) => ({
                    backgroundImage: PROMINENT_SHEEN_IMAGE,
                    boxShadow: PROMINENT_SHEEN_SHADOW,
                    '&:hover, &:active, &.Mui-focusVisible': {boxShadow: PROMINENT_SHEEN_SHADOW},
                    ...whiteLabelOf(theme, ownerState.color ?? 'primary'),
                    '&.Mui-disabled': {backgroundImage: 'none', boxShadow: 'none'},
                }),
                // el de solo texto («borderless» de Apple): la letra del color del tema, pero legible (accentTextStylesOf); el
                // naranja tal cual sobre una tarjeta clara daba 2.78 : 1
                text: ({ownerState, theme}) => (paletteOf(theme)[ownerState.color] ? accentTextStylesOf(theme, ownerState.color) : {}),
                // el de borde es el «botón de vidrio» de Apple: una cápsula de vidrio sin borde de color (el filo del vidrio
                // ya la dibuja; con los dos se veía un doble aro). Con el color de omisión (primary) la letra va de un solo
                // color: «Prefer the default monochromatic appearance of button labels» y no repetir en la letra el color
                // del fondo (HIG «Buttons»); con otro color a propósito (error, success…) la letra lo conserva. Al pasar el
                // cursor, un toque de color encima del vidrio, sin perder el vidrio
                // DENTRO de una tarjeta, un diálogo o un menú (cualquier Paper) ya no es vidrio: ahí no hay nada detrás que el
                // vidrio deje ver y se leía como «cápsula blanca con sombra» (lo dijo el autor). Apple: «Don't use Liquid Glass
                // in the content layer»; en el contenido usa el botón «bordered», un relleno tenue de su color. Los que van
                // dentro de un grupo los pinta el grupo (por eso el :not)
                outlined: ({ownerState, theme}) => {
                    const palette = paletteOf(theme);
                    const isDefaultColor = (ownerState.color ?? 'primary') === 'primary';
                    const toneColor = palette[ownerState.color]?.main ?? palette.text.primary;
                    const label = isDefaultColor || !palette[ownerState.color] ? {color: palette.text.primary} : accentTextStylesOf(theme, ownerState.color);
                    const glass = glassStylesOf(theme, {isControl: true});
                    const hoverTint = `color-mix(in srgb, ${isDefaultColor ? palette.text.primary : toneColor} 10%, transparent)`;
                    return {
                        // con mergeStyles: el vidrio y la letra traen su modo oscuro; la suma simple borraba el del vidrio
                        ...mergeStyles(glass, label),
                        borderColor: 'transparent',
                        '&:hover': {...glass, borderColor: 'transparent', backgroundImage: `linear-gradient(${hoverTint}, ${hoverTint})`},
                        '&.Mui-disabled': {borderColor: 'transparent'},
                        [insideContentSelectorOf(':not(.MuiButtonGroup-grouped)')]: tintedControlOf(theme, toneColor),
                    };
                },
            },
        },
        // el grupo de botones con borde: UNA cápsula de vidrio con los botones adentro, separados por una línea fina, como
        // los grupos de una barra de Apple que comparten fondo (HIG «Toolbars»: agrupar por función); adentro los botones
        // no llevan vidrio propio, porque vidrio sobre vidrio no se lee
        MuiButtonGroup: {
            styleOverrides: {
                root: ({ownerState, theme}) => {
                    // acostado es una cápsula; de pie, una tarjetita con esquinas de menú (una cápsula de pie se veía como óvalo)
                    const borderRadius = ownerState.orientation === 'vertical' ? GLASS_MENU_RADIUS_PIXELS : PILL_RADIUS;
                    if (ownerState.variant !== 'outlined') {
                        return {borderRadius};
                    }
                    // dentro de una tarjeta, la cápsula es un relleno tenue y no vidrio (lo mismo que el botón con borde)
                    const plain = {backgroundImage: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none', boxShadow: 'none'};
                    const groupFillOf = (percent) => `color-mix(in srgb, ${paletteOf(theme).text.primary} ${percent}%, transparent)`;
                    return {
                        ...glassStylesOf(theme, {isControl: true}),
                        borderRadius,
                        overflow: 'hidden',
                        [insideContentSelectorOf()]: {
                            ...plain,
                            ...lightDarkStylesOf(theme,
                                {backgroundColor: groupFillOf(TINTED_FILL_PERCENT.light.rest)}, {backgroundColor: groupFillOf(TINTED_FILL_PERCENT.dark.rest)}),
                        },
                    };
                },
                grouped: ({ownerState, theme}) => {
                    if (ownerState.variant !== 'outlined') {
                        return {};
                    }
                    const plain = {backgroundColor: 'transparent', backgroundImage: 'none', backdropFilter: 'none', WebkitBackdropFilter: 'none', boxShadow: 'none'};
                    const separator = `1px solid ${paletteOf(theme).divider}`;
                    return {
                        ...plain,
                        border: 0,
                        '&:hover': {...plain, backgroundColor: paletteOf(theme).action.hover},
                        // OJO: el lente del botón (con la marca de <body>) le ganaba a esta regla y el botón volvía a ser
                        // vidrio dentro de su grupo; con la marca también aquí, gana el grupo (medido en Chrome)
                        [`${GLASS_LENS_FLAG_SELECTOR} &`]: plain,
                        ...(ownerState.orientation === 'vertical'
                            ? {'&:not(:last-of-type)': {borderBottom: separator}}
                            : {'&:not(:last-of-type)': {borderRight: separator}}),
                    };
                },
            },
        },
        // las ligas: el color del tema, legible (accentTextStylesOf); la de color="inherit" se respeta
        MuiLink: {
            styleOverrides: {
                root: ({ownerState, theme}) => (paletteOf(theme)[ownerState.color] ? accentTextStylesOf(theme, ownerState.color) : {}),
            },
        },
        // las etiquetas que se pican (filtros rápidos, rango de fechas) son controles, y Apple los pinta como sus botones de
        // vidrio: la no elegida es una cápsula de vidrio sin borde de color (como el botón con borde) y la elegida va de su
        // color con el brillo del botón principal (el «prominente»). Las que solo informan (el estado en un renglón de la
        // tabla) son contenido y se quedan como están: «Don't use Liquid Glass in the content layer» (HIG «Materials»).
        // OJO: MUI marca el cursor encima y el foco con dos clases (&.MuiChip-clickable:hover); con una sola, ganaba su gris.
        // el avatar con iniciales es el «monograma» de Apple (el de Contactos): iniciales BLANCAS sobre un gris que las deja leer.
        // El de MUI ponía letras oscuras sobre gris en claro y claras sobre gris en oscuro, y casi no se leían (lo reportaron).
        // Un avatar con foto no cambia (la foto tapa el fondo)
        MuiAvatar: {
            styleOverrides: {
                colorDefault: ({theme}) => monogramOf(theme),
            },
        },
        MuiChip: {
            styleOverrides: {
                // el avatar dentro de una etiqueta («Con avatar»): el mismo monograma; MUI le ponía su gris de letra
                avatar: ({theme}) => monogramOf(theme),
                root: ({ownerState, theme}) => {
                    const isFilledWithColor = ownerState.variant !== 'outlined' && ownerState.color && ownerState.color !== 'default';
                    const darkLabel = isFilledWithColor ? whiteLabelOf(theme, ownerState.color) : {};
                    // la de borde con color («Administración» en Mi perfil): su letra del color pero legible; tal cual daba
                    // 2.78 : 1 sobre blanco (medido con la auditoría)
                    const hasColor = ownerState.color && ownerState.color !== 'default' && paletteOf(theme)[ownerState.color];
                    const outlinedText = ownerState.variant === 'outlined' && hasColor ? accentTextStylesOf(theme, ownerState.color) : {};
                    if (!ownerState.clickable) {
                        return {...darkLabel, ...outlinedText};
                    }
                    if (ownerState.variant === 'outlined') {
                        const glass = glassStylesOf(theme, {isControl: true});
                        const hoverTint = `color-mix(in srgb, ${paletteOf(theme).text.primary} 8%, transparent)`;
                        const hoverGlass = {...glass, borderColor: 'transparent', backgroundImage: `linear-gradient(${hoverTint}, ${hoverTint})`};
                        return {
                            ...glass,
                            borderColor: 'transparent',
                            '&.MuiChip-clickable:hover, &.Mui-focusVisible': hoverGlass,
                            // dentro de una tarjeta, un relleno tenue y no vidrio (como el botón con borde)
                            [insideContentSelectorOf()]: tintedControlOf(theme, paletteOf(theme).text.primary),
                        };
                    }
                    return {backgroundImage: PROMINENT_SHEEN_IMAGE, boxShadow: PROMINENT_SHEEN_SHADOW, ...darkLabel};
                },
            },
        },
        // el numerito (Badge) de color: en oscuro, letra blanca sobre su color oscurecido
        MuiBadge: {
            styleOverrides: {
                badge: ({ownerState, theme}) => (ownerState.color && ownerState.color !== 'default' ? whiteLabelOf(theme, ownerState.color) : {}),
            },
        },
        // los campos (HIG «Text fields» y las imágenes de la propia guía): la etiqueta va ARRIBA y fuera del campo, siempre a
        // la vista («include a separate label describing the field», porque la pista desaparece al escribir), en vez de la
        // que flota sobre el borde en MUI. Los de línea (variant="standard") se quedan como MUI los pinta
        MuiInputLabel: {
            defaultProps: {shrink: true},
            styleOverrides: {
                root: ({ownerState, theme}) => (ownerState.variant === 'standard' ? {} : {
                    position: 'relative',
                    transform: 'none',
                    maxWidth: '100%',
                    marginBottom: theme.spacing(0.75),
                    ...textSizeOf(SENTENCE_CASE_TITLE_PIXELS),
                    fontWeight: 600,
                    lineHeight: 1.4,
                    whiteSpace: 'normal',
                    pointerEvents: 'auto',
                    color: paletteOf(theme).text.secondary,
                }),
            },
        },
        // el campo con borde de MUI (el de omisión, el de los Select, los Autocomplete y los campos del framework): sobre el
        // lienzo es una lámina de vidrio con esquinas de 12 px (la imagen de «Text fields» de Apple) y el buscador, una cápsula
        // (el de la barra de iPad); dentro de una tarjeta, el relleno gris de los campos de Apple (fieldFillOf). Sin el borde de
        // MUI en ningún caso: lo marca el aro (fieldRingsOf). Dentro de una FormSection el campo es un renglón (FormSection.jsx)
        MuiOutlinedInput: {
            defaultProps: {notched: false},
            styleOverrides: {
                root: ({ownerState, theme}) => ({
                    ...canvasFieldStylesOf(theme),
                    borderRadius: ownerState.type === 'search' ? PILL_RADIUS : FIELD_RADIUS_PIXELS,
                    '& .MuiOutlinedInput-notchedOutline': {borderColor: 'transparent'},
                    '&:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-error .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'transparent',
                    },
                    ...fieldRingsOf(theme),
                    [insideContentSelectorOf()]: fieldFillOf(theme),
                }),
            },
        },
        // el campo relleno de MUI: el mismo relleno de Apple, sin la raya de abajo, con el texto centrado (MUI le dejaba
        // arriba el lugar de la etiqueta, que ahora va afuera)
        MuiFilledInput: {
            styleOverrides: {
                root: ({ownerState, theme}) => ({
                    ...fieldFillOf(theme),
                    '&::before, &::after': {display: 'none'},
                    ...(ownerState.multiline && {padding: '16.5px 14px'}),
                    ...fieldRingsOf(theme),
                }),
                input: ({ownerState}) => (ownerState.multiline ? {} : {
                    paddingTop: ownerState.size === 'small' ? 8.5 : 16.5,
                    paddingBottom: ownerState.size === 'small' ? 8.5 : 16.5,
                    paddingInline: 14,
                }),
            },
        },
        // el campo de fecha de MUI X (/date-pickers) tiene su propia pieza: lo mismo que el campo con borde
        MuiPickersOutlinedInput: {
            styleOverrides: {
                root: ({theme}) => ({
                    ...canvasFieldStylesOf(theme),
                    borderRadius: FIELD_RADIUS_PIXELS,
                    '& .MuiPickersOutlinedInput-notchedOutline': {borderColor: 'transparent'},
                    '&:hover .MuiPickersOutlinedInput-notchedOutline, &.Mui-focused .MuiPickersOutlinedInput-notchedOutline, &.Mui-error .MuiPickersOutlinedInput-notchedOutline': {
                        borderColor: 'transparent',
                    },
                    ...fieldRingsOf(theme),
                    [insideContentSelectorOf()]: fieldFillOf(theme),
                }),
            },
        },
        // los botones de opción: una tira apenas marcada y la opción elegida en su gota. Acostados y sin fullWidth, todas las
        // opciones miden lo mismo (la más ancha manda): «all segments are usually equal in width» (HIG «Segmented controls»)
        MuiToggleButtonGroup: {
            styleOverrides: {
                root: ({ownerState, theme}) => ({
                    backgroundColor: paletteOf(theme).action.hover,
                    borderRadius: PILL_RADIUS,
                    padding: 3,
                    gap: 2,
                    // la tira mide lo que sus opciones (dentro de una columna se estiraba a todo lo ancho), salvo fullWidth
                    ...(!ownerState.fullWidth && {width: 'fit-content', maxWidth: '100%'}),
                    ...(!ownerState.fullWidth && ownerState.orientation !== 'vertical' && {
                        display: 'inline-grid',
                        gridAutoFlow: 'column',
                        gridAutoColumns: '1fr',
                    }),
                    '& .MuiToggleButtonGroup-grouped': {border: 0, margin: 0, borderRadius: PILL_RADIUS},
                    '& .MuiToggleButtonGroup-grouped.Mui-selected, & .MuiToggleButtonGroup-grouped.Mui-selected:hover': glassDropOf(theme),
                }),
            },
        },
        // la casilla: la palomita BLANCA sobre el color oscurecido lo justo (whiteLabelFillOf), como las de Apple. La de MUI es
        // un hueco en el cuadro y en oscuro se veía la palomita negra (lo reportaron: «espantoso»); un cuadrito blanco detrás
        // del dibujo la vuelve blanca. Vale igual para la casilla «mixta»
        MuiCheckbox: {
            styleOverrides: {
                root: ({ownerState, theme}) => {
                    const colorName = ownerState.color ?? 'primary';
                    const fillOf = (scheme) => whiteLabelFillOf(theme.colorSchemes?.[scheme]?.palette?.[colorName]?.main);
                    const lightFill = fillOf('light');
                    const darkFill = fillOf('dark');
                    const whiteMark = {background: 'linear-gradient(#fff, #fff) center / 58% 58% no-repeat', borderRadius: 4};
                    return {
                        '&.Mui-checked .MuiSvgIcon-root, &.MuiCheckbox-indeterminate .MuiSvgIcon-root': whiteMark,
                        ...lightDarkStylesOf(theme,
                            lightFill ? {'&.Mui-checked, &.MuiCheckbox-indeterminate': {color: lightFill}} : {},
                            darkFill ? {'&.Mui-checked, &.MuiCheckbox-indeterminate': {color: darkFill}} : {}),
                    };
                },
            },
        },
        // el interruptor con su texto: el de iPhone no trae el margen que MUI usa para separar el texto, y salía pegado (lo
        // reportaron). 12 px entre los dos; con el texto antes (labelPlacement="start"), el texto a la izquierda y el
        // interruptor a la derecha del renglón, como en Ajustes
        MuiFormControlLabel: {
            styleOverrides: {
                root: {
                    '&:has(.MuiSwitch-root)': {gap: SWITCH_LABEL_GAP_PIXELS, marginLeft: 0},
                    '&:has(.MuiSwitch-root).MuiFormControlLabel-labelPlacementStart': {marginRight: 0, justifyContent: 'space-between'},
                },
            },
        },
        // el número de los pasos (Stepper): blanco sobre el círculo. El activo y los hechos, del color del tema oscurecido lo justo
        // para el blanco (whiteLabelFillOf); los que faltan, gris de Apple. En oscuro la paleta ponía el número negro sobre el
        // naranja y no se notaba el «1» (lo reportaron)
        MuiStepIcon: {
            styleOverrides: {
                root: ({theme}) => {
                    const fillOf = (scheme) => whiteLabelFillOf(theme.colorSchemes?.[scheme]?.palette?.primary?.main);
                    const lightFill = fillOf('light');
                    const darkFill = fillOf('dark');
                    return {
                        '& .MuiStepIcon-text': {fill: WHITE_LABEL},
                        ...lightDarkStylesOf(theme,
                            {color: STEP_PENDING_GRAY.light, ...(lightFill && {'&.Mui-active, &.Mui-completed': {color: lightFill}})},
                            {color: STEP_PENDING_GRAY.dark, ...(darkFill && {'&.Mui-active, &.Mui-completed': {color: darkFill}})}),
                    };
                },
            },
        },
        // el día del calendario de MUI X (como el de Apple): el elegido en un círculo tenue de su color con el número legible,
        // y hoy, con el número del color del tema (legible); nada de letra negra sobre el naranja
        MuiPickersDay: {
            styleOverrides: {
                root: ({theme}) => {
                    const palette = paletteOf(theme);
                    const selected = {
                        backgroundColor: `color-mix(in srgb, ${palette.primary.main} 22%, transparent)`,
                        ...accentTextStylesOf(theme),
                        fontWeight: 600,
                    };
                    return {
                        '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected:focus': selected,
                        '&.MuiPickersDay-today:not(.Mui-selected)': {border: 0, ...accentTextStylesOf(theme), fontWeight: 600},
                    };
                },
            },
        },
        // las pestañas: la misma tira, y la marca de abajo se vuelve la gota detrás de la pestaña elegida (se desliza sola)
        MuiTabs: {
            styleOverrides: {
                root: ({ownerState, theme}) => (ownerState.vertical ? {} : {
                    minHeight: 0,
                    padding: MENU_ROW_INSET_PIXELS,
                    borderRadius: PILL_RADIUS,
                    backgroundColor: paletteOf(theme).action.hover,
                    width: 'fit-content',
                    maxWidth: '100%',
                    '& .MuiTab-root': {minHeight: 36, paddingBlock: 6, paddingInline: 16, borderRadius: PILL_RADIUS, zIndex: 1},
                    '& .MuiTab-root.Mui-selected': {color: paletteOf(theme).text.primary},
                }),
                indicator: ({ownerState, theme}) => (ownerState.vertical ? {display: 'none'} : {...glassDropOf(theme), height: '100%', borderRadius: PILL_RADIUS, zIndex: 0}),
                // de pie son una lista para navegar, como el menú lateral: la elegida en su gota y no con la rayita de MUI
                // OJO: la gota iba pegada a la línea de la derecha y sin aire entre pestañas («todo pegado»): se separan
                vertical: ({theme}) => ({
                    paddingRight: theme.spacing(1),
                    '& .MuiTab-root': {
                        minHeight: 40, borderRadius: GLASS_MENU_RADIUS_PIXELS, alignItems: 'flex-start', marginBlock: 3, paddingInline: theme.spacing(2),
                    },
                    '& .MuiTab-root.Mui-focusVisible': {outlineOffset: 2},
                    '& .MuiTab-root.Mui-selected': {...glassDropOf(theme), color: paletteOf(theme).text.primary},
                }),
            },
        },
        // los pasos con puntos del teléfono: en su lugar, sin fondo propio (sobre una tarjeta se veía un rectángulo); pegados
        // abajo o arriba de la pantalla, flotan de vidrio
        MuiMobileStepper: {
            styleOverrides: {
                root: ({ownerState, theme}) => (ownerState.position === 'static' ? {background: 'transparent'} : glassStylesOf(theme)),
            },
        },
        // un renglón elegido de una lista (la carpeta abierta): en su gota, como el menú lateral (HIG «Sidebars»)
        MuiListItemButton: {
            styleOverrides: {
                root: ({theme}) => ({
                    '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': mergeStyles(glassDropOf(theme), accentTextStylesOf(theme)),
                }),
            },
        },
        // la paginación: la página actual en su gota, como lo elegido en los demás controles
        MuiPaginationItem: {
            styleOverrides: {
                root: ({theme}) => ({
                    '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': {
                        ...glassDropOf(theme),
                        borderColor: 'transparent',
                        color: paletteOf(theme).text.primary,
                    },
                }),
            },
        },
        // el interruptor: la perilla con brillo, que crece al apretarla (HIG «Materials»: los controles como el interruptor
        // «take on a Liquid Glass appearance… when a person activates it»)
        // Y tiene la forma del de iPhone: una cápsula con la perilla blanca ADENTRO (el de MUI pone la perilla encima de una
        // pista delgada); prendido, la pista es del color del interruptor; apagado, el gris de relleno de Apple
        MuiSwitch: {
            styleOverrides: {
                // OJO: las medidas van aquí, colgadas de la raíz: MUI pone las del interruptor chico con un selector así de
                // fuerte (.raíz .MuiSwitch-switchBase.Mui-checked) y, puestas en cada pieza, ganaba la suya (la perilla se
                // salía de la pista)
                root: ({ownerState}) => {
                    const size = SWITCH_SIZES[ownerState.size] ?? SWITCH_SIZES.medium;
                    return {
                        width: size.width,
                        height: size.height,
                        padding: 0,
                        overflow: 'visible',
                        '& .MuiSwitch-switchBase': {padding: 0, margin: SWITCH_THUMB_MARGIN_PIXELS},
                        '& .MuiSwitch-switchBase.Mui-checked': {transform: `translateX(${size.width - size.thumb - SWITCH_THUMB_MARGIN_PIXELS * 2}px)`},
                        '& .MuiSwitch-thumb': {width: size.thumb, height: size.thumb},
                        '& .MuiSwitch-track': {borderRadius: size.height / 2},
                    };
                },
                switchBase: ({ownerState, theme}) => {
                    const palette = paletteOf(theme);
                    const onColor = (palette[ownerState.color] ?? palette.primary).main;
                    return {
                        color: palette.common.white,
                        '&.Mui-checked': {
                            color: palette.common.white,
                            '& + .MuiSwitch-track': {backgroundColor: onColor, opacity: 1},
                        },
                        '&.Mui-disabled + .MuiSwitch-track, &.Mui-checked.Mui-disabled + .MuiSwitch-track': {opacity: 0.4},
                        '&.Mui-disabled .MuiSwitch-thumb': {opacity: 0.8},
                        // con el teclado, un aro alrededor de la perilla
                        '&.Mui-focusVisible .MuiSwitch-thumb': {outline: `2px solid ${onColor}`, outlineOffset: 2},
                        '&:hover': {backgroundColor: 'transparent'},
                        '&:active .MuiSwitch-thumb': {transform: `scale(${PRESSED_THUMB_SCALE})`},
                        [REDUCED_MOTION_QUERY]: {'&:active .MuiSwitch-thumb': {transform: 'none'}},
                    };
                },
                thumb: ({theme}) => ({
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 3px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.12)',
                    transition: theme.transitions.create(['transform'], {duration: theme.transitions.duration.shortest}),
                }),
                track: ({theme}) => ({
                    opacity: 1,
                    transition: theme.transitions.create(['background-color'], {duration: theme.transitions.duration.short}),
                    ...lightDarkStylesOf(theme, {backgroundColor: SWITCH_OFF_TRACK.light}, {backgroundColor: SWITCH_OFF_TRACK.dark}),
                }),
            },
        },
        // el deslizador: la perilla clara (como la de Apple) que, al arrastrarla, crece y se vuelve una lupa de vidrio
        MuiSlider: {
            styleOverrides: {
                thumb: ({ownerState, theme}) => {
                    const palette = paletteOf(theme);
                    const centered = ownerState.orientation === 'vertical' ? 'translate(-50%, 50%)' : 'translate(-50%, -50%)';
                    const pressedGlass = {
                        backgroundColor: `color-mix(in srgb, ${palette.background.paper} 45%, transparent)`,
                        backdropFilter: 'blur(2px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(2px) saturate(180%)',
                        ...solidFallbackOf({backgroundColor: palette.background.paper, backdropFilter: 'none', WebkitBackdropFilter: 'none'}),
                    };
                    const isVertical = ownerState.orientation === 'vertical';
                    return {
                        width: isVertical ? SLIDER_THUMB.short : SLIDER_THUMB.long,
                        height: isVertical ? SLIDER_THUMB.long : SLIDER_THUMB.short,
                        borderRadius: PILL_RADIUS,
                        backgroundColor: palette.common.white,
                        border: 0,
                        boxShadow: SLIDER_THUMB.shadow,
                        // MUI pone un halo del color al pasar el cursor; en Apple la perilla solo se ve, sin halo
                        '&:hover, &.Mui-focusVisible': {boxShadow: SLIDER_THUMB.shadow},
                        '&.Mui-focusVisible': {outline: `2px solid ${palette.primary.main}`, outlineOffset: 2},
                        transition: theme.transitions.create(['box-shadow', 'left', 'bottom', 'transform', 'background-color'], {
                            duration: theme.transitions.duration.shortest,
                        }),
                        '&.Mui-active': {transform: `${centered} scale(${PRESSED_THUMB_SCALE})`, ...pressedGlass},
                        [REDUCED_MOTION_QUERY]: {'&.Mui-active': {transform: centered}},
                    };
                },
                rail: ({theme}) => ({
                    opacity: 1,
                    ...lightDarkStylesOf(theme, {backgroundColor: SLIDER_RAIL.light}, {backgroundColor: SLIDER_RAIL.dark}),
                }),
                root: ({ownerState}) => (ownerState.orientation === 'vertical' ? {width: SLIDER_TRACK_PIXELS} : {height: SLIDER_TRACK_PIXELS}),
            },
        },
        // lo que espera (HIG «Progress indicators»): el «cargando» sin cuánto falta es la ruedita de iPhone, rayitas que giran
        // a saltos con la cola desvanecida (no el anillo de MUI): se dibuja con una máscara y gira con la misma animación de
        // MUI, solo que en 8 saltos. El que sí dice cuánto falta conserva el anillo, con su pista de fondo y la punta redonda.
        // Cambian solos todos los «cargando» del framework: el de los botones, la pantalla de espera y las tablas.
        // La ruedita sigue girando aunque la persona pida menos movimiento: Apple pide «Keep progress indicators moving».
        MuiCircularProgress: {
            defaultProps: {enableTrackSlot: true},
            styleOverrides: {
                root: ({ownerState}) => (ownerState.variant === 'determinate' ? {} : {
                    backgroundColor: 'currentColor',
                    maskImage: ACTIVITY_SPOKES_MASK,
                    WebkitMaskImage: ACTIVITY_SPOKES_MASK,
                    maskSize: '100% 100%',
                    WebkitMaskSize: '100% 100%',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    animationDuration: ACTIVITY_SPIN_DURATION,
                    animationTimingFunction: `steps(${ACTIVITY_SPOKE_COUNT})`,
                    '& .MuiCircularProgress-svg': {visibility: 'hidden'},
                }),
                circle: ({ownerState}) => (ownerState.variant === 'determinate' ? {strokeLinecap: 'round'} : {}),
            },
        },
        // la barra de progreso: la cápsula delgada de Apple, con la pista gris neutra y la parte llena de punta redonda
        MuiLinearProgress: {
            styleOverrides: {
                root: ({theme}) => ({height: PROGRESS_BAR_HEIGHT_PIXELS, borderRadius: PILL_RADIUS, backgroundColor: paletteOf(theme).action.hover}),
                bar: {borderRadius: PILL_RADIUS},
            },
        },
    };
}
