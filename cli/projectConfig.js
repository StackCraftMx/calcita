// calcita.json: lo que se eligió al crear el proyecto con «calcita new». Los comandos make:* lo leen para armar igual que el
// resto del proyecto (los formularios con formik o con react-hook-form). Vive en la raíz del proyecto y se sube al repo.
//
// Funciones de node, sin React: function (regla de la casa).
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';

import {CliError} from './templateFiles.js';

export const PROJECT_CONFIG_FILE = 'calcita.json';

/**
 * Lo que se guarda: la librería de formularios (la que leen los make:*) y todas las respuestas, para saber cómo se armó.
 *
 * @param {Record<string, string>} answers
 * @param {string} calcitaVersion
 * @returns {string} el contenido del archivo
 */
export function projectConfigOf(answers, calcitaVersion) {
    return `${JSON.stringify({forms: answers.forms, createdWithCalcita: calcitaVersion, answers}, null, 4)}\n`;
}

/**
 * Lee calcita.json de la carpeta donde se corre el comando.
 *
 * @param {string} projectRoot
 * @returns {Promise<{forms: string}>}
 */
export async function readProjectConfig(projectRoot) {
    try {
        return JSON.parse(await readFile(join(projectRoot, PROJECT_CONFIG_FILE), 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new CliError(`No encontré ${PROJECT_CONFIG_FILE} aquí. Corra el comando en la carpeta del proyecto (la que armó «calcita new»).`);
        }
        throw error;
    }
}
