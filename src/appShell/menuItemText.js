// Los textos de una entrada del menú y de la persona en la barra, ya listos para pintarse.
//
// Una entrada del menú puede traer su texto escrito (label, description, section) o la llave para traducirlo (labelKey,
// descriptionKey, sectionKey): con llave, cambia de idioma junto con la app.
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (menuItemText.test.js).

/**
 * El nombre de una entrada del menú.
 *
 * @param {{label?: string, labelKey?: string}} menuItem
 * @param {(key: string) => string} t el traductor de la pantalla
 * @returns {string}
 */
export function menuItemLabelOf(menuItem, t) {
    return menuItem.label ?? (menuItem.labelKey ? t(menuItem.labelKey) : '');
}

/**
 * Para qué sirve una entrada (para las tarjetas de un inicio).
 *
 * @param {{description?: string, descriptionKey?: string}} menuItem
 * @param {(key: string) => string} t
 * @returns {string|undefined}
 */
export function menuItemDescriptionOf(menuItem, t) {
    return menuItem.description ?? (menuItem.descriptionKey ? t(menuItem.descriptionKey) : undefined);
}

/**
 * El título de la sección del menú lateral donde va la entrada («Operación», «Administración»).
 *
 * @param {{section?: string, sectionKey?: string}} menuItem
 * @param {(key: string) => string} t
 * @returns {string|undefined}
 */
export function menuItemSectionOf(menuItem, t) {
    return menuItem.section ?? (menuItem.sectionKey ? t(menuItem.sectionKey) : undefined);
}

/**
 * Las entradas juntas por sección: las secciones salen en el orden en que aparece su primera entrada, y adentro cada
 * entrada en su orden. Las entradas sin sección forman su propio bloque sin título.
 *
 * Por qué por título y no por vecindad: con vecindad, dos módulos de la misma sección con un `order` de otra en medio
 * partían la sección en dos («Interfaz» salía dos veces). Así cada módulo dice su sección sin coordinar números.
 *
 * @param {object[]} menuItems lo que regresa composeMenu
 * @param {(key: string) => string} t
 * @returns {Array<{title: string|undefined, menuItems: object[]}>}
 */
export function menuSectionsOf(menuItems, t) {
    const sectionsByTitle = new Map();
    menuItems.forEach((menuItem) => {
        const title = menuItemSectionOf(menuItem, t);
        if (!sectionsByTitle.has(title)) {
            sectionsByTitle.set(title, {title, menuItems: []});
        }
        sectionsByTitle.get(title).menuItems.push(menuItem);
    });
    return [...sectionsByTitle.values()];
}

// las partículas de los nombres («María de la Luz», «Juan van Dijk»): no son iniciales. Con ellas, «Usuario de Ejemplo»
// salía «UD» en el avatar.
const NAME_PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'da', 'das', 'do', 'dos', 'di', 'du', 'van', 'von', 'der', 'le']);

/**
 * Las iniciales para el avatar: «Ana María López» → «AM», «Usuario de Ejemplo» → «UE». Sin nombre, «?».
 *
 * @param {string|null|undefined} fullName
 * @returns {string}
 */
export function initialsOf(fullName) {
    const words = String(fullName ?? '').trim().split(/\s+/).filter((word) => Boolean(word) && !NAME_PARTICLES.has(word.toLowerCase()));
    return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? '').join('') || '?';
}

/**
 * Las props de la liga de una entrada: el router para una pantalla de la app (to) y una dirección normal para otro sistema
 * (href: el sistema que ya existía, otra app de la empresa). Con href la página se carga completa, como cualquier liga.
 *
 * @param {{to?: string, href?: string}} menuItem
 * @param {import('react').ElementType} RouterLink el Link de la navegación del proyecto
 * @returns {{component: import('react').ElementType|string, to?: string, href?: string}}
 */
export function menuLinkPropsOf(menuItem, RouterLink) {
    return menuItem.href ? {component: 'a', href: menuItem.href} : {component: RouterLink, to: menuItem.to};
}
