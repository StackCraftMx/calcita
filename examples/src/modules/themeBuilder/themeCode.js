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

/** La barra de arriba con vidrio o minimalista: en cápsulas (la de omisión de Calcita) o la franja (TOP_BAR de Calcita). */
export const THEME_BAR = Object.freeze({band: 'band', capsules: 'capsules'});

/**
 * Las superficies que flotan y se pueden quedar sin vidrio, en el orden del configurador. Son los nombres de GLASS_SURFACE
 * de Calcita; las tarjetas van aparte (THEME_GLASS.surfaces).
 */
export const THEME_FLOATING_SURFACES = Object.freeze(['topBar', 'tabBar', 'sideMenu', 'menus', 'drawers', 'dialogs', 'backdrop']);

/** La pestaña elegida con vidrio: la gota (de fábrica) o el color de la marca (GLASS_SELECTED_TAB de Calcita). */
export const THEME_SELECTED_TAB = Object.freeze({drop: 'drop', accent: 'accent'});

/** El botón con borde con vidrio: la cápsula sin borde (de fábrica) o con un borde de verdad (GLASS_OUTLINED_BUTTON de Calcita). */
export const THEME_OUTLINED_BUTTON = Object.freeze({glass: 'glass', bordered: 'bordered'});

/**
 * La opción glass de createToolkitTheme para lo elegido (la misma en la vista previa y en el código exportado). Con lo
 * de fábrica queda lo más corto: glass: true. Las superficies apagadas van con false; las demás no se escriben (quedan de
 * fábrica).
 *
 * @param {string} glass una de THEME_GLASS
 * @param {object} [options]
 * @param {string[]} [options.surfacesOff] las de THEME_FLOATING_SURFACES que van sin vidrio
 * @param {string} [options.selectedTab] una de THEME_SELECTED_TAB
 * @param {string} [options.outlinedButton] una de THEME_OUTLINED_BUTTON
 * @returns {boolean|{surfaces?: boolean|Record<string, boolean>, selectedTab?: string, outlinedButton?: string}}
 */
export function glassOptionOf(glass, {surfacesOff = [], selectedTab = THEME_SELECTED_TAB.drop, outlinedButton = THEME_OUTLINED_BUTTON.glass} = {}) {
    if (glass !== THEME_GLASS.floating && glass !== THEME_GLASS.surfaces) {
        return false;
    }
    const withCards = glass === THEME_GLASS.surfaces;
    const option = {};
    if (surfacesOff.length > 0) {
        option.surfaces = {...Object.fromEntries(surfacesOff.map((surface) => [surface, false])), ...(withCards && {cards: true})};
    } else if (withCards) {
        option.surfaces = true;
    }
    if (selectedTab === THEME_SELECTED_TAB.accent) {
        option.selectedTab = selectedTab;
    }
    if (outlinedButton === THEME_OUTLINED_BUTTON.bordered) {
        option.outlinedButton = outlinedButton;
    }
    return Object.keys(option).length > 0 ? option : true;
}

/**
 * La opción glass escrita como va en el código: true, o el objeto con sus llaves en una línea.
 *
 * @param {boolean|object} option lo que dio glassOptionOf
 * @returns {string}
 */
function glassTextOf(option) {
    if (typeof option !== 'object') {
        return String(option);
    }
    const parts = [];
    if (option.surfaces === true) {
        parts.push('surfaces: true');
    } else if (option.surfaces) {
        parts.push(`surfaces: {${Object.entries(option.surfaces).map(([surface, isGlass]) => `${surface}: ${isGlass}`).join(', ')}}`);
    }
    if (option.selectedTab) {
        parts.push(`selectedTab: '${option.selectedTab}'`);
    }
    if (option.outlinedButton) {
        parts.push(`outlinedButton: '${option.outlinedButton}'`);
    }
    return `{${parts.join(', ')}}`;
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
 * @param {string} [choices.bar] la barra de arriba con vidrio o minimalista, una de THEME_BAR
 * @param {string[]} [choices.surfacesOff] las superficies que van sin vidrio (THEME_FLOATING_SURFACES)
 * @param {string} [choices.selectedTab] la pestaña elegida, una de THEME_SELECTED_TAB
 * @param {string} [choices.outlinedButton] el botón con borde, una de THEME_OUTLINED_BUTTON
 * @param {boolean} [typed] la versión de TypeScript (con el tipo del tema)
 * @returns {string}
 */
export function themeCodeOf({colors, glass, cornerRadius, look, bar, surfacesOff, selectedTab, outlinedButton}, typed = false) {
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
    const glassText = glassTextOf(glassOptionOf(glass, {surfacesOff, selectedTab, outlinedButton}));
    // la barra va solo si se aparta de lo de omisión (las cápsulas) y solo donde aplica: con vidrio o con el minimalista
    const hasBarChoice = look === 'minimal' || glass !== THEME_GLASS.off;
    const barLine = hasBarChoice && bar === THEME_BAR.band ? `    bar: '${THEME_BAR.band}',` : null;
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
        barLine,
        `    overrides: {shape: {borderRadius: ${cornerRadius}}},`,
        `});`,
        ``,
    ].filter((line) => line !== null).join('\n');
}
