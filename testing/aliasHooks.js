// Resolución del alias @/ = resources/js para node --test (npm test), el mismo alias que vite.config.js y jsconfig.json.
//
// Por qué: los archivos puros que se prueban sin navegador (máquinas de XState, helpers) importan entre sí por @/ como
// todo el front. Vite entiende el alias; node no. Este hook de resolución se lo enseña SOLO a las pruebas; el build no
// lo usa.
//
// OJO: solo resuelve rutas, no transforma JSX. Una prueba no puede importar (ni directo ni en cadena) un .jsx ni el
// barril @/core, que trae componentes. Por eso lo que se prueba se escribe en .js sin componentes.
//
// Funciones puras del cargador de módulos de node: function (regla de la casa).
const RESOURCES_JS_URL = new URL('../src/', import.meta.url);

/**
 * Hook resolve de node:module: '@/sessionMachine.js' → file:///.../resources/js/sessionMachine.js.
 *
 * @param {string} specifier lo que viene en el import
 * @param {object} context contexto de node
 * @param {Function} nextResolve resolución por defecto
 */
export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
        return nextResolve(new URL(specifier.slice(2), RESOURCES_JS_URL).href, context);
    }
    return nextResolve(specifier, context);
}
