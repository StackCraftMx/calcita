// calcita make:component <Componente> [--module <módulo>]: un componente nuevo.
//
//   - Sin --module va a src/core (lo usan dos o más módulos) y se agrega a la puerta de core (src/core/index.js): se
//     importa de '@/core'. Es genérico y sin estado: function.
//   - Con --module va a src/modules/<módulo>/components (solo de ese módulo): arrow.
//
// Funciones de node, sin React: function (regla de la casa).
import {access, appendFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {existingModuleOf} from './makeForm.js';
import {isValidName, namesOf} from './names.js';
import {CliError, copyTemplateFolder} from './templateFiles.js';

const COMPONENT_TEMPLATES = fileURLToPath(new URL('templates/component/', import.meta.url));

/**
 * @param {object} options
 * @param {string} options.projectRoot
 * @param {string} options.componentName
 * @param {string} [options.moduleName] sin él, a core
 * @returns {Promise<string[]>} las rutas escritas, relativas al proyecto
 */
export async function makeComponent({projectRoot, componentName, moduleName}) {
    if (!isValidName(componentName ?? '')) {
        throw new CliError('Falta el nombre del componente, en inglés y sin acentos (p. ej. StatusBadge).');
    }
    const componentNames = namesOf(componentName);

    if (moduleName) {
        const {folder, names: moduleNames} = await existingModuleOf(projectRoot, moduleName);
        const written = await copyTemplateFolder({
            templateFolder: join(COMPONENT_TEMPLATES, 'module'), targetFolder: join(folder, 'components'),
            values: {ComponentName: componentNames.pascal, module: moduleNames.camel},
        });
        return written.map((path) => `src/modules/${moduleNames.camel}/components/${path}`);
    }

    const coreFolder = join(projectRoot, 'src', 'core');
    const coreIndex = join(coreFolder, 'index.js');
    await access(coreIndex).catch(() => {
        throw new CliError('No encontré src/core/index.js (la puerta de core).');
    });
    const written = await copyTemplateFolder({
        templateFolder: join(COMPONENT_TEMPLATES, 'core'), targetFolder: coreFolder, values: {ComponentName: componentNames.pascal},
    });
    await appendFile(coreIndex, `export {${componentNames.pascal}} from '@/core/${componentNames.pascal}.jsx';\n`);
    return [...written.map((path) => `src/core/${path}`), 'src/core/index.js (se agregó a la puerta de core)'];
}
