// La insignia: un ícono y un texto corto con el color de lo que significan («Envío asegurado», «Pago con tarjeta», «Requiere
// factura»). Para destacar una característica de un registro en su encabezado o en su tarjeta; no es un botón.
//
// Tres estilos (variant):
//   outlined   borde de su color y fondo tenue (por omisión): resalta en una tarjeta
//   soft       solo el fondo tenue, sin borde: varias juntas sin ruido
//   plain      sin caja, el ícono y el texto de su color: dentro de un renglón de texto
// El texto va en su color oscurecido en claro y aclarado en oscuro, lo justo para leerse (accentTextStylesOf, la regla del
// tema; con el tono «dark» de la paleta, el azul sin caja daba 4.28 : 1 sobre una tarjeta, medido).
//
// Desde un diccionario (la regla de la casa: etiqueta, tooltip, color e ícono salen de ahí): dictionary + value; la entrada
// trae su ícono con dictionaryEntryOf(…, {icon}). O suelta: icon, label y tone.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaIconBadge con defaultProps y
// styleOverrides de sus partes: root, icon, label.
//
// Genérico del paquete: function (regla de la casa).
import Tooltip from '@mui/material/Tooltip';
import {styled, useThemeProps} from '@mui/material/styles';

import {labelOf, lookup} from '@/dictionaries/dictionaries.js';
import {paletteOf} from '@/theme/components/paletteOf.js';
import {accentTextStylesOf} from '@/theme/glassSurface.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/** Los estilos de la insignia. */
export const ICON_BADGE_VARIANT = Object.freeze({outlined: 'outlined', soft: 'soft', plain: 'plain'});

// los colores de la paleta que se pueden usar; otro (o «default») se pinta neutro, en gris
const PALETTE_TONES = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
// cuánto del color lleva el fondo tenue
const SOFT_FILL_PERCENT = 10;
const SIZES = Object.freeze({
    small: {fontSize: 12, iconSize: 16, paddingBlock: 2, paddingInline: 8, gap: 4},
    medium: {fontSize: 14, iconSize: 20, paddingBlock: 5, paddingInline: 10, gap: 6},
});

// el nombre de la pieza en el tema (theme.components.CalcitaIconBadge) y sus clases fijas, para el CSS de un proyecto o una
// prueba (como las de MUI: el nombre que pone styled no sale en la versión construida)
const THEME_NAME = 'CalcitaIconBadge';
export const ICON_BADGE_CLASSES = Object.freeze({root: `${THEME_NAME}-root`, icon: `${THEME_NAME}-icon`, label: `${THEME_NAME}-label`});

const IconBadgeRoot = styled('span', {name: THEME_NAME, slot: 'Root'})(({theme, ownerState}) => {
    const palette = paletteOf(theme);
    const tone = PALETTE_TONES.includes(ownerState.tone) ? palette[ownerState.tone] : null;
    const size = SIZES[ownerState.size] ?? SIZES.small;
    const isBoxed = ownerState.variant !== ICON_BADGE_VARIANT.plain;
    // el texto y el borde: su color oscurecido en claro y aclarado en oscuro (borderColor: currentColor toma el mismo)
    const textColors = tone
        ? {...accentTextStylesOf(theme, ownerState.tone), borderColor: 'currentColor'}
        : {color: palette.text.secondary, borderColor: palette.divider};
    return {
        display: 'inline-flex', alignItems: 'center', gap: size.gap, maxWidth: '100%', verticalAlign: 'middle',
        fontSize: size.fontSize, fontWeight: 600, lineHeight: 1.4, whiteSpace: 'nowrap',
        ...textColors,
        ...(isBoxed && {
            paddingBlock: size.paddingBlock, paddingInline: size.paddingInline, borderRadius: theme.shape.borderRadius,
            backgroundColor: `color-mix(in srgb, ${tone?.main ?? palette.text.secondary} ${SOFT_FILL_PERCENT}%, transparent)`,
            borderWidth: ownerState.variant === ICON_BADGE_VARIANT.outlined ? 1.5 : 0, borderStyle: 'solid',
        }),
    };
});
const IconBadgeIcon = styled('span', {name: THEME_NAME, slot: 'Icon'})(({ownerState}) => {
    const size = SIZES[ownerState.size] ?? SIZES.small;
    return {display: 'inline-flex', flexShrink: 0, '& svg': {fontSize: size.iconSize}};
});
// el texto en su propio span: un nodo de texto suelto dentro de un flex se corta sin «…»
const IconBadgeLabel = styled('span', {name: THEME_NAME, slot: 'Label'})({minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'});

/**
 * @param {object} props
 * @param {Record<string, object>} [props.dictionary] de donde sale la etiqueta, el tooltip, el color y el ícono
 * @param {string|null} [props.value] con dictionary: el código del API
 * @param {import('react').ElementType} [props.icon] suelta: el ícono (un componente, p. ej. VerifiedUserOutlinedIcon)
 * @param {import('react').ReactNode} [props.label] suelta: el texto, ya traducido
 * @param {'primary'|'secondary'|'success'|'warning'|'error'|'info'|'default'} [props.tone] suelta: el color
 * @param {'outlined'|'soft'|'plain'} [props.variant] ICON_BADGE_VARIANT
 * @param {'small'|'medium'} [props.size]
 * @param {import('react').ReactNode} [props.tooltip] lo que explica al pasar el cursor (con dictionary, el del diccionario)
 * @param {object} [props.sx]
 */
export default function IconBadge(props) {
    const {
        dictionary, value, icon, label, tone = 'primary', variant = ICON_BADGE_VARIANT.outlined, size = 'small', tooltip, sx,
        ...unknownProps
    } = useThemeProps({props, name: THEME_NAME});
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('dictionaries');
    const entry = dictionary ? lookup(dictionary, value) : null;
    const Icon = entry?.icon ?? icon;
    const text = entry ? labelOf(entry, t) : label;
    const explanation = tooltip ?? (entry ? t(entry.tooltipKey, {defaultValue: ''}) : null);
    const ownerState = {tone: entry?.color ?? tone, variant, size};

    const badge = (
        <IconBadgeRoot ownerState={ownerState} className={ICON_BADGE_CLASSES.root} sx={sx}>
            {Icon && <IconBadgeIcon ownerState={ownerState} className={ICON_BADGE_CLASSES.icon} aria-hidden="true"><Icon /></IconBadgeIcon>}
            <IconBadgeLabel ownerState={ownerState} className={ICON_BADGE_CLASSES.label}>{text}</IconBadgeLabel>
        </IconBadgeRoot>
    );
    // sin explicación no se envuelve (un Tooltip vacío igual agrega listeners)
    return explanation ? <Tooltip title={explanation}>{badge}</Tooltip> : badge;
}
