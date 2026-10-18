// La entrada del inicio en el menú (composeMenu la descubre sola: no hay una lista central que editar).
//
// Sin access: lo ve cualquiera que entre.
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

import {APP_PATHS} from '@/core';

export const order = 1;

export function buildMenuItem() {
    return {
        to: APP_PATHS.home,
        labelKey: 'home:menu.label',
        descriptionKey: 'home:menu.description',
        Icon: HomeOutlinedIcon,
    };
}
