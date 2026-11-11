// El índice de direcciones con nombre: cada módulo publica las suyas en su archivo (paths.js de las pantallas, uris.js de
// las del API) y el índice las junta, buscables por camino con dos puntos: pathOf('admin:clients:providerList').
//
// Por qué: cuando una pantalla tiene que llevar a la de OTRO módulo (el detalle de un cliente regresa a la lista de donde
// salió), sin el índice un módulo importaría al otro y dejarían de ser independientes (se borra uno y el otro no compila).
// No es una lista central que todos editan: el dueño de la pantalla es el dueño de su dirección y el índice se arma solo.
//
//   // src/app/appPaths.js — el glob tiene que ser un texto literal: Vite lo resuelve al compilar
//   export const {pathOf, allPaths} = createPathIndex(import.meta.glob('@/modules/**/paths.js', {eager: true}));
//
//   pathOf('admin:profile:detail', {groupId: 2, userId: 7675})               → '/admin/user/detail/2/7675'
//   pathOf('admin:profile:detail', {groupId: 2, userId: 7675, tab: 'docs'})  → '/admin/user/detail/2/7675?tab=docs'
//
// Lo que la ruta pide con dos puntos (:groupId) se sustituye; lo que sobra se va como consulta. Si el nombre no existe o falta
// una parte, TRUENA y dice qué sí hay: un `undefined` en una dirección manda a la persona a otra pantalla sin decir por qué
// (o a un 404 raro del API a los diez minutos de buscar).
//
// Lo mismo sirve para las direcciones del API (uris.js con export const uris = {...}): createPathIndex(glob, {exportName: 'uris'}).
//
// Los tramos del nombre van con dos puntos por omisión. Un proyecto que escribe sus nombres con punto, como ya pide sus
// textos ('admin.clients.providerList'), pasa {separator: '.'} y el índice busca y avisa con punto: no hay que traducir
// el nombre al entrar ni el aviso al salir. OJO: los dos puntos de la RUTA (/orders/:orderId) son otra cosa y no cambian.
//
// Funciones puras, no renderizan: function (regla de la casa). Pruebas en pathIndex.test.js.

// con lo que se separan los tramos del nombre si el proyecto no dice otro
const DEFAULT_SEPARATOR = ':';
// el camino de un módulo sale de su carpeta: …/modules/admin/clients/paths.js → ['admin', 'clients']
const DEFAULT_MODULE_PATTERN = /(?:^|\/)modules\/(.+)\/[^/]+$/;

/**
 * Le pone sus partes a una ruta: las que pide con dos puntos y, lo que sobre, la consulta. Los nulos y los vacíos no se
 * escriben.
 *
 * @param {string} route la ruta con sus :partes ('/orders/:orderId', ':page?' es opcional)
 * @param {Record<string, unknown>} [params]
 * @param {string} [name] cómo se llama, para decirlo si algo falta
 * @returns {string}
 * @throws {Error} si la ruta pide una parte obligatoria que no viene
 */
export function fillPath(route, params = {}, name = route) {
    const used = new Set();
    const filled = route.replace(/:([A-Za-z0-9_]+)\??/g, (whole, part) => {
        const value = params[part];
        if (value === undefined || value === null || value === '') {
            // la parte opcional (:page?) puede faltar; la obligatoria, no
            if (whole.endsWith('?')) {
                used.add(part);
                return '';
            }
            throw new Error(`La dirección «${name}» necesita ${part}. Se le dio: ${Object.keys(params).join(', ') || 'nada'}`);
        }
        used.add(part);
        return encodeURIComponent(String(value));
    // la parte opcional que faltó deja «//» o una diagonal al final; «https://» se respeta
    }).replace(/([^:])\/{2,}/g, '$1/').replace(/(.)\/+$/, '$1');

    // lo que sobra es la consulta: así una liga abre una pestaña (?tab=docs) o una lista ya filtrada
    const query = new URLSearchParams(
        Object.entries(params)
            .filter(([key, value]) => !used.has(key) && value !== undefined && value !== null && value !== '')
            .map(([key, value]) => [key, String(value)]),
    );
    return query.size > 0 ? `${filled}?${query}` : filled;
}

/**
 * Mete lo de un módulo en el árbol, un tramo por nivel (admin/clients → {admin: {clients: …}}): el buscador baja nivel por
 * nivel, así que el árbol va anidado igual que se busca.
 */
function placeInTree(tree, steps, value) {
    let current = tree;
    for (const step of steps.slice(0, -1)) {
        current[step] = current[step] ?? {};
        current = current[step];
    }
    const last = steps[steps.length - 1];
    current[last] = {...(current[last] ?? {}), ...value};
}

/**
 * El índice de las direcciones que publica cada módulo.
 *
 * @param {Record<string, Record<string, unknown>>} modules lo que da import.meta.glob(..., {eager: true}): archivo → sus exports
 * @param {object} [options]
 * @param {string} [options.exportName] el export con las direcciones en cada archivo (por omisión 'paths'; para el API, 'uris')
 * @param {RegExp} [options.modulePattern] saca del nombre del archivo el camino del módulo (el primer grupo, con /)
 * @param {string} [options.separator] con qué se separan los tramos del nombre (por omisión ':'; con '.', 'admin.clients.list')
 * @returns {{pathOf: (name: string, params?: Record<string, unknown>) => string, allPaths: () => object}}
 * @throws {Error} si el separador viene vacío o trae una diagonal (la diagonal es de las rutas)
 */
export function createPathIndex(modules, {exportName = 'paths', modulePattern = DEFAULT_MODULE_PATTERN, separator = DEFAULT_SEPARATOR} = {}) {
    if (typeof separator !== 'string' || separator === '' || separator.includes('/')) {
        throw new Error(`separator «${separator}» no sirve: use un texto como ':' o '.', sin diagonales.`);
    }
    const tree = {};
    for (const [file, moduleExports] of Object.entries(modules)) {
        const published = moduleExports?.[exportName];
        // un archivo que no publica nada no entra al árbol
        if (!published) {
            continue;
        }
        const match = modulePattern.exec(file);
        if (!match) {
            throw new Error(`No sé de qué módulo es «${file}»: el archivo va dentro de modules/<módulo>/`);
        }
        placeInTree(tree, match[1].split('/'), published);
    }

    const pathOf = (name, params = {}) => {
        let current = tree;
        const walked = [];
        for (const step of name.split(separator)) {
            if (current === null || typeof current !== 'object' || current[step] === undefined) {
                const options = current && typeof current === 'object' ? Object.keys(current).join(', ') : '(nada)';
                throw new Error(`No hay una dirección llamada «${name}». En ${walked.join(separator) || 'el índice'} hay: ${options}`);
            }
            current = current[step];
            walked.push(step);
        }
        // quedarse a media rama da un grupo, no una dirección
        if (typeof current !== 'string') {
            throw new Error(`«${name}» no es una dirección sino un grupo. Dentro hay: ${Object.keys(current).join(', ')}`);
        }
        return fillPath(current, params, name);
    };

    return Object.freeze({pathOf, allPaths: () => tree});
}
