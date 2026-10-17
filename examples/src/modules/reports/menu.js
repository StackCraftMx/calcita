// La entrada del módulo en el menú de la app (composeMenu del framework la descubre sola: no hay lista central que editar).
//
// access es la regla de quién lo ve; la misma protege sus rutas (withAccess en app/appRouter.jsx).
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import {APP_PATHS} from '@/core';

export const order = 50;

export const access = {ability: 'reports.download'};

// los permisos que pide este módulo: la pantalla de perfiles los junta con los de los demás (composePermissionGroups)
export const permissions = [
    {key: 'reports.download', labelKey: 'reports:permissions.download', descriptionKey: 'reports:permissions.downloadDescription'},
];

export function buildMenuItem() {
    return {
        to: APP_PATHS.reports,
        labelKey: 'reports:menu.label',
        descriptionKey: 'reports:menu.description',
        sectionKey: 'shell:sections.files',
        Icon: FileDownloadOutlinedIcon,
    };
}
