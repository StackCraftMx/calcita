// La entrada del tablero de tareas en el menú, en «Trabajo en equipo».
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';

import {TASKS_PATH} from '@/modules/tasks/routes.js';

export const order = 26;

export function buildMenuItem() {
    return {
        to: TASKS_PATH,
        labelKey: 'tasks:menu.label',
        descriptionKey: 'tasks:menu.description',
        sectionKey: 'shell:sections.workspace',
        Icon: ViewKanbanOutlinedIcon,
    };
}
