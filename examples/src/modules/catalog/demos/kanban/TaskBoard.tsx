// KanbanBoard (@stackcraftmx/calcita/kanban): se arrastra con el ratón, el dedo o el teclado (espacio, flechas y espacio).
// El tablero no guarda nada: avisa cada cosa (mover, agregar, las acciones del «⋯») y la pantalla actualiza sus tarjetas
// (aquí en memoria; en su proyecto, su API). La tarjeta pinta lo que traiga: etiquetas con color, responsables, fecha límite
// (roja si venció), pendientes, comentarios y adjuntos. Con onCardComplete cada tarjeta lleva su círculo para terminarla, y
// una columna collapsible (el congelador) se encoge a una tira. La pantalla de Tareas de los ejemplos lo usa completo.
import {useState} from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import {KanbanBoard, moveCard} from '@stackcraftmx/calcita/kanban';

const COLUMNS = [
    // el congelador: ideas para después, encogido de entrada (se le pueden soltar tarjetas igual)
    {id: 'icebox', title: 'Congelador', collapsible: true, defaultCollapsed: true},
    {id: 'todo', title: 'Por hacer'},
    {id: 'doing', title: 'En proceso', limit: 2},
    {id: 'done', title: 'Listo'},
];
const ME = {id: 'ana', name: 'Ana Martínez'};

// 1. Las tarjetas: lo que traigan, la tarjeta lo pinta (dueDate como AAAA-MM-DD)
type Card = {
    id: string, columnId: string, title: string, completed?: boolean, tags?: Array<string | {label: string, color?: string}>,
    assignees?: Array<{id: string, name: string}>, dueDate?: string, checklist?: {done: number, total: number}, comments?: number,
};
let nextId = 1;

const TaskBoard = () => {
    const [cards, setCards] = useState<Card[]>([
        {id: 'a', columnId: 'todo', title: 'Cotizar la remodelación', tags: [{label: 'Alta', color: 'error'}, 'Sucursales'], dueDate: '2026-10-20',
            assignees: [ME], checklist: {done: 1, total: 3}, comments: 2},
        {id: 'b', columnId: 'todo', title: 'Revisar el inventario'},
        {id: 'e', columnId: 'icebox', title: 'Programa de lealtad'},
        {id: 'c', columnId: 'doing', title: 'Entregas atrasadas', tags: ['Entregas'], dueDate: '2026-10-01', assignees: [{id: 'luis', name: 'Luis Herrera'}]},
        {id: 'd', columnId: 'done', title: 'Cerrar septiembre', completed: true},
    ]);

    return (
        <KanbanBoard columns={COLUMNS} cards={cards} ariaLabel="Tablero de tareas"
                     // 2. mover: la pantalla acomoda sus tarjetas (moveCard) y llama a su API
                     onMove={(move) => setCards((current) => moveCard(current, move))}
                     // 3. el «+» de cada columna: el título que se escribió
                     onAddCard={({columnId, title}) => setCards((current) => [...current, {id: `nueva-${nextId++}`, columnId, title}])}
                     // 4. el círculo de cada tarjeta: terminarla la pasa a «Listo» (arriba); reabrirla, a «Por hacer»
                     onCardComplete={(card, completed) => setCards((current) => moveCard(
                         current.map((item) => (item.id === card.id ? {...item, completed} : item)),
                         {cardId: card.id, toColumnId: completed ? 'done' : 'todo', toIndex: 0},
                     ))}
                     // 5. el «⋯» de cada tarjeta: las acciones que la pantalla quiera
                     cardActions={(card) => [
                         {key: 'assign', label: 'Asignarme', icon: <PersonAddAlt1OutlinedIcon fontSize="small" />,
                             onClick: () => setCards((current) => current.map((item) => (item.id === card.id ? {...item, assignees: [ME]} : item)))},
                         {key: 'delete', label: 'Borrar', icon: <DeleteOutlineIcon fontSize="small" />, color: 'error',
                             onClick: () => setCards((current) => current.filter((item) => item.id !== card.id))},
                     ]} />
    );
};

export default TaskBoard;
