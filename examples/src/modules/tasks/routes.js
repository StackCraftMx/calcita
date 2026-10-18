// La ruta del tablero de tareas. La pantalla viaja en su propio archivo (lazy).
export const TASKS_PATH = '/tasks';

export const routes = [
    {path: TASKS_PATH, lazy: async () => ({Component: (await import('@/modules/tasks/TasksPage.jsx')).TasksPage})},
];
