// El menú de la app: COMPUESTO, no escrito.
//
// Cada módulo declara su entrada en su propia carpeta (modules/<módulo>/menu.js) y aquí solo se juntan, se filtran por
// permiso y se ordenan. Módulo nuevo con menú = cero ediciones en una lista central, y nadie pisa la entrada del vecino al
// resolver un merge.
//
// Forma de un menu.js:
//   export const order = 10;                           // posición en el menú (los que no dicen, al final)
//   export const access = {ability: 'orders.view'};    // la regla de quién lo ve (accessRules.js); sin ella, todos
//   export function buildMenuItem(context) {           // o buildMenuItems (en plural) para dos o más entradas
//       return {
//           to: '/orders', label: 'Pedidos',           // o labelKey: 'orders:menu.label' (se traduce al pintarse)
//           description: 'Todos los pedidos…',         // o descriptionKey: para las tarjetas de un inicio
//           section: 'Operación',                      // o sectionKey: el título de la sección del menú lateral
//           Icon: ReceiptLongOutlinedIcon,
//           badge: 3,                                  // opcional: el numerito o la palabra a la derecha («Nuevo»)
//           mobileTab: true,                           // opcional: va en la barra de pestañas del teléfono (mobileTabsOf)
//           badgeKey: 'pendingPayment',                 // opcional: su conteo llega del servidor (AppLayout menuBadges)
//           matchPrefix: '/orders',                    // opcional: desde dónde se marca activo (por omisión, to)
//           access: {...},                             // opcional: una entrada con otra regla que su módulo
//           children: [{to: '/orders/returns', label: 'Devoluciones', access: {...}}],   // opcional: un submenú
//       };
//   }
// buildMenuItem puede regresar null (una pantalla apagada por configuración): no sale. Un submenú se filtra igual que las
// entradas, y si se queda sin hijas (y no lleva a ninguna pantalla propia) no sale.
//
// El proyecto le pasa los módulos con el glob de Vite (o una lista, en otro empaquetador):
//   const menuModules = import.meta.glob('@/modules/*/menu.js', {eager: true});
//   const menuItems = composeMenu(menuModules, {canAccess, context: {session}});
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (appMenu.test.js).

// la posición de un módulo que no dice su order: al final
const LAST_ORDER = 1000;

// la dirección del inicio: la primera miga
const HOME_PATH = '/';

/**
 * Las entradas del menú que le tocan a esta sesión, ordenadas.
 *
 * @param {Record<string, object>|object[]} menuModules lo que regresa import.meta.glob(..., {eager: true}) o una lista
 * @param {object} [options]
 * @param {(access: object|undefined) => boolean} [options.canAccess] la regla de permisos del proyecto; sin ella, todos
 * @param {object} [options.context] lo que reciben buildMenuItem(s): la sesión, la configuración…
 * @returns {object[]} las entradas, cada una con to y su texto
 */
export function composeMenu(menuModules, {canAccess = () => true, context = {}} = {}) {
    const modules = Array.isArray(menuModules) ? menuModules : Object.values(menuModules);
    return modules
        .filter((menuModule) => canAccess(menuModule.access))
        .sort((first, second) => (first.order ?? LAST_ORDER) - (second.order ?? LAST_ORDER))
        .flatMap((menuModule) => menuModule.buildMenuItems?.(context) ?? [menuModule.buildMenuItem?.(context)])
        .filter((menuItem) => Boolean(menuItem) && canAccess(menuItem.access))
        .map((menuItem) => withAllowedChildren(menuItem, canAccess))
        .filter((menuItem) => Boolean(menuItem.to) || menuItem.children?.length > 0);
}

/**
 * La entrada con solo las hijas que la sesión puede ver (una entrada sin submenú se queda igual).
 *
 * @param {object} menuItem
 * @param {(access: object|undefined) => boolean} canAccess
 * @returns {object}
 */
function withAllowedChildren(menuItem, canAccess) {
    if (!Array.isArray(menuItem.children)) {
        return menuItem;
    }
    return {...menuItem, children: menuItem.children.filter((child) => Boolean(child) && canAccess(child.access))};
}

/**
 * Las entradas que llevan a una pantalla, con las de los submenús (las de arriba primero).
 *
 * @param {object[]} menuItems lo que regresa composeMenu
 * @returns {object[]}
 */
export function screenMenuItemsOf(menuItems) {
    return menuItems.flatMap((menuItem) => [menuItem, ...(menuItem.children ?? [])]).filter((menuItem) => Boolean(menuItem.to));
}

/**
 * ¿Está la entrada dentro de un submenú?
 *
 * @param {object[]} menuItems
 * @param {object} menuItem
 * @returns {boolean}
 */
function isChildMenuItem(menuItems, menuItem) {
    return menuItems.some((candidate) => candidate.children?.includes(menuItem));
}

/**
 * La entrada del menú de la pantalla abierta: la más específica gana (/orders/15 marca «Pedidos», no «Inicio»).
 *
 * @param {Array<{to: string, matchPrefix?: string}>} menuItems lo que regresa composeMenu
 * @param {string} pathname location.pathname
 * @returns {object|null}
 */
export function activeMenuItemOf(menuItems, pathname) {
    const matchingItems = screenMenuItemsOf(menuItems).filter((menuItem) => {
        const prefix = menuItem.matchPrefix ?? menuItem.to;
        // el inicio solo se marca en el inicio: todas las direcciones empiezan con '/'
        const isHome = prefix === HOME_PATH;
        return pathname === prefix || (!isHome && pathname.startsWith(`${prefix}/`));
    });
    matchingItems.sort((first, second) => {
        const lengthDifference = (second.matchPrefix ?? second.to).length - (first.matchPrefix ?? first.to).length;
        if (lengthDifference !== 0) {
            return lengthDifference;
        }
        // con el mismo camino (un submenú cuya primera hija lleva a donde mismo que él), gana la hija: es la pantalla
        return Number(isChildMenuItem(menuItems, second)) - Number(isChildMenuItem(menuItems, first));
    });
    return matchingItems[0] ?? null;
}

/**
 * El submenú que contiene a una entrada (para abrirlo y para las migas); null si la entrada está arriba.
 *
 * @param {object[]} menuItems lo que regresa composeMenu
 * @param {object|null} menuItem
 * @returns {object|null}
 */
export function parentMenuItemOf(menuItems, menuItem) {
    return menuItems.find((candidate) => candidate.children?.includes(menuItem)) ?? null;
}

/**
 * Las migas de la pantalla abierta, sacadas del menú: el inicio, el submenú (si lo hay) y la entrada activa.
 * En el inicio, o en una pantalla que no está en el menú, regresa solo lo que encuentra (una o ninguna).
 *
 * @param {object[]} menuItems lo que regresa composeMenu
 * @param {string} pathname location.pathname
 * @returns {object[]} entradas del menú, en orden
 */
export function menuBreadcrumbsOf(menuItems, pathname) {
    const activeItem = activeMenuItemOf(menuItems, pathname);
    if (!activeItem) {
        return [];
    }
    const homeItem = menuItems.find((menuItem) => menuItem.to === HOME_PATH) ?? null;
    const parentItem = parentMenuItemOf(menuItems, activeItem);
    return [homeItem, parentItem, activeItem].filter((menuItem, index, crumbs) => Boolean(menuItem) && crumbs.indexOf(menuItem) === index);
}

/**
 * El badge de una entrada del menú: el conteo que llegó del servidor por su badgeKey (lo pendiente de esa pantalla), la
 * suma de sus hijas si es un submenú (como las carpetas del iPhone), o el badge fijo de su menu.js («Nuevo»). Un conteo
 * en cero no se enseña: no hay nada pendiente.
 *
 *   menuBadgeOf({badgeKey: 'pendingPayment'}, {pendingPayment: 13})   // {content: 13, isCount: true}
 *
 * @param {object} menuItem una entrada de composeMenu
 * @param {Record<string, number>} [menuBadges] los conteos por badgeKey (el proyecto los pide a su servidor)
 * @returns {{content: number|string, isCount: boolean}|null}
 */
export function menuBadgeOf(menuItem, menuBadges = {}) {
    const countOf = (item) => {
        const count = item.badgeKey ? Number(menuBadges[item.badgeKey] ?? 0) : 0;
        return Number.isFinite(count) && count > 0 ? count : 0;
    };
    const ownCount = countOf(menuItem);
    const childrenCount = Array.isArray(menuItem.children) ? menuItem.children.reduce((total, child) => total + countOf(child), 0) : 0;
    const total = ownCount + childrenCount;
    if (total > 0) {
        return {content: total, isCount: true};
    }
    if (menuItem.badge !== undefined && menuItem.badge !== null && menuItem.badge !== '') {
        return {content: menuItem.badge, isCount: typeof menuItem.badge === 'number'};
    }
    return null;
}

// cuántas pestañas caben en la barra del teléfono, como las de Apple: hasta 5; si hay más entradas, 4 y «Más» con el resto
const MOBILE_TAB_LIMIT = 5;

/**
 * Las pestañas de la barra del teléfono y lo que va en «Más». Van las que el menu.js marca con mobileTab: true (en su
 * orden); si ninguna lo dice, las primeras. Con 5 o menos entradas van todas y no hay «Más».
 *
 * @param {object[]} menuItems lo que regresa composeMenu
 * @returns {{tabs: object[], more: object[]}}
 */
export function mobileTabsOf(menuItems) {
    if (menuItems.length <= MOBILE_TAB_LIMIT) {
        return {tabs: menuItems, more: []};
    }
    const marked = menuItems.filter((menuItem) => menuItem.mobileTab);
    const tabs = (marked.length > 0 ? marked : menuItems).slice(0, MOBILE_TAB_LIMIT - 1);
    return {tabs, more: menuItems.filter((menuItem) => !tabs.includes(menuItem))};
}
