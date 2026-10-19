// Que cada módulo tenga los mismos textos en español y en inglés: una llave que falta en un idioma sale en pantalla como la
// llave cruda («account.rest.extend.paths»). Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {test} from 'node:test';
import {fileURLToPath, pathToFileURL} from 'node:url';

const MODULES_FOLDER = fileURLToPath(new URL('../modules/', import.meta.url));

/** Todas las llaves de un objeto de textos, con su ruta completa (orders.page.title). */
const keysOf = (texts, prefix = '') => Object.entries(texts).flatMap(([key, value]) => (
    value && typeof value === 'object' ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`]
));

const textFiles = readdirSync(MODULES_FOLDER, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .flatMap((folder) => readdirSync(`${MODULES_FOLDER}${folder.name}`)
        .filter((file) => file.endsWith('Texts.js'))
        .map((file) => `${MODULES_FOLDER}${folder.name}/${file}`))
    // los textos que bajan por partes (las páginas del catálogo) también
    .concat([`${MODULES_FOLDER}catalog/pageTexts/catalogPageTexts.js`]);

test('cada módulo trae sus textos', () => {
    assert.ok(textFiles.length > 5, `se encontraron ${textFiles.length} archivos de textos`);
});

for (const file of textFiles) {
    test(`español e inglés con las mismas llaves: ${file.slice(MODULES_FOLDER.length)}`, async () => {
        const module = await import(pathToFileURL(file).href);
        const texts = Object.values(module).find((value) => value && typeof value === 'object' && 'es' in value);
        assert.ok(texts, 'el archivo exporta un objeto con es y en');
        const spanishKeys = new Set(keysOf(texts.es));
        const englishKeys = new Set(keysOf(texts.en ?? {}));
        assert.deepEqual([...spanishKeys].filter((key) => !englishKeys.has(key)), [], 'llaves que faltan en inglés');
        assert.deepEqual([...englishKeys].filter((key) => !spanishKeys.has(key)), [], 'llaves que faltan en español');
    });
}
