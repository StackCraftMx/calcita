// Estatus pintado desde un diccionario (dictionaries/dictionaries.js): etiqueta, tooltip y color salen del diccionario,
// nunca del componente que lo usa. Un valor que no está en el diccionario se pinta con su código crudo.
//
// Dos formas:
//   - variant="dot" (por defecto): punto de color + texto, sin fondo. Para la columna de estado de una tabla.
//   - variant="chip": Chip de MUI con contorno, para formatos, hallazgos o encabezados.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaStatusChip con defaultProps (p. ej.
// {variant: 'chip'}) y styleOverrides de sus partes: root (el renglón del punto y el texto), dot, label y chip.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import {styled, useThemeProps} from '@mui/material/styles';

import {labelOf, lookup, shortLabelOf} from '@/dictionaries/dictionaries.js';
import {paletteOf} from '@/theme/components/paletteOf.js';
import {lightDarkStylesOf} from '@/theme/lightDarkStyles.js';

// el nombre de la pieza en el tema (theme.components.CalcitaStatusChip)
const THEME_NAME = 'CalcitaStatusChip';
// los colores que trae la paleta; otro (o «default») se pinta neutro
const PALETTE_TONES = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];

/** El color del diccionario si la paleta lo tiene; si no, null (neutro). */
function paletteToneOf(theme, tone) {
    return PALETTE_TONES.includes(tone) && paletteOf(theme)[tone] ? paletteOf(theme)[tone] : null;
}

// el punto y el texto. El texto va en el tono oscuro de su color en claro y en el claro en oscuro: con el oscuro también en
// modo oscuro casi no se leía (el «Suspendido» rojo sobre la tabla oscura, lo vio el usuario). Con lightDarkStylesOf para
// que el tema del proyecto (styleOverrides.root) le gane también en oscuro
const StatusChipRoot = styled('span', {name: THEME_NAME, slot: 'Root'})(({theme, ownerState}) => {
    const color = paletteToneOf(theme, ownerState.tone);
    return {
        display: 'inline-flex', alignItems: 'center', gap: theme.spacing(0.75),
        fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
        ...(color
            ? lightDarkStylesOf(theme, {color: color.dark}, {color: color.light})
            : {color: paletteOf(theme).text.secondary}),
    };
});

// OJO: flexShrink 0; en una celda angosta el punto se encogía a 0 px y el estado perdía su color
const StatusChipDot = styled('span', {name: THEME_NAME, slot: 'Dot'})(({theme, ownerState}) => ({
    width: 6, height: 6, flexShrink: 0, borderRadius: '50%',
    backgroundColor: paletteToneOf(theme, ownerState.tone)?.main ?? paletteOf(theme).text.disabled,
}));

// el texto en su propio span: un nodo de texto suelto dentro de un flex se corta sin «…»
const StatusChipLabel = styled('span', {name: THEME_NAME, slot: 'Label'})({minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'});

const StatusChipChip = styled(Chip, {name: THEME_NAME, slot: 'Chip'})({});

/**
 * @param {object} props
 * @param {Record<string, object>} props.dictionary p. ej. BATCH_STATUS
 * @param {string|null|undefined} props.value código del API
 * @param {'dot'|'chip'} [props.variant]
 * @param {boolean} [props.short] pinta la palabra corta de la entrada (shortLabelKey), para una columna angosta; el
 *     nombre completo queda en el tooltip, antes de su explicación
 * @param {string} [props.suffix] texto que va después de la etiqueta con " · " (p. ej. un conteo ya formateado)
 * @param {import('react').ReactNode} [props.tooltip] SUSTITUYE al tooltip del diccionario; úsalo cuando el renglón tiene algo más
 *     que decir. OJO: no envuelvas este componente en otro Tooltip, porque el suyo sigue ahí y se ven los dos encimados
 * @param {object} [props.sx] ajustes de estilo del Chip (solo variant="chip")
 */
export default function StatusChip(props) {
    // lo que el proyecto puso en su tema (components.CalcitaStatusChip.defaultProps) y encima lo que llega aquí
    const {dictionary, value, variant = 'dot', short = false, suffix, tooltip: customTooltip, sx} = useThemeProps({props, name: THEME_NAME});
    const {t} = useToolkitTranslation('dictionaries');
    const dictionaryEntry = lookup(dictionary, value);
    const fullLabel = labelOf(dictionaryEntry, t);
    const entryLabel = short ? shortLabelOf(dictionaryEntry, t) : fullLabel;
    const label = suffix ? `${entryLabel} · ${suffix}` : entryLabel;
    // el de quien lo usa gana: si pasa uno, el del diccionario no se pinta y no hay dos globos
    const explanation = customTooltip ?? t(dictionaryEntry.tooltipKey, {defaultValue: ''});
    // la palabra corta deja fuera parte del nombre: el tooltip lo dice completo y, debajo, su explicación
    const tooltip = entryLabel === fullLabel ? explanation : (
        <Box component="span" sx={{display: 'flex', flexDirection: 'column', gap: 0.25}}>
            <Box component="span" sx={{fontWeight: 700}}>{fullLabel}</Box>
            {explanation && <Box component="span">{explanation}</Box>}
        </Box>
    );

    const ownerState = {tone: dictionaryEntry.color, variant};
    const content = variant === 'chip' ? (
        <StatusChipChip size="small" label={label} color={dictionaryEntry.color} variant="outlined" sx={sx} />
    ) : (
        <StatusChipRoot ownerState={ownerState}>
            <StatusChipDot aria-hidden="true" ownerState={ownerState} />
            <StatusChipLabel ownerState={ownerState}>{label}</StatusChipLabel>
        </StatusChipRoot>
    );

    // guard clause: sin tooltip no envolvemos (un Tooltip vacío igual agrega listeners)
    if (!tooltip) {
        return content;
    }
    return <Tooltip title={tooltip}>{content}</Tooltip>;
}
