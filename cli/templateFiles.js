// Las plantillas del CLI: archivos tal cual en cli/templates, con dos cosas que se cambian al copiarlos.
//
//   1. Los valores: __Name__, __APP_TITLE__… se cambian por el valor que toca (ver la lista de cada comando). Si una
//      plantilla trae uno que el comando no conoce, truena: un «__Name__» olvidado en el proyecto nuevo no compilaría.
//   2. Los renglones opcionales: lo que va entre «//#if pwa» y «//#endif» solo se queda si la opción está prendida
//      («//#if !pwa»: si está apagada). Los renglones de las marcas se quitan; se pueden anidar.
//
// Así una plantilla se lee como el archivo que va a salir, sin código que la arme. Los archivos que no terminan en .tpl
// (los íconos) se copian sin tocar.
//
// Funciones de node, sin React: function (regla de la casa). Pruebas en templateFiles.test.js.
import {mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {dirname, join, relative} from 'node:path';

const TEMPLATE_EXTENSION = '.tpl';
const IF_MARKER = /^\s*\/\/#if (!?)(\w+)\s*$/;
const END_MARKER = /^\s*\/\/#endif\s*$/;
const LEFTOVER_VALUE = /__[A-Za-z]+(?:_[A-Za-z]+)*__/;
// npm no publica los archivos que se llaman .gitignore: en la plantilla van como dot-gitignore.tpl
const DOT_FILE_PREFIX = 'dot-';

/**
 * Error que se le explica a la persona (sin el detalle técnico de dónde tronó): un nombre que ya existe, un archivo que no
 * está. Lo demás es un error del CLI y sale completo.
 */
export class CliError extends Error {}

/**
 * @param {string} text el contenido de la plantilla
 * @param {{values?: Record<string, string>, flags?: Record<string, boolean>}} [options]
 * @returns {string}
 */
export function renderTemplate(text, {values = {}, flags = {}} = {}) {
    const keptLines = [];
    // lo que dice cada «//#if» abierto: si su parte se queda
    const openConditions = [];
    for (const line of text.split('\n')) {
        const ifMatch = IF_MARKER.exec(line);
        if (ifMatch) {
            const [, negation, flagName] = ifMatch;
            if (!(flagName in flags)) {
                throw new Error(`La plantilla pregunta por «${flagName}», que el comando no conoce`);
            }
            openConditions.push(negation ? !flags[flagName] : Boolean(flags[flagName]));
            continue;
        }
        if (END_MARKER.test(line)) {
            if (openConditions.length === 0) {
                throw new Error('La plantilla trae un «//#endif» de más');
            }
            openConditions.pop();
            continue;
        }
        if (openConditions.every(Boolean)) {
            keptLines.push(line);
        }
    }
    if (openConditions.length > 0) {
        throw new Error('A la plantilla le falta un «//#endif»');
    }

    let rendered = keptLines.join('\n');
    for (const [name, value] of Object.entries(values)) {
        rendered = rendered.replaceAll(`__${name}__`, value);
    }
    const leftover = LEFTOVER_VALUE.exec(rendered);
    if (leftover) {
        throw new Error(`La plantilla trae «${leftover[0]}» y el comando no le dio valor`);
    }
    return rendered;
}

/**
 * El nombre con que sale un archivo: sin .tpl, con sus valores (__Name__Page.jsx → ContactsPage.jsx) y dot-gitignore
 * como .gitignore.
 *
 * @param {string} relativePath
 * @param {Record<string, string>} values
 * @returns {string}
 */
export function outputPathOf(relativePath, values) {
    let outputPath = relativePath.endsWith(TEMPLATE_EXTENSION) ? relativePath.slice(0, -TEMPLATE_EXTENSION.length) : relativePath;
    for (const [name, value] of Object.entries(values)) {
        outputPath = outputPath.replaceAll(`__${name}__`, value);
    }
    return outputPath.split('/').map((part) => (part.startsWith(DOT_FILE_PREFIX) ? `.${part.slice(DOT_FILE_PREFIX.length)}` : part)).join('/');
}

/**
 * Los archivos de una carpeta de plantillas, con su ruta relativa (con «/» también en Windows).
 *
 * @param {string} folder
 * @returns {Promise<string[]>}
 */
export async function templateFilesOf(folder) {
    const entries = await readdir(folder, {recursive: true, withFileTypes: true});
    return entries
        .filter((entry) => entry.isFile())
        .map((entry) => relative(folder, join(entry.parentPath, entry.name)).split('\\').join('/'))
        .sort();
}

/**
 * Escribe un archivo nuevo; si ya existe, truena sin tocarlo (el CLI nunca pisa lo que ya escribió alguien).
 *
 * @param {string} path
 * @param {string|Buffer} content
 */
export async function writeNewFile(path, content) {
    await mkdir(dirname(path), {recursive: true});
    try {
        await writeFile(path, content, {flag: 'wx'});
    } catch (error) {
        if (error.code === 'EEXIST') {
            throw new CliError(`Ya existe ${path}; no se tocó nada de ese archivo.`);
        }
        throw error;
    }
}

/**
 * Copia una carpeta de plantillas a su destino: las .tpl con sus valores y sus renglones opcionales, lo demás tal cual.
 *
 * @param {object} options
 * @param {string} options.templateFolder
 * @param {string} options.targetFolder
 * @param {Record<string, string>} options.values
 * @param {Record<string, boolean>} [options.flags]
 * @param {(relativePath: string) => boolean} [options.includes] cuáles se copian; por omisión todas
 * @returns {Promise<string[]>} las rutas escritas, relativas al destino
 */
export async function copyTemplateFolder({templateFolder, targetFolder, values, flags = {}, includes = () => true}) {
    const written = [];
    for (const relativePath of await templateFilesOf(templateFolder)) {
        if (!includes(relativePath)) {
            continue;
        }
        const outputPath = outputPathOf(relativePath, values);
        const source = await readFile(join(templateFolder, relativePath));
        const content = relativePath.endsWith(TEMPLATE_EXTENSION) ? renderTemplate(source.toString('utf8'), {values, flags}) : source;
        await writeNewFile(join(targetFolder, outputPath), content);
        written.push(outputPath);
    }
    return written;
}

/**
 * Agrega un renglón al final de un arreglo exportado («export const routes = [ … ];»), antes de su «];». Regresa null si no
 * encuentra el arreglo con esa forma (alguien lo cambió): entonces el comando le dice a la persona qué renglón poner.
 *
 * @param {string} text el archivo
 * @param {string} declaration p. ej. 'export const routes = ['
 * @param {string} line el renglón completo, con su sangría
 * @returns {string|null}
 */
export function insertIntoArray(text, declaration, line) {
    const start = text.indexOf(declaration);
    if (start < 0) {
        return null;
    }
    // el «];» que cierra el arreglo: el primero al inicio de un renglón después de la declaración
    const end = text.indexOf('\n];', start);
    if (end < 0) {
        return null;
    }
    return `${text.slice(0, end)}\n${line}${text.slice(end)}`;
}

/**
 * Agrega un renglón después del último que cumple la regla (p. ej. después de la última «export const …_PATH»). Regresa null
 * si ninguno la cumple.
 *
 * @param {string} text
 * @param {RegExp} pattern con la bandera m (renglón por renglón)
 * @param {string} line
 * @returns {string|null}
 */
export function insertAfterLastMatch(text, pattern, line) {
    const matches = [...text.matchAll(new RegExp(pattern.source, `${pattern.flags.replace('g', '')}g`))];
    if (matches.length === 0) {
        return null;
    }
    const lastMatch = matches.at(-1);
    const lineEnd = lastMatch.index + lastMatch[0].length;
    return `${text.slice(0, lineEnd)}\n${line}${text.slice(lineEnd)}`;
}
