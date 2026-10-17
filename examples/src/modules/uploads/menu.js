// La entrada del módulo en el menú de la app (composeMenu del framework la descubre sola: no hay lista central que editar).
//
// access es la regla de quién lo ve; la misma protege sus rutas (withAccess en app/appRouter.jsx).
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

import {APP_PATHS} from '@/core';

export const order = 40;

export const access = {ability: 'files.upload'};

// los permisos que pide este módulo: la pantalla de perfiles los junta con los de los demás (composePermissionGroups)
export const permissions = [
    {key: 'files.upload', labelKey: 'uploads:permissions.upload', descriptionKey: 'uploads:permissions.uploadDescription'},
];

export function buildMenuItem() {
    return {
        to: APP_PATHS.uploads,
        labelKey: 'uploads:menu.label',
        descriptionKey: 'uploads:menu.description',
        sectionKey: 'shell:sections.files',
        Icon: CloudUploadOutlinedIcon,
    };
}
