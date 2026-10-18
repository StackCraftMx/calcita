// La entrada de Sucursales en el menú, en «Trabajo en equipo».
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';

import {BRANCHES_PATH} from '@/modules/branches/routes.js';

export const order = 24;

export function buildMenuItem() {
    return {
        to: BRANCHES_PATH,
        labelKey: 'branches:menu.label',
        descriptionKey: 'branches:menu.description',
        sectionKey: 'shell:sections.workspace',
        Icon: StorefrontOutlinedIcon,
    };
}
