// La entrada del módulo en el menú de la app (composeMenu del framework la descubre sola: no hay lista central que editar).
//
// access es la regla de quién lo ve; la misma protege sus rutas (withAccess en app/appRouter.jsx).
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import {APP_PATHS, MENU_BADGE_KEYS} from '@/core';

export const order = 10;

export const access = {ability: 'orders.view'};

// los permisos que pide este módulo: la pantalla de perfiles los junta con los de los demás (composePermissionGroups)
export const permissions = [
    {key: 'orders.view', labelKey: 'orders:permissions.view', descriptionKey: 'orders:permissions.viewDescription'},
    {key: 'orders.cancel', labelKey: 'orders:permissions.cancel', descriptionKey: 'orders:permissions.cancelDescription'},
];

export function buildMenuItem() {
    return {
        to: APP_PATHS.orders,
        labelKey: 'orders:menu.label',
        descriptionKey: 'orders:menu.description',
        sectionKey: 'shell:sections.operation',
        Icon: ReceiptLongOutlinedIcon,
        // el numerito de los pedidos que esperan pago: el conteo llega del servidor (app/menuBadgesApi.js)
        badgeKey: MENU_BADGE_KEYS.pendingPayment,
    };
}
