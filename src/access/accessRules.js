// Quién puede ver qué: el menú, las rutas y los botones preguntan lo mismo con la misma regla («access»).
//
// El framework NO sabe de roles ni de permisos: cada proyecto declara sus reglas como le acomode y le da a ToolkitProvider
// una función canAccess(access) → boolean. Para no programarla cada vez, createAccessChecker la arma con las formas de
// siempre, y se pueden combinar (todas las que vengan tienen que cumplirse):
//
//   RBAC por permisos (las `abilities` que manda la sesión):
//     {ability: 'orders.view'}                  ese permiso
//     {anyOf: ['orders.view', 'orders.admin']}  alguno de esos
//     {allOf: ['orders.view', 'reports.view']}  todos
//   RBAC por roles:
//     {role: 'admin'}  ·  {anyRole: ['admin', 'supervisor']}
//   ABAC (atributos: dueño del registro, organización, horario…):
//     {policy: 'ownsRecord'}  ·  {policies: ['ownsRecord', 'sameOrganization']}   políticas con nombre, que el proyecto
//                                                                                  define una vez en createAccessChecker
//     {check: (context) => context.user.id === record.ownerId}                    la regla escrita ahí mismo
//
// Sin access (undefined) lo ve cualquiera con sesión. Sin sesión o sin la lista, nada: falla CERRADO.
//
// OJO: esto solo decide lo que se PINTA. Lo que cada quien puede hacer lo vuelve a decidir el backend en cada petición;
// cambiar esto en el navegador no abre nada.
//
// Funciones puras, sin React: function (regla de la casa). Se prueban con node --test (accessRules.test.js).

/**
 * El canAccess de un proyecto que no usa permisos: sin access lo ve cualquiera; con access, nadie (falla cerrado, para
 * que una regla escrita y sin conectar se note en lugar de abrir todo).
 *
 * @param {object|undefined|null} access
 * @returns {boolean}
 */
export function allowOnlyUnrestricted(access) {
    return !access;
}

/**
 * Arma el canAccess(access) del proyecto con sus permisos, sus roles y sus políticas.
 *
 * @param {object} [options]
 * @param {string[]} [options.abilities] los permisos de la sesión (p. ej. los `abilities` que manda el backend)
 * @param {string[]} [options.roles] los roles de la sesión
 * @param {Record<string, (context: any) => boolean>} [options.policies] las políticas con nombre (ABAC); reciben el context
 * @param {object} [options.context] lo que reciben las políticas y los check (la persona, su organización…)
 * @returns {(access: object|undefined|null) => boolean}
 */
export function createAccessChecker({abilities = [], roles = [], policies = {}, context = {}} = {}) {
    const abilitySet = new Set(abilities);
    const roleSet = new Set(roles);

    const passesPolicy = (policyName) => {
        const policy = policies[policyName];
        // una política que nadie definió es un error de configuración: truena en vez de abrir o cerrar en silencio
        if (typeof policy !== 'function') {
            throw new Error(`La política «${policyName}» no está definida en createAccessChecker({policies})`);
        }
        return Boolean(policy(context));
    };

    return (access) => {
        if (!access) {
            return true;
        }
        if (access.ability && !abilitySet.has(access.ability)) {
            return false;
        }
        if (access.anyOf && !access.anyOf.some((ability) => abilitySet.has(ability))) {
            return false;
        }
        if (access.allOf && !access.allOf.every((ability) => abilitySet.has(ability))) {
            return false;
        }
        if (access.role && !roleSet.has(access.role)) {
            return false;
        }
        if (access.anyRole && !access.anyRole.some((role) => roleSet.has(role))) {
            return false;
        }
        if (access.policy && !passesPolicy(access.policy)) {
            return false;
        }
        if (access.policies && !access.policies.every(passesPolicy)) {
            return false;
        }
        if (access.check && !access.check(context)) {
            return false;
        }
        return true;
    };
}
