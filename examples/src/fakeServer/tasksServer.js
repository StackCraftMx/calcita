// Lo que respondería el API del tablero de tareas: las columnas (el congelador de ideas para después y el tope de trabajo en
// curso de «En proceso»), las tarjetas en su orden y las personas a quienes se les puede asignar. Crear, editar, borrar,
// terminar, reabrir, archivar las terminadas y mover: cada una valida como lo haría un backend (título obligatorio, fecha
// AAAA-MM-DD, tope de la columna) y responde 409 o 422 con su problema.
//
// Terminada = está en «Listo»: al llegar ahí (terminándola o arrastrándola) se guarda el día; al salir se borra. Reabrirla
// la regresa arriba de «Por hacer».
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {moveCard} from '@stackcraftmx/calcita/kanban';

import {ApiError} from '@/fakeServer/ApiError.js';
import {fakeUsers} from '@/fakeServer/fakeAccounts.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {inServerLanguage, serverTextOf} from '@/fakeServer/serverMessages.js';
import {signedInUserIdOf} from '@/fakeServer/sessionCookie.js';

const HTTP_STATUS = Object.freeze({notFound: 404, conflict: 409, unprocessable: 422});
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TITLE_MAX_LENGTH = 120;
/** Las prioridades que acepta el API. */
export const TASK_PRIORITIES = Object.freeze({high: 'high', medium: 'medium', low: 'low'});
// la columna de lo terminado: «Archivar las terminadas» la vacía
const DONE_COLUMN_ID = 'done';
// a donde regresa una tarea reabierta
const TODO_COLUMN_ID = 'todo';

// las columnas, con su nombre en los dos idiomas; «En proceso» con tope de 3 (el trabajo en curso)
// el congelador (icebox): ideas y pendientes sin fecha que todavía nadie toma; la pantalla lo deja encogido
const COLUMNS = Object.freeze([
    {id: 'icebox', names: {es: 'Congelador', en: 'Icebox'}},
    {id: TODO_COLUMN_ID, names: {es: 'Por hacer', en: 'To do'}},
    {id: 'doing', names: {es: 'En proceso', en: 'In progress'}, limit: 3},
    {id: 'review', names: {es: 'En revisión', en: 'In review'}},
    {id: DONE_COLUMN_ID, names: {es: 'Listo', en: 'Done'}},
]);

/** El día de hace (o dentro de) N días como AAAA-MM-DD: las fechas de ejemplo se mueven con el día de hoy. */
function isoDateInDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

let nextTaskNumber = 20;
let nextChecklistNumber = 20;
// el título de las tarjetas de ejemplo viene en los dos idiomas; el de las que crea la persona, como lo escribió
let tasks = [
    {id: 'task-11', columnId: 'icebox', title: {es: 'Programa de lealtad para mayoreo', en: 'Wholesale loyalty program'}, tags: ['Clientes'],
        priority: TASK_PRIORITIES.low, assigneeIds: [], dueDate: '', checklist: [], comments: 1, attachments: 0, description: ''},
    {id: 'task-12', columnId: 'icebox', title: {es: 'Abrir sucursal en León', en: 'Open a branch in León'}, tags: ['Sucursales'],
        priority: TASK_PRIORITIES.low, assigneeIds: [], dueDate: '', checklist: [], comments: 0, attachments: 2, description: ''},
    {id: 'task-1', columnId: 'todo', title: {es: 'Cotizar la remodelación de San Pedro', en: 'Quote the San Pedro remodeling'}, tags: ['Sucursales'],
        priority: TASK_PRIORITIES.medium, assigneeIds: ['user-ana'], dueDate: isoDateInDays(5), checklist: [
            {id: 'c-1', text: 'Pedir 3 cotizaciones', done: true}, {id: 'c-2', text: 'Comparar precios', done: false}, {id: 'c-3', text: 'Presentar a dirección', done: false},
        ], comments: 2, attachments: 3, description: ''},
    {id: 'task-2', columnId: 'todo', title: {es: 'Revisar el inventario de sillas', en: 'Check the chair inventory'}, tags: ['Almacén'],
        priority: TASK_PRIORITIES.low, assigneeIds: ['user-luis'], dueDate: isoDateInDays(12), checklist: [], comments: 0, attachments: 0, description: ''},
    {id: 'task-3', columnId: 'todo', title: {es: 'Responder las quejas de septiembre', en: 'Answer the September complaints'}, tags: ['Clientes'],
        priority: TASK_PRIORITIES.high, assigneeIds: [], dueDate: isoDateInDays(-2), checklist: [], comments: 5, attachments: 0, description: ''},
    {id: 'task-4', columnId: 'doing', title: {es: 'Entregas atrasadas de Puebla', en: 'Late deliveries in Puebla'}, tags: ['Entregas'],
        priority: TASK_PRIORITIES.high, assigneeIds: ['user-sample', 'user-ana'], dueDate: isoDateInDays(0), checklist: [
            {id: 'c-4', text: 'Llamar a la paquetería', done: true}, {id: 'c-5', text: 'Avisar a los clientes', done: true},
        ], comments: 3, attachments: 1, description: ''},
    {id: 'task-5', columnId: 'doing', title: {es: 'Cerrar el mes de septiembre', en: 'Close September'}, tags: ['Reportes'],
        priority: TASK_PRIORITIES.medium, assigneeIds: ['user-ana'], dueDate: isoDateInDays(1), checklist: [], comments: 0, attachments: 2, description: ''},
    {id: 'task-6', columnId: 'doing', title: {es: 'Capacitar al equipo de Mérida', en: 'Train the Mérida team'}, tags: ['Equipo'],
        priority: TASK_PRIORITIES.low, assigneeIds: ['user-sample'], dueDate: '', checklist: [], comments: 1, attachments: 0, description: ''},
    {id: 'task-7', columnId: 'review', title: {es: 'Precios de la temporada', en: 'Season prices'}, tags: ['Precios'],
        priority: TASK_PRIORITIES.medium, assigneeIds: ['user-luis'], dueDate: isoDateInDays(3), checklist: [], comments: 0, attachments: 1, description: ''},
    {id: 'task-8', columnId: DONE_COLUMN_ID, title: {es: 'Alta de 12 clientes de mayoreo', en: 'Sign up 12 wholesale customers'}, tags: ['Clientes'],
        priority: TASK_PRIORITIES.low, assigneeIds: ['user-ana'], dueDate: isoDateInDays(-6), checklist: [], comments: 4, attachments: 0, description: '',
        completedAt: isoDateInDays(-7)},
];

/** Una tarjeta como la manda el API (el título en el idioma pedido). */
function taskResponseOf(task) {
    return {
        id: task.id, column_id: task.columnId, title: typeof task.title === 'string' ? task.title : inServerLanguage(task.title),
        description: task.description, tags: [...task.tags], priority: task.priority, assignee_ids: [...task.assigneeIds], due_date: task.dueDate,
        checklist: task.checklist.map((item) => ({...item})), comments: task.comments, attachments: task.attachments,
        completed_at: task.completedAt ?? null,
    };
}

/** El tablero completo, como lo regresa cada llamada que lo cambia. */
function boardResponseOf() {
    return {
        columns: COLUMNS.map((column) => ({id: column.id, title: inServerLanguage(column.names), limit: column.limit ?? null})),
        tasks: tasks.map(taskResponseOf),
        people: fakeUsers.map((user) => ({id: user.id, name: user.name})),
        signed_in_user_id: signedInUserIdOf(),
    };
}

function findTaskOrFail(taskId) {
    const task = tasks.find((candidate) => candidate.id === taskId);
    if (!task) {
        throw new ApiError({status: HTTP_STATUS.notFound, problem: {title: serverTextOf('tasks.notFoundTitle'), detail: serverTextOf('tasks.notFound')}});
    }
    return task;
}

/** Los errores de cada campo de una tarjeta, como un 422 de Laravel. */
function fieldErrorsOf({title, dueDate, priority, assigneeIds}) {
    const errors = {};
    if (title !== undefined && (!String(title).trim() || String(title).trim().length > TITLE_MAX_LENGTH)) {
        errors.title = [serverTextOf('tasks.titleInvalid', {max: TITLE_MAX_LENGTH})];
    }
    if (dueDate && !ISO_DATE.test(dueDate)) {
        errors.due_date = [serverTextOf('tasks.dueDateInvalid')];
    }
    if (priority !== undefined && !Object.values(TASK_PRIORITIES).includes(priority)) {
        errors.priority = [serverTextOf('tasks.priorityInvalid')];
    }
    if (assigneeIds?.some((userId) => !fakeUsers.some((user) => user.id === userId))) {
        errors.assignee_ids = [serverTextOf('tasks.assigneeInvalid')];
    }
    return errors;
}

function failIfInvalid(fields) {
    const errors = fieldErrorsOf(fields);
    if (Object.keys(errors).length > 0) {
        throw new ApiError({
            status: HTTP_STATUS.unprocessable,
            problem: {status: HTTP_STATUS.unprocessable, code: 'validation_failed', title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors},
        });
    }
}

/** GET tasks/board: las columnas, las tarjetas en su orden y las personas. */
export async function getTaskBoard(signal) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS, signal);
    return boardResponseOf();
}

/** POST tasks: una tarjeta nueva al final de su columna (el «+» de la columna manda solo el título). */
export async function createTask({columnId, title}) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    failIfInvalid({title});
    tasks = [...tasks, {
        id: `task-${nextTaskNumber++}`, columnId, title: title.trim(), description: '', tags: [], priority: TASK_PRIORITIES.medium,
        assigneeIds: [], dueDate: '', checklist: [], comments: 0, attachments: 0,
    }];
    return boardResponseOf();
}

/** PUT tasks/{id}: lo que cambió de la tarjeta (los campos que no vienen se quedan como estaban). */
export async function updateTask(taskId, changes) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const task = findTaskOrFail(taskId);
    failIfInvalid(changes);
    Object.assign(task, {
        ...(changes.title !== undefined && {title: changes.title.trim()}),
        ...(changes.description !== undefined && {description: changes.description}),
        ...(changes.tags !== undefined && {tags: [...changes.tags]}),
        ...(changes.priority !== undefined && {priority: changes.priority}),
        ...(changes.assigneeIds !== undefined && {assigneeIds: [...changes.assigneeIds]}),
        ...(changes.dueDate !== undefined && {dueDate: changes.dueDate ?? ''}),
        // los renglones nuevos de la lista llegan sin id: el servidor les pone uno
        ...(changes.checklist !== undefined && {checklist: changes.checklist.map((item) => ({id: item.id ?? `c-${nextChecklistNumber++}`, text: item.text, done: Boolean(item.done)}))}),
    });
    return boardResponseOf();
}

/** DELETE tasks/{id}. */
export async function deleteTask(taskId) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    findTaskOrFail(taskId);
    tasks = tasks.filter((task) => task.id !== taskId);
    return boardResponseOf();
}

/** POST tasks/archive-done: quita las tarjetas de «Listo»; regresa cuántas. */
export async function archiveDoneTasks() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const archived = tasks.filter((task) => task.columnId === DONE_COLUMN_ID).length;
    tasks = tasks.filter((task) => task.columnId !== DONE_COLUMN_ID);
    return {...boardResponseOf(), archived};
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
    tasks = markCompletion(moveCard(tasks, {cardId, toColumnId, toIndex}), cardId);
    return boardResponseOf();
}

/** El día en que se terminó: lo pone al llegar a «Listo» y lo borra al salir. */
function markCompletion(allTasks, taskId) {
    return allTasks.map((task) => {
        if (task.id !== taskId) {
            return task;
        }
        if (task.columnId === DONE_COLUMN_ID) {
            return {...task, completedAt: task.completedAt ?? isoDateInDays(0)};
        }
        return {...task, completedAt: null};
    });
}

/** POST tasks/{id}/complete: la tarea pasa arriba de «Listo» con el día de hoy. */
export async function completeTask(taskId) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    findTaskOrFail(taskId);
    tasks = markCompletion(moveCard(tasks, {cardId: taskId, toColumnId: DONE_COLUMN_ID, toIndex: 0}), taskId);
    return boardResponseOf();
}

/** POST tasks/{id}/reopen: la tarea regresa arriba de «Por hacer» y pierde su día de terminada. */
export async function reopenTask(taskId) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    findTaskOrFail(taskId);
    tasks = markCompletion(moveCard(tasks, {cardId: taskId, toColumnId: TODO_COLUMN_ID, toIndex: 0}), taskId);
    return boardResponseOf();
}
