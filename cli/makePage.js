// calcita make:page <módulo> <Pantalla>: otra pantalla dentro de un módulo: el componente, sus textos y su ruta (se agrega
// a routes.js del módulo, con su constante _PATH).
//
//   calcita make:page contacts ContactDetail
//     → src/modules/contacts/ContactDetailPage.jsx y contactDetailPageTexts.js, en /contacts/contact-detail
//
// Si routes.js ya no tiene la forma de la plantilla (alguien lo cambió), no se adivina: se dice qué renglones agregar.
//
// Funciones de node, sin React: function (regla de la casa).
import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {existingModuleOf} from './makeForm.js';
import {isValidName, namesOf, withoutSuffixWord} from './names.js';
import {CliError, copyTemplateFolder, insertAfterLastMatch, insertIntoArray} from './templateFiles.js';

const PAGE_TEMPLATES = fileURLToPath(new URL('templates/page/', import.meta.url));
const PATH_CONSTANT_LINE = /^export const \w+_PATH = '([^']*)';$/m;
const ROUTES_DECLARATION = 'export const routes = [';

/**
 * @param {object} options
 * @param {string} options.projectRoot
 * @param {string} options.moduleName
 * @param {string} options.pageName «ContactDetail» o «ContactDetailPage»
 * @param {{es: string, en: string}} options.labels su título en pantalla
 * @returns {Promise<{written: string[], path: string, manualLines: string[]|null}>} manualLines: los renglones que hay
 *     que agregar a mano a routes.js si no se pudo
 */
export async function makePage({projectRoot, moduleName, pageName, labels}) {
    const {folder, names: moduleNames} = await existingModuleOf(projectRoot, moduleName);
    if (!isValidName(pageName ?? '')) {
        throw new CliError('Falta el nombre de la pantalla, en inglés y sin acentos (p. ej. ContactDetail).');
    }
    const pageNames = namesOf(withoutSuffixWord(pageName, 'page'));
    const routesFile = join(folder, 'routes.js');
    const routesText = await readFile(routesFile, 'utf8').catch(() => {
        throw new CliError(`El módulo ${moduleNames.camel} no tiene routes.js.`);
    });
    // la dirección del módulo (su primera constante _PATH) y la de la pantalla, debajo
    const modulePath = PATH_CONSTANT_LINE.exec(routesText)?.[1] ?? `/${moduleNames.kebab}`;
    const pagePath = `${modulePath.replace(/\/$/, '')}/${pageNames.kebab}`;

    const values = {
        module: moduleNames.camel, PageName: pageNames.pascal, pageName: pageNames.camel, PAGE_NAME: pageNames.constant,
        PAGE_LABEL_ES: labels.es, PAGE_LABEL_EN: labels.en,
    };
    const written = (await copyTemplateFolder({templateFolder: PAGE_TEMPLATES, targetFolder: folder, values}))
        .map((path) => `src/modules/${moduleNames.camel}/${path}`);

    const pathLine = `export const ${pageNames.constant}_PATH = '${pagePath}';`;
    const routeLine = `    {path: ${pageNames.constant}_PATH, lazy: async () => ({Component: (await import('@/modules/${moduleNames.camel}/${pageNames.pascal}Page.jsx')).${pageNames.pascal}Page})},`;
    const withPath = insertAfterLastMatch(routesText, PATH_CONSTANT_LINE, pathLine);
    const withRoute = withPath && insertIntoArray(withPath, ROUTES_DECLARATION, routeLine);
    if (!withRoute) {
        return {written, path: pagePath, manualLines: [pathLine, routeLine]};
    }
    await writeFile(routesFile, withRoute);
    written.push(`src/modules/${moduleNames.camel}/routes.js (se agregó su ruta)`);
    return {written, path: pagePath, manualLines: null};
}
