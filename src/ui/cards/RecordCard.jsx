// La tarjeta de un registro (un pedido, un cliente, una solicitud) para listas donde una tabla se queda corta: cada registro
// con su identidad arriba, sus datos agrupados en el cuerpo y lo que se puede hacer con él. Para una lista de tarjetas,
// una debajo de otra; con RecordCardSkeleton mientras carga.
//
//   encabezado   avatar (iniciales o ícono), eyebrow (el folio), title, subtitle; a la derecha status (estatus e
//                insignias) y el menú «⋯» (actions)
//   cuerpo       groups: grupos de datos {title?, facts: [{label, value}]} lado a lado en escritorio y uno debajo de otro en
//                el teléfono; highlight: el dato principal, grande (el total)
//   abajo        footer (botones, una cuenta regresiva, un formulario corto) y details: lo que se despliega con «Ver
//                detalle» (una tabla, un historial), que avisa con onDetailsToggle. footerAlign acomoda ese renglón: el
//                footer a la izquierda y «Ver detalle» en la otra orilla (lo de siempre), o los dos juntos a la izquierda o a
//                la derecha (en una tarjeta ancha, dos controles en orillas opuestas se ven sueltos)
//
// El ORDEN es el que se da y nada se reacomoda solo: los grupos de izquierda a derecha (de arriba abajo en el teléfono) y
// los datos de cada grupo en el orden de facts. Para un orden obligatorio (el de un sistema que ya existe, donde el estatus
// va después de las fechas), trailing es la última columna del cuerpo y columns fija el ancho de cada una.
//
// La tarjeta NO se pica entera (la regla de la casa: una acción, un botón): para abrir el registro, onOpen pone su botón.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaRecordCard con defaultProps y
// styleOverrides de sus partes: root, header, avatar, titles, status, body, group, fact, highlight, footer, details.
//
// Genérico del paquete: function (regla de la casa).
import {useId, useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

import {initialsOf} from '@/appShell/menuItemText.js';
import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';
import ActionsMenu from '@/ui/actions/ActionsMenu.jsx';

/**
 * Cómo se acomoda el renglón de abajo (footer y «Ver detalle»):
 *   spaceBetween  el footer a la izquierda y «Ver detalle» en la otra orilla (lo de siempre);
 *   start         los dos juntos, a la izquierda;
 *   end           los dos juntos, a la derecha.
 */
export const RECORD_CARD_FOOTER_ALIGN = Object.freeze({spaceBetween: 'spaceBetween', start: 'start', end: 'end'});
// cómo se reparte el renglón en cada caso: con spaceBetween el footer se estira y empuja «Ver detalle» a la orilla
const FOOTER_JUSTIFY = Object.freeze({spaceBetween: 'flex-start', start: 'flex-start', end: 'flex-end'});

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaRecordCard)
const THEME_NAME = 'CalcitaRecordCard';
const RecordCardRoot = piecePart(THEME_NAME, 'Root', Paper);
const RecordCardHeader = piecePart(THEME_NAME, 'Header', Stack);
const RecordCardAvatar = piecePart(THEME_NAME, 'Avatar', Avatar);
const RecordCardTitles = piecePart(THEME_NAME, 'Titles', Box);
const RecordCardStatus = piecePart(THEME_NAME, 'Status', Stack);
const RecordCardBody = piecePart(THEME_NAME, 'Body', Box);
const RecordCardGroup = piecePart(THEME_NAME, 'Group', Box);
const RecordCardFact = piecePart(THEME_NAME, 'Fact', Box);
const RecordCardHighlight = piecePart(THEME_NAME, 'Highlight', Box);
const RecordCardFooter = piecePart(THEME_NAME, 'Footer', Stack);
const RecordCardDetails = piecePart(THEME_NAME, 'Details', Box);

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.title el nombre del registro, ya traducido
 * @param {import('react').ReactNode} [props.eyebrow] arriba del título: el folio o el tipo
 * @param {import('react').ReactNode} [props.subtitle] abajo del título
 * @param {string|import('react').ReactNode} [props.avatar] un texto (de él salen las iniciales) o un ícono
 * @param {import('react').ReactNode} [props.status] a la derecha: StatusChip, IconBadge…
 * @param {Parameters<typeof import('@/ui/actions/ActionsMenu.jsx').default>[0]['actions']} [props.actions] el menú «⋯», con sus secciones,
 *     separadores, ligas y submenús (los renglones de ActionsMenu)
 * @param {Array<{key?: string, title?: import('react').ReactNode, facts?: Array<{label: import('react').ReactNode, value: import('react').ReactNode, emphasis?: boolean}>, content?: import('react').ReactNode}>} [props.groups]
 *     los datos, en grupos; emphasis los pone en negritas; content en lugar de facts para un grupo libre (una barra, unas
 *     insignias, un enlace)
 * @param {import('react').ReactNode} [props.header] un encabezado propio en lugar del de la casa (avatar, títulos, estatus)
 * @param {import('react').ReactNode} [props.children] contenido libre entre el cuerpo y lo de abajo
 * @param {{label: import('react').ReactNode, value: import('react').ReactNode, caption?: import('react').ReactNode}} [props.highlight] el dato principal
 * @param {import('react').ReactNode} [props.trailing] la última columna del cuerpo, después de los grupos y del dato principal
 *     (el estatus o unos botones, cuando el orden obligatorio los pone al final)
 * @param {string} [props.columns] en escritorio, el ancho de cada columna del cuerpo como en CSS ('1.2fr 1fr 1fr auto'); por
 *     omisión, los grupos a partes iguales y el dato principal y trailing a su medida
 * @param {import('react').ReactNode} [props.footer] abajo, a todo lo ancho
 * @param {'spaceBetween'|'start'|'end'} [props.footerAlign] uno de RECORD_CARD_FOOTER_ALIGN; por omisión spaceBetween
 * @param {import('react').ReactNode} [props.details] lo que se despliega con «Ver detalle»
 * @param {string} [props.detailsLabel] ya traducido; por omisión «Ver detalle»
 * @param {boolean} [props.defaultDetailsOpen]
 * @param {(isOpen: boolean) => void} [props.onDetailsToggle]
 * @param {() => void} [props.onOpen] el botón para abrir el registro (su detalle)
 * @param {string} [props.openLabel] ya traducido: el nombre de ese botón («Abrir el pedido P-1203»)
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function RecordCardContent(props) {
    const {
        title, eyebrow, subtitle, avatar, status, actions, groups = [], highlight, trailing, columns, footer,
        footerAlign = RECORD_CARD_FOOTER_ALIGN.spaceBetween, details, detailsLabel, defaultDetailsOpen = false,
        onDetailsToggle, onOpen, openLabel, header, children, sx, texts,
        ...unknownProps
    } = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const titleId = useId();
    const detailsId = useId();
    const [isDetailsOpen, setIsDetailsOpen] = useState(defaultDetailsOpen);
    const toggleDetails = () => {
        setIsDetailsOpen((current) => !current);
        onDetailsToggle?.(!isDetailsOpen);
    };
    const hasBody = groups.length > 0 || highlight || trailing;
    // las columnas en escritorio: las que se pidan, o los grupos a partes iguales y lo demás a su medida
    const desktopColumns = columns ?? `${groups.length > 0 ? `repeat(${groups.length}, minmax(0, 1fr))` : ''}${highlight ? ' auto' : ''}${trailing ? ' auto' : ''}`.trim();

    return (
        <RecordCardRoot variant="outlined" component="article" aria-labelledby={titleId} ownSx={{p: {xs: 2, sm: 2.5}, minWidth: 0}} sx={sx}>
            {/* en el teléfono el estatus baja abajo del título (si no, le quitaba medio ancho) y arriba quedan los botones */}
            {header ?? (
            <RecordCardHeader direction="row" ownSx={{gap: 1.5, alignItems: 'flex-start', flexWrap: {xs: 'wrap', sm: 'nowrap'}}}>
                {avatar && (
                    <RecordCardAvatar ownSx={{width: 44, height: 44, bgcolor: 'action.selected', color: 'text.primary', fontSize: 16, fontWeight: 600}}>
                        {typeof avatar === 'string' ? initialsOf(avatar) : avatar}
                    </RecordCardAvatar>
                )}
                <RecordCardTitles ownSx={{flex: 1, minWidth: 0, order: 1}}>
                    {eyebrow && <Typography variant="caption" color="text.secondary" component="p" sx={{fontVariantNumeric: 'tabular-nums'}}>{eyebrow}</Typography>}
                    <Typography id={titleId} variant="subtitle1" component="h3" sx={{fontWeight: 600, overflowWrap: 'anywhere'}}>{title}</Typography>
                    {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
                </RecordCardTitles>
                {status && (
                    <RecordCardStatus direction="row" ownSx={{
                        gap: 0.75, alignItems: 'center', flexWrap: 'wrap', order: {xs: 3, sm: 2},
                        flexBasis: {xs: '100%', sm: 'auto'}, justifyContent: {xs: 'flex-start', sm: 'flex-end'}, maxWidth: {sm: '50%'},
                    }}>
                        {status}
                    </RecordCardStatus>
                )}
                <Stack direction="row" sx={{gap: 0.25, alignItems: 'center', order: {xs: 2, sm: 3}, flexShrink: 0}}>
                    {onOpen && (
                        <Tooltip title={openLabel ?? t('recordCard.open')}>
                            <IconButton size="small" aria-label={openLabel ?? t('recordCard.open')} onClick={onOpen}><OpenInNewRoundedIcon fontSize="small" /></IconButton>
                        </Tooltip>
                    )}
                    {actions?.length > 0 && <ActionsMenu label={t('recordCard.actions')} actions={actions} size="small" />}
                </Stack>
            </RecordCardHeader>
            )}

            {hasBody && (
                <RecordCardBody ownSx={{
                    mt: 2, display: 'grid', gap: {xs: 1.5, md: 3}, alignItems: 'start',
                    // en escritorio los grupos lado a lado y el dato principal al final; en el teléfono, uno debajo de otro
                    gridTemplateColumns: {xs: '1fr', md: desktopColumns},
                }}>
                    {groups.map((group, groupIndex) => (
                        <RecordCardGroup key={group.key ?? groupIndex} ownSx={{
                            minWidth: 0, pt: {xs: groupIndex > 0 ? 1.5 : 0, md: 0}, borderTop: {xs: groupIndex > 0 ? 1 : 0, md: 0}, borderColor: 'divider',
                        }}>
                            {group.title && <Typography variant="overline" color="text.secondary" component="p" sx={{lineHeight: 1.8}}>{group.title}</Typography>}
                            {group.content ?? (
                            <Box component="dl" sx={{m: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.5}}>
                                {(group.facts ?? []).map((fact, factIndex) => (
                                    <RecordCardFact key={factIndex} ownSx={{display: 'contents'}}>
                                        <Typography component="dt" variant="body2" color="text.secondary">{fact.label}</Typography>
                                        <Typography component="dd" variant="body2" sx={{m: 0, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: fact.emphasis ? 600 : 400, overflowWrap: 'anywhere'}}>
                                            {fact.value}
                                        </Typography>
                                    </RecordCardFact>
                                ))}
                            </Box>
                            )}
                        </RecordCardGroup>
                    ))}
                    {highlight && (
                        <RecordCardHighlight ownSx={{
                            textAlign: {xs: 'left', md: 'right'}, pl: {md: 3}, borderLeft: {md: 1}, borderTop: {xs: 1, md: 0}, pt: {xs: 1.5, md: 0}, borderColor: 'divider',
                        }}>
                            <Typography variant="overline" color="text.secondary" component="p" sx={{lineHeight: 1.8}}>{highlight.label}</Typography>
                            <Typography variant="h5" component="p" sx={{fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{highlight.value}</Typography>
                            {highlight.caption && <Typography variant="caption" color="text.secondary" component="p">{highlight.caption}</Typography>}
                        </RecordCardHighlight>
                    )}
                    {trailing && (
                        <Box sx={{minWidth: 0, alignSelf: 'center', borderTop: {xs: 1, md: 0}, pt: {xs: 1.5, md: 0}, borderColor: 'divider'}}>{trailing}</Box>
                    )}
                </RecordCardBody>
            )}

            {children}
            {(footer || details) && (
                <RecordCardFooter direction="row" ownSx={{mt: 2, gap: 1, alignItems: 'center', flexWrap: 'wrap', justifyContent: FOOTER_JUSTIFY[footerAlign] ?? 'flex-start'}}>
                    <Box sx={{flex: footerAlign === RECORD_CARD_FOOTER_ALIGN.spaceBetween ? 1 : '0 1 auto', minWidth: 0}}>{footer}</Box>
                    {details && (
                        <Button size="small" onClick={toggleDetails} aria-expanded={isDetailsOpen} aria-controls={detailsId}
                                endIcon={<ExpandMoreRoundedIcon sx={{transform: isDetailsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms'}} />}>
                            {isDetailsOpen ? t('recordCard.hideDetails') : (detailsLabel ?? t('recordCard.showDetails'))}
                        </Button>
                    )}
                </RecordCardFooter>
            )}
            {details && (
                <Collapse in={isDetailsOpen} unmountOnExit>
                    <RecordCardDetails id={detailsId} ownSx={{mt: 2, pt: 2, borderTop: 1, borderColor: 'divider'}}>{details}</RecordCardDetails>
                </Collapse>
            )}
        </RecordCardRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const RecordCard = withPieceSlots(RecordCardContent, THEME_NAME);
export default RecordCard;
