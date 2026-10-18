// Las llamadas del tablero de tareas, con los datos ya en la forma de KanbanBoard (columnId en camelCase).
//
// Funciones que no renderizan: function (regla de la casa).
import {getTaskBoard, moveTask} from '@/fakeServer/tasksServer.js';

const cardOf = (task) => ({id: task.id, columnId: task.column_id, title: task.title, tags: task.tags});

export async function loadTaskBoard(signal) {
    const board = await getTaskBoard(signal);
    return {columns: board.columns.map((column) => ({...column, limit: column.limit ?? undefined})), cards: board.tasks.map(cardOf)};
}

/** Guarda la movida; regresa las tarjetas como quedaron en el servidor. */
export async function saveMove(move) {
    return (await moveTask(move)).tasks.map(cardOf);
}
