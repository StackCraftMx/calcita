// El código de cada ejemplo del catálogo en TypeScript y en JavaScript, para su «Ver código».
//
// Cada ejemplo se escribe UNA vez, en TypeScript (src/modules/catalog/demos/**/*.tsx): es el que se pinta, el que revisa
// tsc (tsconfig.demos.json) y el que se copia. El JavaScript sale de él: Babel le quita los tipos y Prettier deja los dos
// con el mismo formato. Así el JS nunca se desfasa del TS. Es la misma manera que usa la documentación de MUI.
//
// Lo usa el plugin de vite.config.js (import X from '…/Demo.tsx?demo-source' → {ts, js}). Solo corre al construir; no
// viaja al navegador.
//
// Funciones puras de node: function (regla de la casa).
import {transformAsync} from '@babel/core';
import {format} from 'prettier';

// el formato del código que se enseña: el de la casa (4 espacios, comillas sencillas, llaves sin espacios por dentro)
const PRETTIER_OPTIONS = Object.freeze({
    tabWidth: 4,
    printWidth: 110,
    singleQuote: true,
    jsxSingleQuote: false,
    bracketSpacing: false,
    trailingComma: 'all',
    arrowParens: 'always',
});

/**
 * Quita los renglones que en el TS tenían algo y en el JS quedaron vacíos (eran solo tipos). Con retainLines cada renglón
 * del JS está en el mismo número que en el TS, así que se comparan uno a uno.
 *
 * @param {string} tsxCode
 * @param {string} jsCode lo que dio Babel con retainLines
 * @returns {string}
 */
function withoutLinesEmptiedByTypes(tsxCode, jsCode) {
    const tsLines = tsxCode.split('\n');
    return jsCode.split('\n').filter((line, index) => line.trim() !== '' || (tsLines[index] ?? '').trim() === '').join('\n');
}

/**
 * El TypeScript del ejemplo tal cual (con el formato de la casa) y su JavaScript sin tipos.
 *
 * OJO: retainLines deja cada renglón donde estaba al quitar los tipos; sin eso Babel juntaba los bloques y se perdían los
 * renglones en blanco que separan las partes del ejemplo. Pero un renglón que solo traía tipos (import type, type X = …)
 * quedaba en blanco y partía los imports en dos: se quitan los renglones que el TS tenía escritos y el JS dejó vacíos.
 *
 * @param {string} tsxCode el contenido del .tsx
 * @param {string} fileName su ruta (Babel la usa para saber que es TSX)
 * @returns {Promise<{ts: string, js: string}>}
 */
export async function demoSourcesOf(tsxCode, fileName) {
    const ts = await format(tsxCode, {...PRETTIER_OPTIONS, parser: 'typescript'});
    const withoutTypes = await transformAsync(tsxCode, {
        filename: fileName,
        babelrc: false,
        configFile: false,
        retainLines: true,
        presets: [['@babel/preset-typescript', {isTSX: true, allExtensions: true}]],
    });
    const js = await format(withoutLinesEmptiedByTypes(tsxCode, withoutTypes.code), {...PRETTIER_OPTIONS, parser: 'babel'});
    return {ts, js};
}
