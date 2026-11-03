// calcita check:texts — revisa los textos del proyecto sin abrir la app:
//   1. que cada t('llave') escrita tal cual en el código exista en todos los idiomas (con su namespace: el de
//      useToolkitTranslation('orders') del archivo, o el que trae la llave, 'common:actions.save');
//   2. que cada idioma tenga las mismas llaves que los demás (lo que falta en inglés se pintaría en español… o como llave).
// Sin esto, una llave que no existe se descubre cuando alguien la ve en la pantalla («profile:tabs.documents»).
//
// Lo que NO revisa: las llaves armadas con una variable (t(`status.${value}`)) ni las que llevan defaultValue (son opcionales).
// Para esas está el aviso de Calcita en la consola (onMissingText de ToolkitProvider).
//
// Lee los archivos de textos del proyecto (src/**/*Texts.js y src/**/texts.js: cada uno exporta {es: {...}, en: {...}}) con
// node, así que no deben importar otros archivos; el que los junta (con import.meta.glob) se salta. Los namespaces de Calcita
// (common, table, validation…) salen de su dist/.
//
// Solo node, sin dependencias (el CLI corre antes de que el proyecto tenga nada instalado): function (regla de la casa).
// Pruebas en checkTexts.test.js.
import {readdir, readFile} from 'node:fs/promises';
import {join, relative} from 'node:path';
import {pathToFileURL} from 'node:url';

const SOURCE_EXTENSIONS = /\.(jsx?|tsx?)$/;
const TEST_FILE = /\.test\.(jsx?|tsx?)$/;
const TEXT_FILE = /(?:^|\/)(?:texts|[A-Za-z0-9]+Texts)\.js$/;
const IGNORED_FOLDERS = new Set(['node_modules', 'dist', 'coverage', '.git']);
// el namespace de un archivo: useToolkitTranslation('orders') o useToolkitTranslation(['orders', …])
const NAMESPACE_CALL = /useToolkitTranslation\(\s*\[?\s*(['"])([\w-]+)\1/g;
// una llave escrita tal cual: t('list.title') o t("common:actions.save"); con lo que sigue, para ver si trae defaultValue
const KEY_CALL = /\bt\(\s*(['"])([^'"`$\n]+?)\1([^)]{0,200})/g;
const PLURAL_SUFFIXES = ['', '_zero', '_one', '_two', '_few', '_many', '_other'];

/**
 * Los archivos de una carpeta y sus subcarpetas, sin node_modules ni dist.
 *
 * @param {string} folder
 * @returns {Promise<string[]>}
 */
async function filesOf(folder) {
    const entries = await readdir(folder, {withFileTypes: true}).catch(() => []);
    const nested = await Promise.all(entries.map(async (entry) => {
        const path = join(folder, entry.name);
        if (entry.isDirectory()) {
            return IGNORED_FOLDERS.has(entry.name) ? [] : filesOf(path);
        }
        return [path];
    }));
    return nested.flat();
}

/**
 * Suma los textos de un archivo a los de todos (por idioma y namespace, objetos por dentro). Aquí no truena con un repetido:
 * lo anota, para decirlo junto con lo demás.
 */
function addTexts(combined, fileTexts, duplicates, fileName) {
    const mergeInto = (target, added, place) => {
        for (const [key, value] of Object.entries(added)) {
            const isObject = value && typeof value === 'object';
            const keyPath = [...place.path, key];
            if (isObject && target[key] && typeof target[key] === 'object') {
                mergeInto(target[key], value, {...place, path: keyPath});
            } else if (Object.hasOwn(target, key)) {
                duplicates.push(`«${place.namespace}:${keyPath.join('.')}» en ${place.language} (otra vez en ${fileName})`);
            } else {
                target[key] = isObject ? structuredClone(value) : value;
            }
        }
    };
    for (const [language, namespaces] of Object.entries(fileTexts)) {
        combined[language] ??= {};
        for (const [namespace, keys] of Object.entries(namespaces ?? {})) {
            combined[language][namespace] ??= {};
            mergeInto(combined[language][namespace], keys, {language, namespace, path: []});
        }
    }
}

/**
 * ¿Parece un objeto de textos? ({es: {namespace: {...}}, en: {...}}: llaves de idioma con objetos adentro)
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function looksLikeTexts(value) {
    return Boolean(value) && typeof value === 'object' && Object.keys(value).length > 0
        && Object.entries(value).every(([language, namespaces]) => /^[a-z]{2}(-[A-Z]{2})?$/.test(language) && namespaces && typeof namespaces === 'object');
}

/** Lo que hay en un camino con puntos ('list.title') dentro de un objeto. */
function valueAt(object, dottedKey) {
    return dottedKey.split('.').reduce((current, step) => (current && typeof current === 'object' ? current[step] : undefined), object);
}

/** ¿Existe la llave (o su plural) en ese namespace? */
function hasKey(namespaceTexts, key) {
    return PLURAL_SUFFIXES.some((suffix) => typeof valueAt(namespaceTexts, `${key}${suffix}`) === 'string');
}

/** Todas las llaves con texto de un objeto, con puntos (para comparar idiomas); los plurales cuentan como su llave base. */
function leafKeysOf(object, prefix = '') {
    return Object.entries(object ?? {}).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object') {
            return leafKeysOf(value, path);
        }
        return [path.replace(/_(zero|one|two|few|many|other)$/, '')];
    });
}

/**
 * Los textos de Calcita (common, table, validation…), del dist/ del paquete que corre este CLI. Sin dist/ (el repo del paquete
 * sin construir), ninguno: las llaves de esos namespaces no se revisan.
 *
 * @returns {Promise<Record<string, object>>}
 */
async function packageTextsOf() {
    const texts = {};
    for (const language of ['es', 'en']) {
        try {
            const module = await import(new URL(`../dist/locales/${language}.js`, import.meta.url).href);
            texts[language] = module.default ?? {};
        } catch {
            return {};
        }
    }
    return texts;
}

/**
 * @param {object} options
 * @param {string} options.projectRoot la carpeta del proyecto
 * @param {string} [options.sourceFolder] dónde está el código (por omisión src)
 * @param {Record<string, object>} [options.packageTexts] los textos de Calcita (por omisión, los de su dist/)
 * @returns {Promise<{problems: string[], checkedKeys: number, textFiles: string[], languages: string[]}>}
 */
export async function checkTexts({projectRoot, sourceFolder = 'src', packageTexts}) {
    const sourceRoot = join(projectRoot, sourceFolder);
    const files = await filesOf(sourceRoot);
    const problems = [];

    // 1. los textos del proyecto
    const projectTexts = {};
    const duplicates = [];
    const textFiles = files.filter((file) => TEXT_FILE.test(file.replaceAll('\\', '/')));
    const readTextFiles = [];
    for (const file of textFiles) {
        const fileName = relative(projectRoot, file);
        // el que JUNTA los textos (appTexts.js, con el glob de Vite) no es un archivo de textos: se salta
        if ((await readFile(file, 'utf8')).includes('import.meta.glob')) {
            continue;
        }
        readTextFiles.push(fileName);
        try {
            const module = await import(pathToFileURL(file).href);
            const exported = Object.values(module).filter(looksLikeTexts);
            if (exported.length === 0) {
                problems.push(`${fileName}: no exporta textos con la forma {es: {...}, en: {...}}`);
            }
            exported.forEach((fileTexts) => addTexts(projectTexts, fileTexts, duplicates, fileName));
        } catch (error) {
            problems.push(`${fileName}: no se pudo leer (${error.message.split('\n')[0]}); un archivo de textos no debe importar otros archivos`);
        }
    }
    problems.push(...duplicates.map((duplicate) => `texto repetido: ${duplicate}`));

    const languages = Object.keys(projectTexts);
    // 2. que cada idioma tenga las mismas llaves
    for (const language of languages) {
        for (const otherLanguage of languages.filter((other) => other !== language)) {
            for (const namespace of Object.keys(projectTexts[language])) {
                const otherKeys = new Set(leafKeysOf(projectTexts[otherLanguage][namespace]));
                for (const key of new Set(leafKeysOf(projectTexts[language][namespace]))) {
                    if (!otherKeys.has(key)) {
                        problems.push(`«${namespace}:${key}» está en ${language} y falta en ${otherLanguage}`);
                    }
                }
            }
        }
    }

    // 3. cada t('llave') escrita tal cual
    const calcitaTexts = packageTexts ?? await packageTextsOf();
    const textsOf = (language, namespace) => projectTexts[language]?.[namespace] ?? calcitaTexts[language]?.[namespace];
    let checkedKeys = 0;
    for (const file of files.filter((path) => SOURCE_EXTENSIONS.test(path) && !TEST_FILE.test(path))) {
        const code = await readFile(file, 'utf8');
        const fileNamespaces = [...code.matchAll(NAMESPACE_CALL)].map((match) => match[2]);
        for (const match of code.matchAll(KEY_CALL)) {
            const [, , key, rest] = match;
            // con defaultValue la llave es opcional; una llave con espacios es un texto, no una llave
            if (/defaultValue/.test(rest) || /\s/.test(key)) {
                continue;
            }
            const line = code.slice(0, match.index).split('\n').length;
            const place = `${relative(projectRoot, file)}:${line}`;
            const [explicitNamespace, plainKey] = key.includes(':') ? key.split(':', 2) : [null, key];
            const candidates = explicitNamespace ? [explicitNamespace] : fileNamespaces;
            if (candidates.length === 0) {
                continue;
            }
            checkedKeys += 1;
            for (const language of languages.length > 0 ? languages : ['es']) {
                const found = candidates.some((namespace) => hasKey(textsOf(language, namespace), plainKey));
                if (!found) {
                    problems.push(`${place}  «${explicitNamespace ? key : `${candidates[0]}:${key}`}» no existe en ${language}`);
                }
            }
        }
    }

    return {problems, checkedKeys, textFiles: readTextFiles, languages};
}
