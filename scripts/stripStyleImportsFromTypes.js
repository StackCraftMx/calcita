// Quita de los tipos generados (dist/types) las líneas que cargan una hoja de estilos: import 'algo.css'.
//
// Por qué: tsc copia a los .d.ts los import que solo cargan algo (como la hoja de FilePond). En los tipos no sirven, y un
// proyecto en TypeScript que revisa los tipos de sus librerías truena con ellos («Cannot find module or type
// declarations for side-effect import of 'filepond/dist/filepond.min.css'»). El JavaScript (dist/*.js) los conserva:
// ahí sí hacen falta, para que el empaquetador del proyecto cargue la hoja junto con el componente.
//
// Se corre después de tsc y tsc-alias (script «types» de package.json).
//
// Script de node, sin React: function (regla de la casa).
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const TYPES_FOLDER = new URL('../dist/types/', import.meta.url).pathname;
// una línea completa que solo importa un .css (con comillas simples o dobles)
const STYLE_IMPORT_LINE = /^import\s+['"][^'"]+\.css['"];?\s*\n/gm;

/**
 * Todos los .d.ts de una carpeta, con sus subcarpetas.
 *
 * @param {string} folder
 * @returns {string[]}
 */
function typeFilesIn(folder) {
    return readdirSync(folder, {withFileTypes: true}).flatMap((entry) => {
        const path = join(folder, entry.name);
        if (entry.isDirectory()) {
            return typeFilesIn(path);
        }
        return entry.name.endsWith('.d.ts') ? [path] : [];
    });
}

let cleanedFiles = 0;
for (const typeFile of typeFilesIn(TYPES_FOLDER)) {
    const content = readFileSync(typeFile, 'utf8');
    const cleanContent = content.replace(STYLE_IMPORT_LINE, '');
    if (cleanContent !== content) {
        writeFileSync(typeFile, cleanContent);
        cleanedFiles += 1;
    }
}
console.log(`tipos sin hojas de estilo: ${cleanedFiles} archivo(s) limpiado(s)`);
