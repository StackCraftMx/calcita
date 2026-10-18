// Lo que respondería el API del tablero de tareas: las columnas (con el tope de trabajo en curso de «En proceso») y las
// tarjetas en su orden. Mover una tarjeta guarda su columna y su lugar; pasar el tope responde 409 y el tablero la regresa.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {moveCard} from '@stackcraftmx/calcita/kanban';

import {ApiError} from '@/fakeServer/ApiError.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {inServerLanguage, serverTextOf} from '@/fakeServer/serverMessages.js';

const HTTP_STATUS = Object.freeze({conflict: 409});
// las columnas, con su nombre en los dos idiomas; «En proceso» con tope de 3 (el trabajo en curso)
const COLUMNS = Object.freeze([
    {id: 'todo', names: {es: 'Por hacer', en: 'To do'}},
    {id: 'doing', names: {es: 'En proceso', en: 'In progress'}, limit: 3},
    {id: 'review', names: {es: 'En revisión', en: 'In review'}},
    {id: 'done', names: {es: 'Listo', en: 'Done'}},
]);
let tasks = [
    {id: 'task-1', columnId: 'todo', title: {es: 'Cotizar la remodelación de San Pedro', en: 'Quote the San Pedro remodeling'}, tags: ['Sucursales']},
    {id: 'task-2', columnId: 'todo', title: {es: 'Revisar el inventario de sillas', en: 'Check the chair inventory'}, tags: ['Almacén']},
    {id: 'task-3', columnId: 'todo', title: {es: 'Responder las quejas de septiembre', en: 'Answer the September complaints'}, tags: ['Clientes']},
    {id: 'task-4', columnId: 'doing', title: {es: 'Entregas atrasadas de Puebla', en: 'Late deliveries in Puebla'}, tags: ['Entregas', 'Urgente']},
    {id: 'task-5', columnId: 'doing', title: {es: 'Cerrar el mes de septiembre', en: 'Close September'}, tags: ['Reportes']},
    {id: 'task-6', columnId: 'doing', title: {es: 'Capacitar al equipo de Mérida', en: 'Train the Mérida team'}, tags: ['Equipo']},
    {id: 'task-7', columnId: 'review', title: {es: 'Precios de la temporada', en: 'Season prices'}, tags: ['Precios']},
    {id: 'task-8', columnId: 'done', title: {es: 'Alta de 12 clientes de mayoreo', en: 'Sign up 12 wholesale customers'}, tags: ['Clientes']},
];

/** Una tarjeta como la manda el API (el título en el idioma pedido). */
function taskResponseOf(task) {
    return {id: task.id, column_id: task.columnId, title: inServerLanguage(task.title), tags: [...task.tags]};
}

/** GET tasks/board: las columnas y las tarjetas en su orden. */
export async function getTaskBoard(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return {
        columns: COLUMNS.map((column) => ({id: column.id, title: inServerLanguage(column.names), limit: column.limit ?? null})),
        tasks: tasks.map(taskResponseOf),
    };
}

/** POST tasks/{id}/move: la columna y el lugar nuevos; pasar el tope de la columna responde 409. */
export async function moveTask({cardId, fromColumnId, toColumnId, toIndex}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const column = COLUMNS.find((candidate) => candidate.id === toColumnId);
    const cardsInColumn = tasks.filter((task) => task.columnId === toColumnId).length;
    if (fromColumnId !== toColumnId && column.limit && cardsInColumn >= column.limit) {
        throw new ApiError({
            status: HTTP_STATUS.conflict,
            problem: {code: 'column_full', title: serverTextOf('tasks.fullTitle'), detail: serverTextOf('tasks.full', {column: inServerLanguage(column.names), limit: column.limit})},
        });
    }
    tasks = moveCard(tasks, {cardId, toColumnId, toIndex});
    return {tasks: tasks.map(taskResponseOf)};
}
