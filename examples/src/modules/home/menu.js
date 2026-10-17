// La entrada del módulo en el menú de la app (composeMenu del framework la descubre sola: no hay lista central que editar).
//
// access es la regla de quién lo ve; la misma protege sus rutas (withAccess en app/appRouter.jsx).
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

import {APP_PATHS} from '@/core';

export const order = 1;

// sin access: lo ve cualquiera con sesión

export function buildMenuItem() {
    return {
        to: APP_PATHS.home,
        labelKey: 'home:menu.label',
        descriptionKey: 'home:menu.description',
        Icon: HomeOutlinedIcon,
    };
}
