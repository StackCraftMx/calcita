// La entrada del calendario de entregas en el menú, en «Trabajo en equipo».
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

import {APPOINTMENTS_PATH} from '@/modules/appointments/routes.js';

export const order = 25;

export function buildMenuItem() {
    return {
        to: APPOINTMENTS_PATH,
        labelKey: 'appointments:menu.label',
        descriptionKey: 'appointments:menu.description',
        sectionKey: 'shell:sections.workspace',
        Icon: CalendarMonthOutlinedIcon,
    };
}
