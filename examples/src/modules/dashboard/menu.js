// La entrada del módulo en el menú de la app (composeMenu del framework la descubre sola: no hay lista central que editar).
//
// access es la regla de quién lo ve; la misma protege sus rutas (withAccess en app/appRouter.jsx). permissions son los
// permisos que este módulo pide: la pantalla de perfiles los junta con los de los demás (composePermissionGroups).
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';

import {APP_PATHS} from '@/core';

// justo debajo de «Inicio», sin sección: es lo primero que se mira al entrar
export const order = 2;

export const access = {ability: 'dashboard.view'};

export const permissions = [
    {key: 'dashboard.view', labelKey: 'dashboard:permissions.view', descriptionKey: 'dashboard:permissions.viewDescription'},
];

export function buildMenuItem() {
    return {
        to: APP_PATHS.dashboard,
        labelKey: 'dashboard:menu.label',
        descriptionKey: 'dashboard:menu.description',
        Icon: SpaceDashboardOutlinedIcon,
    };
}
