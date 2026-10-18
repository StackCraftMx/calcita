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
// Genérico del paquete: function (regla de la casa).
import {DragDropContext, Draggable, Droppable} from '@hello-pangea/dnd';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {cardsOfColumn, isOverLimit} from '@/kanban/kanbanMoves.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

// las columnas se reparten el ancho, sin bajar de este mínimo; si no caben, el tablero desliza de lado.
// OJO: con el teclado, la librería solo mueve una tarjeta a columnas que se ven COMPLETAS: con columnas fijas de 300 px la
// cuarta quedaba cortada en un escritorio y no se podía soltar ahí con el teclado
const COLUMN_MIN_WIDTH_PIXELS = 220;
// lo alto que mide una columna vacía: lo justo para soltar ahí una tarjeta
const EMPTY_COLUMN_MIN_HEIGHT = 96;

/**
 * Una tarjeta por omisión: el título, la descripción y sus etiquetas.
 *
 * @param {{card: {title: string, description?: string, tags?: string[]}}} props
 */
function DefaultCard({card}) {
    return (
        <Stack spacing={0.75}>
            <Typography variant="subtitle2" component="p">{card.title}</Typography>
            {card.description && <Typography variant="body2" color="text.secondary">{card.description}</Typography>}
            {card.tags?.length > 0 && (
                <Stack direction="row" spacing={0.5} useFlexGap sx={{flexWrap: 'wrap'}}>
                    {card.tags.map((tag) => <Chip key={tag} label={tag} size="small" />)}
                </Stack>
            )}
        </Stack>
    );
}

/**
 * @param {object} props
 * @param {Array<{id: string, title: string, limit?: number}>} props.columns en su orden
 * @param {Array<{id: string, columnId: string, title: string, description?: string, tags?: string[]}>} props.cards el orden
 *     de cada columna es el orden en este arreglo
 * @param {(move: {cardId: string, fromColumnId: string, toColumnId: string, toIndex: number}) => void} props.onMove
 * @param {(card: any) => import('react').ReactNode} [props.renderCard] lo de adentro de cada tarjeta (recibe la tarjeta de cards)
 * @param {(cardId: string) => void} [props.onCardClick]
 * @param {string} props.ariaLabel ya traducido
 */
export default function KanbanBoard({columns, cards, onMove, renderCard, onCardClick, ariaLabel}) {
    const {t} = useToolkitTranslation('kanban');
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
                    const isOver = isOverLimit(column, columnCards.length);
                    const count = Number.isInteger(column.limit) ? `${columnCards.length} / ${column.limit}` : String(columnCards.length);
                    return (
                        <Paper key={column.id} variant="outlined" component="section" aria-label={column.title}
                               sx={{flex: '1 1 0', minWidth: COLUMN_MIN_WIDTH_PIXELS, p: 1.5, scrollSnapAlign: 'start', borderRadius: 3}}>
                            <Stack direction="row" spacing={1} sx={{alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5}}>
                                <Typography variant="subtitle2" component="h3">{column.title}</Typography>
                                <Chip size="small" label={count} color={isOver ? 'warning' : 'default'}
                                      title={isOver ? t('overLimit', {limit: column.limit}) : undefined} />
                            </Stack>
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
                                                           sx={{p: 1.5, borderRadius: 2, cursor: 'grab', '&:focus-visible': {outline: 2, outlineColor: 'primary.main'}}}>
                                                        {renderCard ? renderCard(card) : <DefaultCard card={card} />}
                                                    </Paper>
                                                )}
                                            </Draggable>
                                        ))}
                                        {droppableProvided.placeholder}
                                        {columnCards.length === 0 && !droppableSnapshot.isDraggingOver && (
                                            <Typography variant="caption" color="text.secondary" sx={{textAlign: 'center', py: 3}}>{t('empty')}</Typography>
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
