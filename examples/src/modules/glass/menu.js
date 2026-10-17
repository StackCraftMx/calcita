// La entrada del módulo en el menú de la app (composeMenu del framework la descubre sola: no hay lista central que editar).
import BlurOnIcon from '@mui/icons-material/BlurOn';

import {APP_PATHS} from '@/core';

export const order = 70;

// sin access: lo ve cualquiera con sesión

export function buildMenuItem() {
    return {
        to: APP_PATHS.glass,
        labelKey: 'glass:menu.label',
        descriptionKey: 'glass:menu.description',
        sectionKey: 'shell:sections.interface',
        Icon: BlurOnIcon,
    };
}
