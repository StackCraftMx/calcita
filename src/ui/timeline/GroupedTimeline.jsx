// Línea de tiempo por grupos (Timeline de @mui/lab al estilo del ejemplo «Customization» de MUI): cada grupo con su
// título y una insignia opcional, y cada evento con su ícono dentro del punto, su título, su hora y un detalle libre.
//
// Uso típico: el historial de un registro agrupado por etapa o por intento (detalle de un pedido: un grupo por intento de entrega,
// el vigente resaltado). El énfasis de cada grupo (TIMELINE_EMPHASIS) decide cómo se pintan sus puntos (timelineDot.js).
//
// En pantalla ancha los eventos alternan de lado y la hora va del otro lado del punto; en celular todo va de un lado, con
// la hora abajo del título, para que quepa.
//
// Un grupo plegable (isCollapsible) enseña solo su título y su resumen hasta que se abre: sirve para que lo viejo no
// obligue a bajar (los intentos anteriores van plegados).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaGroupedTimeline con defaultProps y
// styleOverrides de sus partes: group, groupHeader, groupButton, groupTitle, expandIcon, timeline, opposite, connector,
// content, entryTitle.
//
// Genérico del paquete: function (regla de la casa). No sabe de negocio: títulos, horas y detalles llegan ya traducidos y
// formateados, y el ícono y el tono de cada evento los decide quien la usa (con sus diccionarios).
import {useState} from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem, {timelineItemClasses} from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {paletteOf} from '@/theme/components/paletteOf.js';
import {TIMELINE_EMPHASIS, timelineDotOf} from '@/ui/timeline/timelineDot.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaGroupedTimeline)
const THEME_NAME = 'CalcitaGroupedTimeline';
const TimelineGroup = piecePart(THEME_NAME, 'Group', Box);
const TimelineGroupHeader = piecePart(THEME_NAME, 'GroupHeader', Stack);
const TimelineGroupButton = piecePart(THEME_NAME, 'GroupButton', ButtonBase);
const TimelineGroupTitle = piecePart(THEME_NAME, 'GroupTitle', Typography);
const TimelineExpandIcon = piecePart(THEME_NAME, 'ExpandIcon', ExpandMoreIcon);
const TimelineTimeline = piecePart(THEME_NAME, 'Timeline', Timeline);
const TimelineOpposite = piecePart(THEME_NAME, 'Opposite', TimelineOppositeContent);
const TimelineConnectorPart = piecePart(THEME_NAME, 'Connector', TimelineConnector);
const TimelineContentPart = piecePart(THEME_NAME, 'Content', TimelineContent);
const TimelineEntryTitle = piecePart(THEME_NAME, 'EntryTitle', Typography);

// el fondo del grupo resaltado: cuánto del color principal (por ciento)
const HIGHLIGHT_TINT_PERCENT = 8;
// en celular la línea va pegada a la izquierda: sin la columna de enfrente que @mui/lab reserva por omisión
const LEFT_ALIGNED_TIMELINE = {m: 0, px: 0, py: 0.5, [`& .${timelineItemClasses.root}::before`]: {flex: 0, p: 0}};
const ALTERNATE_TIMELINE = {m: 0, px: 0, py: 0.5};

/**
 * @param {object} props
 * @param {Object[]} props.groups
 * @param {string} props.groups[].key
 * @param {string} [props.groups[].title] texto ya traducido; sin título el grupo no pinta encabezado
 * @param {string} [props.groups[].badge] insignia junto al título (p. ej. «Intento actual»)
 * @param {string} [props.groups[].summary] lo que se lee junto al título del grupo plegado (p. ej. «6 eventos»)
 * @param {boolean} [props.groups[].isCollapsible] el título se vuelve un botón que abre y cierra el grupo (necesita
 *     title)
 * @param {boolean} [props.groups[].defaultExpanded] si un grupo plegable arranca abierto (por omisión, sí)
 * @param {'highlighted'|'normal'|'muted'} [props.groups[].emphasis]
 * @param {Object[]} props.groups[].items
 * @param {string} props.groups[].items[].key
 * @param {import('react').ElementType} [props.groups[].items[].icon] ícono dentro del punto
 * @param {string} [props.groups[].items[].tone] success, warning, error, info, primary o grey
 * @param {import('react').ReactNode} props.groups[].items[].title
 * @param {string} [props.groups[].items[].timestamp] fecha y hora ya formateadas
 * @param {import('react').ReactNode} [props.groups[].items[].details] lo que va abajo del título (chip de resultado, una liga...)
 * @param {(groupKey: string, isExpanded: boolean) => void} [props.onGroupToggle] la persona abrió o plegó un grupo (por ejemplo,
 *     para pedir sus eventos hasta que se abre)
 */
export default function GroupedTimeline(props) {
    // lo que el proyecto puso en su tema (components.CalcitaGroupedTimeline.defaultProps) y encima lo que llega aquí
    const {groups, onGroupToggle} = usePieceProps(props, THEME_NAME);
    const theme = useTheme();
    const isWide = useMediaQuery(theme.breakpoints.up('md'));
    // llaves de los grupos plegables que el usuario tiene abiertos; arrancan como dice defaultExpanded
    const [expandedKeys, setExpandedKeys] = useState(() => new Set(
        groups.filter((timelineGroup) => timelineGroup.defaultExpanded !== false).map((timelineGroup) => timelineGroup.key),
    ));
    const toggleGroup = (groupKey) => {
        const isOpening = !expandedKeys.has(groupKey);
        const nextKeys = new Set(expandedKeys);
        if (isOpening) {
            nextKeys.add(groupKey);
        } else {
            nextKeys.delete(groupKey);
        }
        setExpandedKeys(nextKeys);
        onGroupToggle?.(groupKey, isOpening);
    };

    return (
        <Stack spacing={1.5}>
            {groups.map((timelineGroup) => {
                const emphasis = timelineGroup.emphasis ?? TIMELINE_EMPHASIS.normal;
                const isHighlighted = emphasis === TIMELINE_EMPHASIS.highlighted;
                const isMuted = emphasis === TIMELINE_EMPHASIS.muted;
                const isCollapsible = Boolean(timelineGroup.isCollapsible && timelineGroup.title);
                const isExpanded = !isCollapsible || expandedKeys.has(timelineGroup.key);

                return (
                    // el borde transparente en los demás grupos mantiene todo alineado con el grupo resaltado
                    <TimelineGroup key={timelineGroup.key} ownSx={{
                        border: 1, borderRadius: 1.5, px: 1.5, pt: 1.25, pb: isExpanded ? 0 : 1.25,
                        borderColor: isHighlighted ? 'primary.main' : 'transparent',
                        // un tinte del color principal: primary.lighter no existe en el tema de MUI y el grupo se quedaba sin fondo
                        bgcolor: (theme) => (isHighlighted ? `color-mix(in srgb, ${paletteOf(theme).primary.main} ${HIGHLIGHT_TINT_PERCENT}%, transparent)` : 'transparent'),
                    }}>
                        {timelineGroup.title && (
                            <TimelineGroupHeader direction="row" spacing={1} ownSx={{alignItems: 'center', justifyContent: isWide ? 'center' : 'flex-start'}}>
                                <TimelineGroupButton disabled={!isCollapsible} onClick={() => toggleGroup(timelineGroup.key)}
                                            aria-expanded={isCollapsible ? isExpanded : undefined}
                                            ownSx={{gap: 1, px: 1, py: 0.25, borderRadius: 1, '&.Mui-disabled': {pointerEvents: 'none'}}}>
                                    <TimelineGroupTitle variant="h6" component="h3" ownSx={{fontWeight: 700, color: isMuted ? 'text.secondary' : 'text.primary'}}>
                                        {timelineGroup.title}
                                    </TimelineGroupTitle>
                                    {/* plegado, el grupo dice cuántos eventos trae: se sabe qué hay sin abrirlo */}
                                    {isCollapsible && timelineGroup.summary && (
                                        <Typography variant="body2" color="text.secondary" component="span">{timelineGroup.summary}</Typography>
                                    )}
                                    {isCollapsible && (
                                        <TimelineExpandIcon fontSize="small" ownSx={{
                                            color: 'text.secondary', transition: theme.transitions.create('transform'),
                                            transform: isExpanded ? 'rotate(180deg)' : 'none',
                                        }} />
                                    )}
                                </TimelineGroupButton>
                                {timelineGroup.badge && <Chip size="small" color="primary" label={timelineGroup.badge} />}
                            </TimelineGroupHeader>
                        )}
                        <Collapse in={isExpanded} unmountOnExit>
                            <TimelineTimeline position={isWide ? 'alternate' : 'right'} ownSx={isWide ? ALTERNATE_TIMELINE : LEFT_ALIGNED_TIMELINE}>
                                {timelineGroup.items.map((timelineEntry, entryPosition) => {
                                    const EntryIcon = timelineEntry.icon;
                                    const isFirstEntry = entryPosition === 0;
                                    const isLastEntry = entryPosition === timelineGroup.items.length - 1;

                                    return (
                                        <TimelineItem key={timelineEntry.key}>
                                            {isWide && (
                                                <TimelineOpposite variant="body2" color="text.secondary" ownSx={{m: 'auto 0'}}>
                                                    {timelineEntry.timestamp}
                                                </TimelineOpposite>
                                            )}
                                            <TimelineSeparator>
                                                <TimelineConnectorPart ownSx={{visibility: isFirstEntry ? 'hidden' : 'visible'}} />
                                                <TimelineDot {...timelineDotOf({emphasis, tone: timelineEntry.tone})}>
                                                    {EntryIcon && <EntryIcon fontSize="small" />}
                                                </TimelineDot>
                                                <TimelineConnectorPart ownSx={{visibility: isLastEntry ? 'hidden' : 'visible'}} />
                                            </TimelineSeparator>
                                            <TimelineContentPart ownSx={{py: 1.5, px: 2, minWidth: 0}}>
                                                <TimelineEntryTitle variant="body2" component="p" ownSx={{fontWeight: 600, color: isMuted ? 'text.secondary' : 'text.primary'}}>
                                                    {timelineEntry.title}
                                                </TimelineEntryTitle>
                                                {!isWide && timelineEntry.timestamp && (
                                                    <Typography variant="caption" color="text.secondary" component="p">{timelineEntry.timestamp}</Typography>
                                                )}
                                                {timelineEntry.details}
                                            </TimelineContentPart>
                                        </TimelineItem>
                                    );
                                })}
                            </TimelineTimeline>
                        </Collapse>
                    </TimelineGroup>
                );
            })}
        </Stack>
    );
}
