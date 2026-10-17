// La entrada del módulo en el menú de la app (composeMenu del framework la descubre sola: no hay lista central que editar).
//
// access es la regla de quién lo ve; la misma protege sus rutas (withAccess en app/appRouter.jsx).
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';

import {APP_PATHS} from '@/core';

export const order = 30;

// sin access: lo ve cualquiera con sesión

export function buildMenuItem() {
    return {
        to: APP_PATHS.feedback,
        labelKey: 'feedback:menu.label',
        descriptionKey: 'feedback:menu.description',
        sectionKey: 'shell:sections.interface',
        Icon: NotificationsActiveOutlinedIcon,
    };
}
