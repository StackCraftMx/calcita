// La entrada del módulo de documentos fiscales en el menú (composeMenu la descubre sola).
//
// access es la regla de quién lo ve; la misma protege sus rutas (withAccess en app/appRouter.jsx).
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import {APP_PATHS} from '@/core';

export const order = 42;

export const access = {ability: 'fiscal.manage'};

// los permisos que pide este módulo: la pantalla de perfiles los junta con los de los demás (composePermissionGroups)
export const permissions = [
    {key: 'fiscal.manage', labelKey: 'fiscal:permissions.manage', descriptionKey: 'fiscal:permissions.manageDescription'},
];

export function buildMenuItem() {
    return {
        to: APP_PATHS.fiscal,
        labelKey: 'fiscal:menu.label',
        descriptionKey: 'fiscal:menu.description',
        sectionKey: 'shell:sections.files',
        Icon: ReceiptLongOutlinedIcon,
    };
}
