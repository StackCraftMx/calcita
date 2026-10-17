// La entrada del módulo en el menú de la app (composeMenu del framework la descubre sola: no hay lista central que editar).
//
// access es la regla de quién lo ve; la misma protege sus rutas (withAccess en app/appRouter.jsx). permissions son los
// permisos que este módulo pide: la pantalla de perfiles los junta con los de los demás (composePermissionGroups).
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

import {APP_PATHS} from '@/core';

export const order = 90;

export const access = {ability: 'profiles.manage'};

export const permissions = [
    {key: 'profiles.manage', labelKey: 'profiles:permissions.manage', descriptionKey: 'profiles:permissions.manageDescription'},
];

export function buildMenuItem() {
    return {
        to: APP_PATHS.profiles,
        labelKey: 'profiles:menu.label',
        descriptionKey: 'profiles:menu.description',
        sectionKey: 'shell:sections.admin',
        Icon: AdminPanelSettingsOutlinedIcon,
    };
}
