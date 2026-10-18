// calcita make:form <módulo> <Formulario>: un formulario dentro de un módulo, con la librería del proyecto (formik o
// react-hook-form, la de calcita.json): el componente, sus reglas (yup) y sus textos.
//
//   calcita make:form contacts ContactForm
//     → src/modules/contacts/ContactForm.jsx, contactFormSchema.js, contactFormTexts.js
//
// El formulario no sabe del servidor: la pantalla le pasa qué hacer con los datos (onSubmit).
//
// Funciones de node, sin React: function (regla de la casa).
import {access} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {isValidName, namesOf, withoutSuffixWord} from './names.js';
import {readProjectConfig} from './projectConfig.js';
import {CliError, copyTemplateFolder} from './templateFiles.js';

const FORM_TEMPLATES = fileURLToPath(new URL('templates/form/', import.meta.url));
// la carpeta de plantillas de cada librería de formularios
const TEMPLATE_FOLDER_OF_LIBRARY = Object.freeze({'formik': 'formik', 'react-hook-form': 'hookForm'});

/**
 * La carpeta del módulo, que ya debe existir.
 *
 * @param {string} projectRoot
 * @param {string} moduleName como lo escribió la persona
 * @returns {Promise<{folder: string, names: ReturnType<typeof namesOf>}>}
 */
export async function existingModuleOf(projectRoot, moduleName) {
    if (!isValidName(moduleName ?? '')) {
        throw new CliError('Falta el módulo, en inglés y sin acentos (p. ej. contacts).');
    }
    const names = namesOf(moduleName);
    const folder = join(projectRoot, 'src', 'modules', names.camel);
    try {
        await access(folder);
    } catch {
        throw new CliError(`No existe el módulo src/modules/${names.camel}. Créelo antes con: calcita make:module ${names.kebab}`);
    }
    return {folder, names};
}

/**
 * @param {object} options
 * @param {string} options.projectRoot
 * @param {string} options.moduleName
 * @param {string} options.formName «ContactForm» o «contact» (se le agrega Form)
 * @returns {Promise<string[]>} las rutas escritas, relativas al proyecto
 */
export async function makeForm({projectRoot, moduleName, formName}) {
    const {folder, names: moduleNames} = await existingModuleOf(projectRoot, moduleName);
    if (!isValidName(formName ?? '')) {
        throw new CliError('Falta el nombre del formulario, en inglés y sin acentos (p. ej. ContactForm).');
    }
    const {forms} = await readProjectConfig(projectRoot);
    const libraryFolder = TEMPLATE_FOLDER_OF_LIBRARY[forms];
    if (!libraryFolder) {
        throw new CliError(`calcita.json dice forms: «${forms}»; use formik o react-hook-form.`);
    }

    const formNames = namesOf(`${withoutSuffixWord(formName, 'form')} form`);
    const values = {module: moduleNames.camel, FormName: formNames.pascal, formName: formNames.camel, FORM_NAME: formNames.constant};
    const written = [
        ...await copyTemplateFolder({templateFolder: join(FORM_TEMPLATES, 'shared'), targetFolder: folder, values}),
        ...await copyTemplateFolder({templateFolder: join(FORM_TEMPLATES, libraryFolder), targetFolder: folder, values}),
    ];
    return written.map((path) => `src/modules/${moduleNames.camel}/${path}`);
}
