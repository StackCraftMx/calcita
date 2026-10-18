// Pone el paquete recién construido (.dist-next/) en dist/ sin dejar a dist/ vacía ni un instante.
//
// Por qué: Vite borra su carpeta de salida al empezar a construir. Con la salida en dist/, durante esos segundos el servidor
// de desarrollo de los ejemplos (que lee el paquete de dist/) no lo encontraba y la pantalla salía con «Algo falló» (lo
// reportó el autor: «a cada rato sale»).
//
// OJO: no se renombra la carpeta entera. Se probó y el servidor de desarrollo perdió la pista de dist/ (vigilaba la carpeta
// vieja) y se quedó con el paquete viejo en memoria: las pantallas que usaban algo nuevo tronaban. Por eso se reemplaza
// ARCHIVO POR ARCHIVO dentro de la misma dist/: cada uno se escribe a un lado y se renombra encima (de golpe), y al final
// se borra lo que ya no existe. Los tipos (dist/types) los genera después tsc y aquí no se tocan.
//
// Script de construcción, sin React: function (regla de la casa).
import {copyFileSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync} from 'node:fs';
import {dirname, join, relative} from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const BUILT_FOLDER = join(ROOT, '.dist-next');
const CURRENT_FOLDER = join(ROOT, 'dist');
// lo que no sale de Vite y no se borra: los tipos de tsc
const KEPT_FOLDERS = Object.freeze(['types']);
const TEMPORARY_SUFFIX = '.swapping';

/** Todos los archivos de una carpeta, con su ruta relativa a ella. */
function filesOf(folder) {
    return readdirSync(folder, {recursive: true})
        .map((entry) => String(entry))
        .filter((entry) => statSync(join(folder, entry)).isFile());
}

if (!existsSync(BUILT_FOLDER)) {
    throw new Error('swapBuild: no hay .dist-next (¿falló vite build?); dist/ se queda como estaba.');
}
const builtFiles = filesOf(BUILT_FOLDER);
for (const file of builtFiles) {
    const target = join(CURRENT_FOLDER, file);
    mkdirSync(dirname(target), {recursive: true});
    copyFileSync(join(BUILT_FOLDER, file), `${target}${TEMPORARY_SUFFIX}`);
    renameSync(`${target}${TEMPORARY_SUFFIX}`, target);
}
// lo que ya no sale de la construcción (un archivo que se borró o se movió)
const builtSet = new Set(builtFiles);
for (const file of filesOf(CURRENT_FOLDER)) {
    const isKept = KEPT_FOLDERS.some((folder) => file.startsWith(`${folder}/`));
    if (!isKept && !builtSet.has(file)) {
        rmSync(join(CURRENT_FOLDER, file));
    }
}
rmSync(BUILT_FOLDER, {recursive: true, force: true});
console.log(`swapBuild: ${builtFiles.length} archivos al día en ${relative(ROOT, CURRENT_FOLDER)}/`);
