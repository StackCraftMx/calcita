// Un tablero kanban (@stackcraftmx/calcita/kanban): columnas con tarjetas que se arrastran de una a otra con el ratón, con el
// dedo o con el teclado (espacio para levantar, flechas para mover, espacio para soltar). Con @hello-pangea/dnd por dentro.
//
//   <KanbanBoard columns={[{id: 'todo', title: 'Por hacer'}, {id: 'doing', title: 'En proceso', limit: 3}]}
//                cards={cards} onMove={(move) => api.post('/tasks/move', move)} ariaLabel="Tablero de tareas" />
//
// El tablero no guarda nada: avisa la movida (onMove) y quien lo usa actualiza sus tarjetas (moveCard de kanbanMoves.js lo
// hace sin esperar al servidor). Una columna con tope (limit, el trabajo en curso) avisa en ámbar cuando lo pasa.
//
// Accesible: el lector de pantalla anuncia en el idioma de la app qué se levantó, a dónde va y dónde quedó.
//
// Lo de un producto, todo hacia afuera (el tablero no guarda nada ni llama a ningún servidor):
//   - la tarjeta por omisión pinta lo que traiga: etiquetas (texto o {label, color}), responsables con su monograma, la
//     fecha límite (roja si ya venció, ámbar si es hoy), el avance de su lista de pendientes, comentarios y adjuntos. Para
//     otra tarjeta: renderCard;
//   - «+» en cada columna para agregar escribiendo el título (onAddCard({columnId, title}));
//   - «⋯» en cada tarjeta y en cada columna con las acciones que dé la pantalla (cardActions, columnActions): editar,
//     asignarme, mover sin arrastrar, borrar…;
//   - terminar una tarea: con onCardComplete cada tarjeta lleva su círculo para marcarla (y desmarcarla); qué pasa al
//     terminarla (pasarla a «Listo», guardar la fecha) lo decide la pantalla. Una tarjeta con completed: true sale con su
//     palomita verde y su fecha límite ya no se pinta de rojo;
//   - columnas que se encogen (collapsible), como el congelador (icebox) de ideas para después: se quedan en una tira angosta
//     con su nombre y su cuenta, y se les puede soltar una tarjeta igual. defaultCollapsed la abre encogida y
//     onColumnCollapse avisa cada cambio (para guardarlo si la pantalla quiere);
//   - texts para cualquier texto (la forma de `kanban` en los textos del paquete).
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {DragDropContext, Draggable, Droppable} from '@hello-pangea/dnd';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

import {initialsOf} from '@/appShell/menuItemText.js';
import {formatDate} from '@/formatting.js';
import {DUE_STATUS, dueStatusOf, tagOf, todayIsoDateOf} from '@/kanban/kanbanCards.js';
import {cardsOfColumn, isOverLimit} from '@/kanban/kanbanMoves.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import ActionsMenu from '@/ui/actions/ActionsMenu.jsx';

// las columnas se reparten el ancho, sin bajar de este mínimo; si no caben, el tablero desliza de lado.
// OJO: con el teclado, la librería solo mueve una tarjeta a columnas que se ven COMPLETAS: con columnas fijas de 300 px la
// cuarta quedaba cortada en un escritorio y no se podía soltar ahí con el teclado
const COLUMN_MIN_WIDTH_PIXELS = 220;
// lo alto que mide una columna vacía: lo justo para soltar ahí una tarjeta
const EMPTY_COLUMN_MIN_HEIGHT = 96;
// cuántas caras de responsables se ven antes del «+2»
const MAX_VISIBLE_ASSIGNEES = 3;
const ASSIGNEE_AVATAR_PIXELS = 24;
// lo ancho de una columna encogida: su nombre de lado, su cuenta y su botón para abrirla
const COLLAPSED_COLUMN_WIDTH_PIXELS = 52;
// el color del texto de la fecha según cómo va
const DUE_COLOR = Object.freeze({[DUE_STATUS.overdue]: 'error.main', [DUE_STATUS.today]: 'warning.dark', [DUE_STATUS.upcoming]: 'text.secondary'});

/**
 * El círculo para terminar una tarea (o reabrirla, si ya está terminada). El clic no levanta la tarjeta ni la abre.
 *
 * @param {{card: any, t: Function, onComplete: (card: any, completed: boolean) => void}} props
 */
function CompleteButton({card, t, onComplete}) {
    const label = card.completed ? t('reopen', {title: card.title}) : t('complete', {title: card.title});
    return (
        <Tooltip title={label}>
            <IconButton size="small" aria-label={label} aria-pressed={Boolean(card.completed)} sx={{m: -0.5, color: card.completed ? 'success.main' : 'text.secondary'}}
                        onClick={(event) => {
                            event.stopPropagation();
                            onComplete(card, !card.completed);
                        }}>
                {card.completed ? <CheckCircleRoundedIcon fontSize="small" /> : <RadioButtonUncheckedRoundedIcon fontSize="small" />}
            </IconButton>
        </Tooltip>
    );
}

/**
 * Una tarjeta por omisión: lo que traiga, sin pedir nada (título, descripción, etiquetas, responsables, fecha, pendientes,
 * comentarios y adjuntos).
 *
 * @param {{card: any, t: Function, today: string, onComplete?: (card: any, completed: boolean) => void}} props
 */
function DefaultCard({card, t, today, onComplete}) {
    // terminada, su fecha ya no apura: se pinta tenue, sin rojo ni ámbar
    const dueStatus = card.completed && card.dueDate ? DUE_STATUS.upcoming : dueStatusOf(card.dueDate, today);
    let dueText = '';
    if (card.completed && card.dueDate) {
        dueText = t('dueCompleted', {date: formatDate(card.dueDate)});
    } else if (dueStatus === DUE_STATUS.overdue) {
        dueText = t('dueOverdue', {date: formatDate(card.dueDate)});
    } else if (dueStatus === DUE_STATUS.today) {
        dueText = t('dueToday');
    } else if (dueStatus) {
        dueText = t('dueOn', {date: formatDate(card.dueDate)});
    }
    const hasFooter = dueStatus || card.checklist?.total > 0 || card.comments > 0 || card.attachments > 0 || card.assignees?.length > 0;

    return (
        <Stack spacing={0.75}>
            {card.tags?.length > 0 && (
                <Stack direction="row" spacing={0.5} useFlexGap sx={{flexWrap: 'wrap'}}>
                    {card.tags.map((rawTag) => {
                        const tag = tagOf(rawTag);
                        return <Chip key={tag.label} label={tag.label} size="small" color={tag.color} variant={tag.color === 'default' ? 'filled' : 'outlined'} />;
                    })}
                </Stack>
            )}
            <Stack direction="row" spacing={1} sx={{alignItems: 'flex-start'}}>
                {onComplete && <CompleteButton card={card} t={t} onComplete={onComplete} />}
                {!onComplete && card.completed && (
                    <CheckCircleRoundedIcon fontSize="small" sx={{color: 'success.main'}} titleAccess={t('completed')} />
                )}
                <Typography variant="subtitle2" component="p" sx={{color: card.completed ? 'text.secondary' : undefined}}>{card.title}</Typography>
            </Stack>
            {card.description && <Typography variant="body2" color="text.secondary">{card.description}</Typography>}
            {hasFooter && (
                <Stack direction="row" spacing={1.25} useFlexGap sx={{alignItems: 'center', flexWrap: 'wrap', color: 'text.secondary'}}>
                    {dueStatus && (
                        <Stack direction="row" spacing={0.5} sx={{alignItems: 'center', color: DUE_COLOR[dueStatus]}}>
                            <EventOutlinedIcon sx={{fontSize: 16}} />
                            <Typography variant="caption" sx={{fontWeight: dueStatus === DUE_STATUS.upcoming ? 400 : 600}}>{dueText}</Typography>
                        </Stack>
                    )}
                    {card.checklist?.total > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{alignItems: 'center'}}
                               aria-label={t('checklist', {done: card.checklist.done, total: card.checklist.total})}>
                            <CheckBoxOutlinedIcon sx={{fontSize: 16}} />
                            <Typography variant="caption" aria-hidden="true">{card.checklist.done}/{card.checklist.total}</Typography>
                        </Stack>
                    )}
                    {card.comments > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{alignItems: 'center'}} aria-label={t('comments', {count: card.comments})}>
                            <ChatBubbleOutlineRoundedIcon sx={{fontSize: 16}} />
                            <Typography variant="caption" aria-hidden="true">{card.comments}</Typography>
                        </Stack>
                    )}
                    {card.attachments > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{alignItems: 'center'}} aria-label={t('attachments', {count: card.attachments})}>
                            <AttachFileRoundedIcon sx={{fontSize: 16}} />
                            <Typography variant="caption" aria-hidden="true">{card.attachments}</Typography>
                        </Stack>
                    )}
                    {card.assignees?.length > 0 && (
                        <AvatarGroup max={MAX_VISIBLE_ASSIGNEES} sx={{ml: 'auto', '& .MuiAvatar-root': {width: ASSIGNEE_AVATAR_PIXELS, height: ASSIGNEE_AVATAR_PIXELS, fontSize: 11}}}
                                     aria-label={t('assignees', {names: card.assignees.map((person) => person.name).join(', ')})}>
                            {card.assignees.map((person) => (
                                <Tooltip key={person.id} title={person.name}>
                                    <Avatar alt={person.name} src={person.avatarUrl}>{initialsOf(person.name)}</Avatar>
                                </Tooltip>
                            ))}
                        </AvatarGroup>
                    )}
                </Stack>
            )}
        </Stack>
    );
}

/**
 * Agregar una tarjeta escribiendo su título: Enter la agrega (y deja el campo listo para otra), Escape cierra.
 *
 * @param {{columnTitle: string, onAdd: (title: string) => void, onClose: () => void, t: Function}} props
 */
function QuickAdd({columnTitle, onAdd, onClose, t}) {
    const [title, setTitle] = useState('');
    return (
        <TextField size="small" fullWidth autoFocus multiline maxRows={4} value={title} placeholder={t('addCardPlaceholder')}
                   slotProps={{htmlInput: {'aria-label': t('addCard', {column: columnTitle})}}}
                   onChange={(event) => setTitle(event.target.value)}
                   onBlur={() => !title.trim() && onClose()}
                   onKeyDown={(event) => {
                       if (event.key === 'Escape') {
                           onClose();
                       }
                       if (event.key === 'Enter' && !event.shiftKey) {
                           event.preventDefault();
                           if (title.trim()) {
                               onAdd(title.trim());
                               setTitle('');
                           }
                       }
                   }} />
    );
}

/**
 * @param {object} props
 * @param {Array<{id: string, title: string, limit?: number, count?: number, collapsible?: boolean, defaultCollapsed?: boolean}>} props.columns
 *     en su orden. count: cuántas tarjetas tiene de verdad cuando la pantalla le pasa solo las filtradas (el tope se cuenta
 *     contra todas). collapsible: lleva su botón para encogerse (el congelador); defaultCollapsed: empieza encogida
 * @param {Array<{id: string, columnId: string, title: string, completed?: boolean, description?: string, tags?: Array<string|{label: string, color?: string}>, assignees?: Array<{id: string, name: string, avatarUrl?: string}>, dueDate?: string, checklist?: {done: number, total: number}, comments?: number, attachments?: number} & Record<string, any>>} props.cards
 *     el orden de cada columna es el orden en este arreglo; cada tarjeta puede traer sus campos propios (llegan a renderCard,
 *     a cardActions y a onCardClick tal cual). dueDate: AAAA-MM-DD
 * @param {(move: {cardId: string, fromColumnId: string, toColumnId: string, toIndex: number}) => void} props.onMove
 * @param {(card: any) => import('react').ReactNode} [props.renderCard] lo de adentro de cada tarjeta (recibe la tarjeta de cards)
 * @param {(cardId: string) => void} [props.onCardClick]
 * @param {(newCard: {columnId: string, title: string}) => void} [props.onAddCard] con él cada columna lleva su «+» para agregar
 *     escribiendo el título
 * @param {(card: any) => Array<{key: string, label: string, icon?: import('react').ReactNode, color?: string, disabled?: boolean, onClick: () => void}>} [props.cardActions]
 *     las acciones del «⋯» de cada tarjeta (editar, asignarme, borrar…); sin ellas no hay «⋯»
 * @param {(column: any) => Array<{key: string, label: string, icon?: import('react').ReactNode, color?: string, disabled?: boolean, onClick: () => void}>} [props.columnActions]
 *     las acciones del «⋯» de cada columna (renombrar, limpiar…)
 * @param {(card: any, completed: boolean) => void} [props.onCardComplete] con él cada tarjeta lleva su círculo para terminarla
 *     (completed true) o reabrirla (false); la pantalla decide qué más pasa (moverla a «Listo», guardar la fecha)
 * @param {(columnId: string, collapsed: boolean) => void} [props.onColumnCollapse] cada que una columna se encoge o se abre
 * @param {string} props.ariaLabel ya traducido
 * @param {object} [props.texts] los textos que cambian, con la forma de `kanban` en los textos del paquete
 */
export default function KanbanBoard({
    columns, cards, onMove, renderCard, onCardClick, onAddCard, cardActions, columnActions, onCardComplete, onColumnCollapse, ariaLabel, texts,
}) {
    const {t} = useToolkitTranslation('kanban', texts);
    // la columna donde se está escribiendo una tarjeta nueva
    const [addingColumnId, setAddingColumnId] = useState(null);
    // las columnas encogidas: empiezan como dice defaultCollapsed y luego las mueve la persona
    const [collapsedIds, setCollapsedIds] = useState(() => new Set(columns.filter((column) => column.defaultCollapsed).map((column) => column.id)));
    const toggleColumn = (columnId) => {
        const collapsed = !collapsedIds.has(columnId);
        setCollapsedIds((current) => {
            const next = new Set(current);
            if (collapsed) {
                next.add(columnId);
            } else {
                next.delete(columnId);
            }
            return next;
        });
        onColumnCollapse?.(columnId, collapsed);
    };
    const today = todayIsoDateOf();
    const columnTitleOf = (columnId) => columns.find((column) => column.id === columnId)?.title ?? columnId;
    const cardTitleOf = (cardId) => cards.find((card) => card.id === cardId)?.title ?? cardId;

    // lo que oye quien usa lector de pantalla (posiciones desde 1, como se cuentan)
    const announceStart = (start, provided) => provided.announce(t('lifted', {
        title: cardTitleOf(start.draggableId), column: columnTitleOf(start.source.droppableId), position: start.source.index + 1,
    }));
    const announceUpdate = (update, provided) => {
        if (update.destination) {
            provided.announce(t('moving', {column: columnTitleOf(update.destination.droppableId), position: update.destination.index + 1}));
        }
    };
    const finishMove = (result, provided) => {
        const {draggableId, source, destination} = result;
        // se soltó fuera de una columna o en el mismo lugar: nada que mover
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            provided.announce(t('cancelled', {title: cardTitleOf(draggableId)}));
            return;
        }
        provided.announce(t('dropped', {title: cardTitleOf(draggableId), column: columnTitleOf(destination.droppableId), position: destination.index + 1}));
        onMove({cardId: draggableId, fromColumnId: source.droppableId, toColumnId: destination.droppableId, toIndex: destination.index});
    };

    return (
        <DragDropContext onDragStart={announceStart} onDragUpdate={announceUpdate} onDragEnd={finishMove} dragHandleUsageInstructions={t('instructions')}>
            <Box role="region" aria-label={ariaLabel} sx={{
                display: 'flex', gap: 2, overflowX: 'auto', pb: 1, scrollSnapType: 'x proximity', alignItems: 'flex-start',
            }}>
                {columns.map((column) => {
                    const columnCards = cardsOfColumn(cards, column.id);
                    // con un filtro puesto la pantalla dice cuántas tiene de verdad: «1 / 3» mentía con la columna llena
                    const total = Number.isInteger(column.count) ? column.count : columnCards.length;
                    const isOver = isOverLimit(column, total);
                    const count = Number.isInteger(column.limit) ? `${total} / ${column.limit}` : String(total);
                    const isCollapsed = column.collapsible && collapsedIds.has(column.id);
                    // encogida: una tira con su nombre de lado y su cuenta; se le puede soltar una tarjeta (queda arriba)
                    if (isCollapsed) {
                        return (
                            <Droppable key={column.id} droppableId={column.id}>
                                {(droppableProvided, droppableSnapshot) => (
                                    <Paper ref={droppableProvided.innerRef} {...droppableProvided.droppableProps} variant="outlined" component="section"
                                           aria-label={column.title}
                                           sx={{
                                               flex: '0 0 auto', width: COLLAPSED_COLUMN_WIDTH_PIXELS, py: 1, borderRadius: 3, display: 'flex',
                                               flexDirection: 'column', alignItems: 'center', gap: 1, minHeight: EMPTY_COLUMN_MIN_HEIGHT * 2,
                                               bgcolor: droppableSnapshot.isDraggingOver ? 'action.hover' : undefined,
                                           }}>
                                        <Tooltip title={t('expandColumn', {column: column.title})} placement="right">
                                            <IconButton size="small" aria-label={t('expandColumn', {column: column.title})} aria-expanded="false"
                                                        onClick={() => toggleColumn(column.id)}>
                                                <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Chip size="small" label={count} color={isOver ? 'warning' : 'default'} />
                                        <Typography variant="subtitle2" component="h3" sx={{writingMode: 'vertical-rl', whiteSpace: 'nowrap'}}>
                                            {column.title}
                                        </Typography>
                                        {/* el lugar de la tarjeta que se arrastra; encogida no la enseña */}
                                        <Box sx={{display: 'none'}}>{droppableProvided.placeholder}</Box>
                                    </Paper>
                                )}
                            </Droppable>
                        );
                    }
                    return (
                        <Paper key={column.id} variant="outlined" component="section" aria-label={column.title}
                               sx={{flex: '1 1 0', minWidth: COLUMN_MIN_WIDTH_PIXELS, p: 1.5, scrollSnapAlign: 'start', borderRadius: 3}}>
                            <Stack direction="row" spacing={0.5} sx={{alignItems: 'center', mb: 1.5, px: 0.5}}>
                                <Typography variant="subtitle2" component="h3" sx={{flexGrow: 1, minWidth: 0}}>{column.title}</Typography>
                                <Chip size="small" label={count} color={isOver ? 'warning' : 'default'}
                                      title={isOver ? t('overLimit', {limit: column.limit}) : undefined} />
                                {onAddCard && (
                                    <Tooltip title={t('addCard', {column: column.title})}>
                                        <IconButton size="small" aria-label={t('addCard', {column: column.title})} onClick={() => setAddingColumnId(column.id)}>
                                            <AddRoundedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <ActionsMenu label={t('columnActions', {column: column.title})} actions={columnActions?.(column)} />
                                {column.collapsible && (
                                    <Tooltip title={t('collapseColumn', {column: column.title})}>
                                        <IconButton size="small" aria-label={t('collapseColumn', {column: column.title})} aria-expanded="true"
                                                    onClick={() => toggleColumn(column.id)}>
                                            <KeyboardDoubleArrowLeftRoundedIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Stack>
                            {addingColumnId === column.id && (
                                <Box sx={{mb: 1}}>
                                    <QuickAdd columnTitle={column.title} t={t} onClose={() => setAddingColumnId(null)}
                                              onAdd={(title) => onAddCard({columnId: column.id, title})} />
                                </Box>
                            )}
                            <Droppable droppableId={column.id}>
                                {(droppableProvided, droppableSnapshot) => (
                                    <Stack ref={droppableProvided.innerRef} {...droppableProvided.droppableProps} spacing={1}
                                           sx={{
                                               minHeight: EMPTY_COLUMN_MIN_HEIGHT, borderRadius: 2, transition: 'background-color 160ms',
                                               bgcolor: droppableSnapshot.isDraggingOver ? 'action.hover' : 'transparent',
                                           }}>
                                        {columnCards.map((card, index) => (
                                            <Draggable key={card.id} draggableId={card.id} index={index}>
                                                {(draggableProvided, draggableSnapshot) => (
                                                    <Paper ref={draggableProvided.innerRef} {...draggableProvided.draggableProps} {...draggableProvided.dragHandleProps}
                                                           elevation={draggableSnapshot.isDragging ? 8 : 1}
                                                           onClick={onCardClick ? () => onCardClick(card.id) : undefined}
                                                           sx={{p: 1.5, borderRadius: 2, cursor: 'grab', position: 'relative', '&:focus-visible': {outline: 2, outlineColor: 'primary.main'}}}>
                                                        {/* el «⋯» arriba a la derecha; el contenido le deja su lugar */}
                                                        {cardActions && (
                                                            <Box sx={{position: 'absolute', top: 4, right: 4}}>
                                                                <ActionsMenu label={t('cardActions', {title: card.title})} actions={cardActions(card)} />
                                                            </Box>
                                                        )}
                                                        <Box sx={cardActions ? {pr: 3} : undefined}>
                                                            {renderCard ? renderCard(card) : <DefaultCard card={card} t={t} today={today} onComplete={onCardComplete} />}
                                                        </Box>
                                                    </Paper>
                                                )}
                                            </Draggable>
                                        ))}
                                        {droppableProvided.placeholder}
                                        {/* vacía de verdad, o con tarjetas que el filtro de la pantalla esconde (no se dice «sin tarjetas») */}
                                        {columnCards.length === 0 && !droppableSnapshot.isDraggingOver && addingColumnId !== column.id && (
                                            <Typography variant="caption" color="text.secondary" sx={{textAlign: 'center', py: 3}}>
                                                {total > 0 ? t('emptyFiltered') : t('empty')}
                                            </Typography>
                                        )}
                                    </Stack>
                                )}
                            </Droppable>
                        </Paper>
                    );
                })}
            </Box>
        </DragDropContext>
    );
}
