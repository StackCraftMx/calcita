// modules/orders/menu.js: la entrada del módulo en el menú. composeMenu la descubre sola; el orden decide dónde sale, la
// sección la agrupa, access decide quién la ve (y protege sus rutas) y badgeKey dice qué numerito lleva. Con children sale
// como submenú. permissions: los permisos del módulo para la pantalla de perfiles.
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

export const order = 10;

export const access = {ability: 'orders.view'};

export const permissions = [
    {key: 'orders.view', labelKey: 'orders:permissions.view'},
    {key: 'orders.cancel', labelKey: 'orders:permissions.cancel'},
];

export function buildMenuItem() {
    return {
        to: '/orders',
        labelKey: 'orders:menu.label',
        descriptionKey: 'orders:menu.description',
        sectionKey: 'shell:sections.operation',
        badgeKey: 'orders',
        Icon: ReceiptLongOutlinedIcon,
        children: [
            {to: '/orders', labelKey: 'orders:menu.all'},
            {to: '/orders/returns', labelKey: 'orders:menu.returns', access: {ability: 'orders.returns'}},
        ],
    };
}
