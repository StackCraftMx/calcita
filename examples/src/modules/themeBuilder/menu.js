// La entrada del configurador de tema en el menú (composeMenu la descubre sola).
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';

import {APP_PATHS} from '@/core';

export const order = 72;

// sin access: lo ve cualquiera con sesión
export function buildMenuItem() {
    return {
        to: APP_PATHS.themeBuilder,
        labelKey: 'themeBuilder:menu.label',
        descriptionKey: 'themeBuilder:menu.description',
        sectionKey: 'shell:sections.interface',
        Icon: PaletteOutlinedIcon,
        badge: 'Nuevo',
    };
}
