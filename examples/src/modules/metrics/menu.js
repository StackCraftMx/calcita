// La entrada del módulo en el menú de la app (composeMenu del framework la descubre sola: no hay lista central que editar).
//
// access es la regla de quién lo ve; la misma protege sus rutas (withAccess en app/appRouter.jsx).
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';

import {APP_PATHS} from '@/core';

export const order = 60;

export const access = {ability: 'metrics.view'};

// los permisos que pide este módulo: la pantalla de perfiles los junta con los de los demás (composePermissionGroups)
export const permissions = [
    {key: 'metrics.view', labelKey: 'metrics:permissions.view', descriptionKey: 'metrics:permissions.viewDescription'},
];

export function buildMenuItem() {
    return {
        to: APP_PATHS.metrics,
        labelKey: 'metrics:menu.label',
        descriptionKey: 'metrics:menu.description',
        sectionKey: 'shell:sections.interface',
        // el numerito o la palabra a la derecha del nombre (aquí fijo; en una app real, lo que diga el servidor)
        badge: 'Nuevo',
        Icon: InsightsOutlinedIcon,
    };
}
