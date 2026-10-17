// Estatus pintado desde un diccionario (dictionaries/dictionaries.js): etiqueta, tooltip y color salen del diccionario,
// nunca del componente que lo usa. Un valor que no está en el diccionario se pinta con su código crudo.
//
// Dos formas:
//   - variant="dot" (por defecto): punto de color + texto, sin fondo. Para la columna de estado de una tabla.
//   - variant="chip": Chip de MUI con contorno, para formatos, hallazgos o encabezados.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';

import {labelOf, lookup, shortLabelOf} from '@/dictionaries/dictionaries.js';

// color del diccionario → color de texto del punto (default no existe en la paleta)
const DOT_COLOR_BY_TONE = {
    success: 'success.main',
    warning: 'warning.main',
    error: 'error.main',
    info: 'info.main',
    default: 'text.disabled',
};

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
export default function StatusChip({dictionary, value, variant = 'dot', short = false, suffix, tooltip: customTooltip, sx}) {
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

    const content = variant === 'chip' ? (
        <Chip size="small" label={label} color={dictionaryEntry.color} variant="outlined" sx={sx} />
    ) : (
        <Box component="span" sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.75,
            fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
            color: dictionaryEntry.color === 'default' ? 'text.secondary' : `${dictionaryEntry.color}.dark`,
        }}>
            {/* OJO: flexShrink 0; en una celda angosta el punto se encogía a 0 px y el estado perdía su color */}
            <Box component="span" aria-hidden="true" sx={{
                width: 6, height: 6, flexShrink: 0, borderRadius: '50%',
                bgcolor: DOT_COLOR_BY_TONE[dictionaryEntry.color] ?? DOT_COLOR_BY_TONE.default,
            }} />
            {/* el texto en su propio span: un nodo de texto suelto dentro de un flex se corta sin «…» */}
            <Box component="span" sx={{minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis'}}>{label}</Box>
        </Box>
    );

    // guard clause: sin tooltip no envolvemos (un Tooltip vacío igual agrega listeners)
    if (!tooltip) {
        return content;
    }
    return <Tooltip title={tooltip}>{content}</Tooltip>;
}
