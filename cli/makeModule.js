// calcita make:module <nombre>: un módulo nuevo con la forma de los demás, en su carpeta y sin tocar ningún otro archivo:
// su entrada en el menú (menu.js), su ruta (routes.js), su pantalla con la lista y el formulario para agregar, su API (la
// única puerta al servidor), sus textos en español e inglés y su servidor de mentira (src/fakeServer).
//
//   calcita make:module purchase-orders
//     → src/modules/purchaseOrders/… y src/fakeServer/purchaseOrdersServer.js, en /purchase-orders
//
// El menú, las rutas y los textos se descubren solos (import.meta.glob): el módulo sale en la app sin más ediciones.
//
// Funciones de node, sin React: function (regla de la casa).
import {access, readFile, readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {makeForm} from './makeForm.js';
import {isValidName, namesOf} from './names.js';
import {CliError, copyTemplateFolder} from './templateFiles.js';

const MODULE_TEMPLATES = fileURLToPath(new URL('templates/module/', import.meta.url));
const MODULE_SERVER_TEMPLATES = fileURLToPath(new URL('templates/moduleServer/', import.meta.url));
// el orden de un módulo nuevo: después del último, con espacio para meter otros en medio
const ORDER_STEP = 10;
const ORDER_PATTERN = /export const order = (\d+);/;

/**
 * El lugar en el menú para el módulo nuevo: el siguiente múltiplo de 10 después del mayor que ya hay.
 *
 * @param {string} projectRoot
 * @returns {Promise<number>}
 */
async function nextMenuOrderOf(projectRoot) {
    const modulesFolder = join(projectRoot, 'src', 'modules');
    const orders = [];
    for (const moduleFolder of await readdir(modulesFolder)) {
        try {
            const match = ORDER_PATTERN.exec(await readFile(join(modulesFolder, moduleFolder, 'menu.js'), 'utf8'));
            if (match) {
                orders.push(Number(match[1]));
            }
        } catch {
            // un módulo sin menu.js (las pantallas de entrar): no cuenta
        }
    }
    return (Math.floor(Math.max(0, ...orders) / ORDER_STEP) + 1) * ORDER_STEP;
}

/**
 * @param {object} options
 * @param {string} options.projectRoot
 * @param {string} options.moduleName como lo escribió la persona
 * @param {{es: string, en: string}} options.labels su nombre en pantalla
 * @returns {Promise<{written: string[], path: string}>} las rutas escritas (relativas al proyecto) y su dirección en la app
 */
export async function makeModule({projectRoot, moduleName, labels}) {
    if (!isValidName(moduleName ?? '')) {
        throw new CliError('Falta el nombre del módulo, en inglés y sin acentos (p. ej. purchase-orders).');
    }
    const names = namesOf(moduleName);
    const moduleFolder = join(projectRoot, 'src', 'modules', names.camel);
    const exists = await access(moduleFolder).then(() => true, () => false);
    if (exists) {
        throw new CliError(`Ya existe src/modules/${names.camel}; no se tocó nada.`);
    }

    const values = {
        name: names.camel, Name: names.pascal, NAME: names.constant, kebab: names.kebab,
        LABEL_ES: labels.es, LABEL_EN: labels.en, ORDER: String(await nextMenuOrderOf(projectRoot)),
    };
    const moduleFiles = await copyTemplateFolder({templateFolder: MODULE_TEMPLATES, targetFolder: moduleFolder, values});
    const serverFiles = await copyTemplateFolder({templateFolder: MODULE_SERVER_TEMPLATES, targetFolder: join(projectRoot, 'src', 'fakeServer'), values});
    // su formulario, con la librería del proyecto: el mismo que arma «calcita make:form»
    const formFiles = await makeForm({projectRoot, moduleName: names.camel, formName: `${names.pascal}Form`});

    return {
        written: [...moduleFiles.map((path) => `src/modules/${names.camel}/${path}`), ...serverFiles.map((path) => `src/fakeServer/${path}`), ...formFiles],
        path: `/${names.kebab}`,
    };
}
