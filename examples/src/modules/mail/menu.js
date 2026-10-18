// La entrada de la bandeja en el menú, en «Trabajo en equipo».
import MailOutlineIcon from '@mui/icons-material/MailOutline';

import {MAIL_PATH} from '@/modules/mail/routes.js';

export const order = 27;

export function buildMenuItem() {
    return {
        to: MAIL_PATH,
        labelKey: 'mail:menu.label',
        descriptionKey: 'mail:menu.description',
        sectionKey: 'shell:sections.workspace',
        Icon: MailOutlineIcon,
    };
}
