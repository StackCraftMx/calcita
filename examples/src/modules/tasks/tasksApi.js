// Las llamadas del tablero de tareas, con los datos ya en la forma de la pantalla (camelCase). Aquí iría axios; en los
// ejemplos van al servidor de mentira, con la misma forma. Cada llamada que cambia algo regresa el tablero como quedó.
//
// Funciones que no renderizan: function (regla de la casa).
import {
    TASK_PRIORITIES, archiveDoneTasks, completeTask, createTask, deleteTask, getTaskBoard, moveTask, reopenTask, updateTask,
} from '@/fakeServer/tasksServer.js';

export {TASK_PRIORITIES};

/** El tablero del API a la forma de la pantalla: columnas, tareas (con sus personas) y quién está dentro. */
function boardOf(response) {
    const peopleById = new Map(response.people.map((person) => [person.id, person]));
    return {
        columns: response.columns.map((column) => ({...column, limit: column.limit ?? undefined})),
        people: response.people,
        signedInUserId: response.signed_in_user_id,
        tasks: response.tasks.map((task) => ({
            id: task.id, columnId: task.column_id, title: task.title, description: task.description, tagNames: task.tags,
            priority: task.priority, assigneeIds: task.assignee_ids, assignees: task.assignee_ids.map((id) => peopleById.get(id)).filter(Boolean),
            dueDate: task.due_date, checklistItems: task.checklist, comments: task.comments, attachments: task.attachments,
            completed: Boolean(task.completed_at), completedAt: task.completed_at,
        })),
    };
}

export const loadTaskBoard = async (signal) => boardOf(await getTaskBoard(signal));
export const addTask = async (newTask) => boardOf(await createTask(newTask));
/** Los campos que cambiaron, en camelCase (title, description, tags, priority, assigneeIds, dueDate, checklist). */
export const saveTask = async (taskId, changes) => boardOf(await updateTask(taskId, changes));
export const removeTask = async (taskId) => boardOf(await deleteTask(taskId));
export const archiveDone = async () => {
    const response = await archiveDoneTasks();
    return {board: boardOf(response), archived: response.archived};
};
/** Terminar (pasa a «Listo») o reabrir (regresa a «Por hacer») una tarea. */
export const saveCompletion = async (taskId, completed) => boardOf(await (completed ? completeTask(taskId) : reopenTask(taskId)));
/** Guarda la movida; regresa el tablero como quedó en el servidor. */
export const saveMove = async (move) => boardOf(await moveTask(move));
