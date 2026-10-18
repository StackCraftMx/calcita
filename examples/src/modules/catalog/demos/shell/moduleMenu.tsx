// src/modules/orders/menu.js: la entrada de UN módulo en el menú. Para agregar un módulo nuevo al menú, cree su carpeta en
// src/modules con un archivo como este; el marco lo encuentra solo y no hay que editar nada más.
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

// En qué lugar sale: el número menor va primero (Inicio suele ser 1)
export const order = 10;

// Quién lo ve: sin este permiso no sale en el menú y su ruta no se abre. Sin `access`, lo ve cualquiera con sesión.
// Otras formas: {anyOf: [...]}, {role: 'admin'}, {policy: 'ownsRecord'} (tabla de abajo)
export const access = {ability: 'orders.view'};

// Los permisos del módulo, para que aparezcan en la pantalla de perfiles y se puedan dar o quitar
export const permissions = [
    {key: 'orders.view', labelKey: 'orders:permissions.view'},
    {key: 'orders.cancel', labelKey: 'orders:permissions.cancel'},
];

// Cómo se ve en el menú
export function buildMenuItem() {
    return {
        to: '/orders',                                       // a dónde lleva
        labelKey: 'orders:menu.label',                       // su nombre (o label: 'Pedidos' sin traducción)
        descriptionKey: 'orders:menu.description',           // una línea que explica (sale en las tarjetas del inicio)
        sectionKey: 'shell:sections.operation',              // en qué sección del menú va (las juntan por este título)
        badgeKey: 'orders',                                  // qué numerito lleva: el de su backend con esta llave
        Icon: ReceiptLongOutlinedIcon,
        children: [                                          // con hijas sale como submenú
            {to: '/orders', labelKey: 'orders:menu.all'},
            {to: '/orders/returns', labelKey: 'orders:menu.returns', access: {ability: 'orders.returns'}},
        ],
    };
}
