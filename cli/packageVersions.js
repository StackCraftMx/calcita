// Las versiones exactas que pide el proyecto nuevo: las mismas con que se probó Calcita. Se leen del package.json del
// paquete (sus devDependencies), así hay UNA sola lista de versiones y no una copia aquí que se quede vieja.
//
// Funciones de node, sin React: function (regla de la casa). Pruebas en packageVersions.test.js.
import {readFile} from 'node:fs/promises';

// i18next no lo usa el paquete (su adaptador recibe la instancia del proyecto), así que no está en sus devDependencies.
// Versión con más de dos semanas publicada al escogerla: pnpm espera un día antes de instalar una recién salida
const VERSIONS_NOT_IN_PACKAGE = Object.freeze({i18next: '26.4.2'});

/**
 * El package.json de Calcita (el del CLI que corre). OJO: por ruta de archivo y no con import: el CLI se publica tal cual,
 * sin pasar por Vite, y node no lee JSON con import sin una bandera.
 *
 * @returns {Promise<{name: string, version: string, devDependencies: Record<string, string>}>}
 */
export async function calcitaPackageJson() {
    return JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
}

/**
 * La versión exacta de cada librería.
 *
 * @param {string[]} packageNames
 * @param {{devDependencies: Record<string, string>}} calcitaPackage
 * @returns {Record<string, string>}
 */
export function versionsOf(packageNames, calcitaPackage) {
    return Object.fromEntries(packageNames.map((packageName) => {
        const version = calcitaPackage.devDependencies?.[packageName] ?? VERSIONS_NOT_IN_PACKAGE[packageName];
        // guard clause: una librería sin versión es un error del CLI (alguien la quitó del paquete), no algo que se adivine
        if (!version) {
            throw new Error(`El CLI no sabe con qué versión de ${packageName} se probó Calcita`);
        }
        return [packageName, version];
    }));
}
