// KanbanBoard (@stackcraftmx/calcita/kanban): se arrastra con el ratón, el dedo o el teclado (espacio, flechas y espacio).
// moveCard deja la movida al instante; con un servidor, si dice que no, se regresa a como estaba.
import {useState} from 'react';
import {KanbanBoard, moveCard} from '@stackcraftmx/calcita/kanban';

const COLUMNS = [
    {id: 'todo', title: 'Por hacer'},
    {id: 'doing', title: 'En proceso', limit: 2},
    {id: 'done', title: 'Listo'},
];

const TaskBoard = () => {
    const [cards, setCards] = useState([
        {id: 'a', columnId: 'todo', title: 'Cotizar la remodelación', tags: ['Sucursales']},
        {id: 'b', columnId: 'todo', title: 'Revisar el inventario'},
        {id: 'c', columnId: 'doing', title: 'Entregas atrasadas', tags: ['Urgente']},
        {id: 'd', columnId: 'done', title: 'Cerrar septiembre'},
    ]);

    return <KanbanBoard columns={COLUMNS} cards={cards} onMove={(move) => setCards((current) => moveCard(current, move))} ariaLabel="Tablero de tareas" />;
};

export default TaskBoard;
