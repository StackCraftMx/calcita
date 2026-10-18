// calcita new <carpeta>: un proyecto nuevo de Vite + React + MUI con Calcita, armado con lo que se contestó (projectAnswers.js):
// el marco con su menú, el tema, los textos en español e inglés, las rutas que se descubren solas, el servidor de
// mentira, las pantallas de entrar (si se pidieron) y un módulo de ejemplo (contacts) hecho con «make:module».
//
// Nunca escribe en una carpeta con archivos: si ya existe y no está vacía, se detiene sin tocar nada.
//
// Funciones de node, sin React: function (regla de la casa).
import {mkdir, readdir} from 'node:fs/promises';
import {basename, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {makeModule} from './makeModule.js';
import {isValidName, namesOf} from './names.js';
import {calcitaPackageJson} from './packageVersions.js';
import {primaryColorOf, templateFlagsOf} from './projectAnswers.js';
import {projectConfigOf, PROJECT_CONFIG_FILE} from './projectConfig.js';
import {appThemeFileOf, packageJsonOf} from './projectFiles.js';
import {CliError, copyTemplateFolder, writeNewFile} from './templateFiles.js';

const PROJECT_TEMPLATES = fileURLToPath(new URL('templates/project/', import.meta.url));
// los archivos (o carpetas, con «/» al final) que solo van con una opción prendida
const FILES_ONLY_WITH = Object.freeze({
    'public/manifest.webmanifest.tpl': 'pwa',
    'public/icons/': 'pwa',
    'src/app/i18n.js.tpl': 'i18next',
    'src/core/accountConnector.js.tpl': 'auth',
    'src/modules/auth/': 'auth',
    'src/modules/profile/': 'auth',
});
// lo que puede haber en una carpeta «vacía» (la de un repo recién clonado)
const IGNORED_IN_EMPTY_FOLDER = new Set(['.git', '.DS_Store']);
// el módulo de ejemplo
const SAMPLE_MODULE = Object.freeze({name: 'contacts', labels: {es: 'Contactos', en: 'Contacts'}});

/**
 * ¿Va este archivo de la plantilla con estas opciones?
 *
 * @param {string} relativePath
 * @param {Record<string, boolean>} flags
 * @returns {boolean}
 */
export function isTemplateFileIncluded(relativePath, flags) {
    for (const [pathOrFolder, flagName] of Object.entries(FILES_ONLY_WITH)) {
        const matches = pathOrFolder.endsWith('/') ? relativePath.startsWith(pathOrFolder) : relativePath === pathOrFolder;
        if (matches) {
            return Boolean(flags[flagName]);
        }
    }
    return true;
}

/** Falla si la carpeta tiene algo (se permite que no exista). */
async function checkEmptyFolder(folder) {
    const entries = await readdir(folder).catch((error) => {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    });
    if (entries.some((entry) => !IGNORED_IN_EMPTY_FOLDER.has(entry))) {
        throw new CliError(`La carpeta ${folder} ya tiene archivos; use una nueva o vacía.`);
    }
}

/**
 * @param {object} options
 * @param {string} options.folder donde se crea (relativa a donde se corre, o «.» para la actual)
 * @param {Record<string, string>} options.answers ya revisadas (checkedAnswers)
 * @returns {Promise<{projectRoot: string, written: string[]}>}
 */
export async function newProject({folder, answers}) {
    const projectRoot = resolve(folder);
    const folderName = basename(projectRoot);
    if (!isValidName(folderName)) {
        throw new CliError(`«${folderName}» no sirve como nombre del proyecto: letras sin acentos, números y guiones (p. ej. mi-tienda).`);
    }
    await checkEmptyFolder(projectRoot);
    await mkdir(projectRoot, {recursive: true});

    const calcitaPackage = await calcitaPackageJson();
    const flags = templateFlagsOf(answers);
    const packageName = namesOf(folderName).kebab;
    const values = {
        APP_TITLE: answers.appTitle,
        APP_SLUG: packageName,
        PRIMARY_COLOR: primaryColorOf(answers),
        MENU_POSITION: answers.menuPosition,
        FORMS_LIBRARY: answers.forms,
    };

    const written = await copyTemplateFolder({
        templateFolder: PROJECT_TEMPLATES, targetFolder: projectRoot, values, flags,
        includes: (relativePath) => isTemplateFileIncluded(relativePath, flags),
    });
    await writeNewFile(join(projectRoot, 'package.json'), packageJsonOf({packageName, answers, calcitaPackage}));
    await writeNewFile(join(projectRoot, PROJECT_CONFIG_FILE), projectConfigOf(answers, calcitaPackage.version));
    await writeNewFile(join(projectRoot, 'src', 'app', 'appTheme.js'), appThemeFileOf(answers));
    written.push('package.json', PROJECT_CONFIG_FILE, 'src/app/appTheme.js');

    const sample = await makeModule({projectRoot, moduleName: SAMPLE_MODULE.name, labels: SAMPLE_MODULE.labels});
    written.push(...sample.written);
    return {projectRoot, written};
}
