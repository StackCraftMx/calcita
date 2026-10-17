// La lógica de la pantalla de perfiles y permisos (PermissionMatrix), sin React: cuántos permisos de un grupo tiene un
// perfil, y prender o apagar un permiso o un grupo entero.
//
// Los permisos son los mismos textos que piden los menu.js y las rutas (access: {ability: 'orders.view'}). Cada módulo
// declara los suyos en su menu.js y composePermissionGroups los junta (un grupo por módulo, en el orden del menú): la
// pantalla de perfiles no tiene lista central que editar. Guardar la lista de permisos del perfil es cosa del backend.
//
//   // modules/orders/menu.js
//   export const permissions = [
//       {key: 'orders.view', labelKey: 'orders:permissions.view', descriptionKey: 'orders:permissions.viewDescription'},
//       {key: 'orders.cancel', labelKey: 'orders:permissions.cancel'},
//   ];
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (permissionGroups.test.js).

// la posición de un módulo que no dice su order: al final (la misma regla que composeMenu)
const LAST_ORDER = 1000;

/**
 * Los grupos de permisos que declaran los módulos en su menu.js (`export const permissions`), uno por módulo y en el orden
 * del menú, con el nombre de su entrada del menú como título del grupo.
 *
 * @param {Record<string, object>|object[]} menuModules lo que regresa import.meta.glob(..., {eager: true}) o una lista
 * @param {(key: string, values?: object) => string} t el traductor (para las llaves labelKey y descriptionKey)
 * @returns {Array<{key: string, label: string, permissions: Array<{key: string, label: string, description?: string}>}>}
 */
export function composePermissionGroups(menuModules, t) {
    const modules = Array.isArray(menuModules) ? menuModules : Object.values(menuModules);
    return modules
        .filter((menuModule) => Array.isArray(menuModule.permissions) && menuModule.permissions.length > 0)
        .sort((first, second) => (first.order ?? LAST_ORDER) - (second.order ?? LAST_ORDER))
        .map((menuModule) => {
            const menuItem = menuModule.buildMenuItem?.({}) ?? {};
            return {
                key: menuItem.to ?? menuModule.permissions[0].key,
                label: menuItem.label ?? t(menuItem.labelKey),
                permissions: menuModule.permissions.map((permission) => ({
                    key: permission.key,
                    label: permission.label ?? t(permission.labelKey),
                    description: permission.description ?? (permission.descriptionKey ? t(permission.descriptionKey) : undefined),
                })),
            };
        });
}

/**
 * Cuántos permisos del grupo están dados.
 *
 * @param {{permissions: Array<{key: string}>}} group
 * @param {string[]} granted los permisos del perfil
 * @returns {{grantedCount: number, total: number, isAll: boolean, isSome: boolean}}
 */
export function groupStateOf(group, granted) {
    const grantedSet = new Set(granted);
    const grantedCount = group.permissions.filter((permission) => grantedSet.has(permission.key)).length;
    const total = group.permissions.length;
    return {grantedCount, total, isAll: total > 0 && grantedCount === total, isSome: grantedCount > 0 && grantedCount < total};
}

/**
 * Prende o apaga un permiso. Lo demás se queda en su orden; uno nuevo va al final.
 *
 * @param {string[]} granted
 * @param {string} permissionKey
 * @param {boolean} shouldGrant
 * @returns {string[]} la lista nueva (no cambia la de entrada)
 */
export function withPermission(granted, permissionKey, shouldGrant) {
    if (shouldGrant) {
        return granted.includes(permissionKey) ? [...granted] : [...granted, permissionKey];
    }
    return granted.filter((key) => key !== permissionKey);
}

/**
 * Prende o apaga todos los permisos de un grupo. Los que ya estaban se quedan en su lugar; los que faltan van al final.
 *
 * @param {string[]} granted
 * @param {{permissions: Array<{key: string}>}} group
 * @param {boolean} shouldGrant
 * @returns {string[]}
 */
export function withPermissionGroup(granted, group, shouldGrant) {
    const groupKeys = new Set(group.permissions.map((permission) => permission.key));
    if (shouldGrant) {
        const missing = group.permissions.map((permission) => permission.key).filter((key) => !granted.includes(key));
        return [...granted, ...missing];
    }
    return granted.filter((key) => !groupKeys.has(key));
}
