// Resolución del alias @/ = examples/src para node --test (pnpm test), el mismo alias que vite.config.js y jsconfig.json.
//
// Por qué: lo que se prueba sin navegador (el servidor de mentira, la suma de textos) importa por @/ como todo el
// proyecto. Vite entiende el alias; node no. Este hook se lo enseña SOLO a las pruebas; el build no lo usa.
//
// OJO: solo resuelve rutas, no transforma JSX. Una prueba no puede importar (ni directo ni en cadena) un .jsx; por eso
// lo que se prueba se escribe en .js sin componentes.
//
// Funciones del cargador de módulos de node: function (regla de la casa).
const SOURCE_URL = new URL('../src/', import.meta.url);

/**
 * Hook resolve de node:module: '@/fakeServer/serverPage.js' → file:///.../examples/src/fakeServer/serverPage.js.
 *
 * @param {string} specifier lo que viene en el import
 * @param {object} context contexto de node
 * @param {Function} nextResolve resolución por defecto
 */
export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
        return nextResolve(new URL(specifier.slice(2), SOURCE_URL).href, context);
    }
    return nextResolve(specifier, context);
}
