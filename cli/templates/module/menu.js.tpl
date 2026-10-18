// La entrada de __LABEL_ES__ en el menú (composeMenu la descubre sola: no hay una lista central que editar).
//
// access es la regla de quién lo ve; la misma protege sus rutas (withAccess en app/appRouter.jsx). Sin access, lo ve
// cualquiera que entre. Por ejemplo, solo con el permiso de verlo: export const access = {ability: '__name__.view'};
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';

import {__NAME___PATH} from '@/modules/__name__/routes.js';

// el lugar en el menú: los números más chicos van arriba
export const order = __ORDER__;

export function buildMenuItem() {
    return {
        to: __NAME___PATH,
        labelKey: '__name__:menu.label',
        descriptionKey: '__name__:menu.description',
        // el título de su sección en el menú (en app/shellTexts.js); sin sectionKey va arriba, sin sección
        sectionKey: 'shell:sections.operation',
        Icon: FolderOutlinedIcon,
    };
}
