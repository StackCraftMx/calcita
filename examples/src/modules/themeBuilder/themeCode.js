// Lo puro del configurador de tema: el código del tema listo para pegar en el proyecto, con los colores que eligió la
// persona (las paletas y sus reglas viven en core/themeColors.js, que comparte con la app). Sin React: se prueba con
// node --test (themeCode.test.js).
//
// Las reglas:
//   - se parte de las paletas de Stackcraft (fondo, texto, grises) y solo cambian los colores que se eligen; de cada uno se
//     da solo el «main»: MUI saca solo su versión clara, la oscura y el color de la letra encima;
//   - en oscuro, los colores de estado (éxito, aviso, error, información) se aclaran (DARK_STATUS_LIGHTEN): el mismo rojo de
//     claro sobre un fondo casi negro no se lee. El principal y el secundario se quedan igual: son la marca.
import {THEME_COLOR_KEYS, darkStatusColorOf, isStatusColor} from '@/core/themeColors.js';

/** Cómo va el vidrio en el tema que se exporta: apagado, en lo que flota o también en las tarjetas. */
export const THEME_GLASS = Object.freeze({off: 'off', floating: 'floating', surfaces: 'surfaces'});

/**
 * La opción glass de createToolkitTheme para lo elegido (la misma en la vista previa y en el código exportado).
 *
 * @param {string} glass una de THEME_GLASS
 * @returns {boolean|{surfaces: boolean}}
 */
export function glassOptionOf(glass) {
    if (glass === THEME_GLASS.surfaces) {
        return {surfaces: true};
    }
    return glass === THEME_GLASS.floating;
}

/**
 * El color en el código: en mayúsculas, como los escribe el diseño. lighten() regresa rgb(): se queda así.
 *
 * @param {string} color
 * @returns {string}
 */
function colorTextOf(color) {
    return color.startsWith('#') ? color.toUpperCase() : color;
}

/**
 * El código del tema, listo para pegar en el proyecto (src/app/appTheme.js o donde viva su tema).
 *
 * @param {object} choices
 * @param {Record<string, string>} choices.colors los colores elegidos por llave de THEME_COLOR_KEYS
 * @param {string} choices.glass una de THEME_GLASS
 * @param {number} choices.cornerRadius el radio de las esquinas en px
 * @param {string} [choices.look] 'minimal' para el estilo minimalista (sin vidrio)
 * @param {boolean} [typed] la versión de TypeScript (con el tipo del tema)
 * @returns {string}
 */
export function themeCodeOf({colors, glass, cornerRadius, look}, typed = false) {
    const colorLinesOf = (isDark) => THEME_COLOR_KEYS
        .filter((key) => colors[key])
        .map((key) => {
            if (isDark && isStatusColor(key)) {
                const shades = darkStatusColorOf(colors[key]);
                return `        ${key}: {main: '${colorTextOf(shades.main)}', light: '${colorTextOf(shades.light)}', dark: '${colorTextOf(shades.dark)}'},`;
            }
            return `        ${key}: {main: '${colorTextOf(colors[key])}'},`;
        })
        .join('\n');
    const glassOption = glassOptionOf(glass);
    const glassText = typeof glassOption === 'object' ? '{surfaces: true}' : String(glassOption);
    const themeType = typed ? ': Theme' : '';
    return [
        `// El tema de la app, armado en el configurador de Calcita.`,
        typed ? `import type {Theme} from '@mui/material/styles';` : null,
        `import {createToolkitTheme, stackcraftDarkPalette, stackcraftLightPalette} from '@stackcraftmx/calcita';`,
        ``,
        `// de cada color basta el «main»: MUI saca su versión clara, la oscura y el color de la letra encima`,
        `const lightPalette = {`,
        `    ...stackcraftLightPalette,`,
        colorLinesOf(false).replace(/^ {8}/gm, '    '),
        `};`,
        ``,
        `// en oscuro, los colores de estado van más claros (los tres tonos): sobre un fondo casi negro los de claro no se leen`,
        `const darkPalette = {`,
        `    ...stackcraftDarkPalette,`,
        colorLinesOf(true).replace(/^ {8}/gm, '    '),
        `};`,
        ``,
        `export const appTheme${themeType} = createToolkitTheme({`,
        `    colorSchemes: {light: {palette: lightPalette}, dark: {palette: darkPalette}},`,
        look === 'minimal' ? `    look: 'minimal',` : `    glass: ${glassText},`,
        `    overrides: {shape: {borderRadius: ${cornerRadius}}},`,
        `});`,
        ``,
    ].filter((line) => line !== null).join('\n');
}
