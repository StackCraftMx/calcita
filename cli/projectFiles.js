// Los tres archivos del proyecto nuevo que cambian demasiado según las respuestas para una plantilla con «//#if»: el
// package.json (qué librerías pide), calcita.json (projectConfig.js) y el tema (colores, modos y estilo).
//
// Funciones puras: function (regla de la casa). Pruebas en projectFiles.test.js.
import {versionsOf} from './packageVersions.js';
import {primaryColorOf, templateFlagsOf} from './projectAnswers.js';

// lo que pide toda app con Calcita: React, MUI, el router, los avisos y las máquinas de estados que usa su puerta principal, y
// formik y yup (los mensajes de validación en español salen de /forms en main.jsx, y la cuenta usa formik). Desde la 0.25 los
// pone el proyecto: Calcita ya no los trae adentro
const BASE_DEPENDENCIES = Object.freeze([
    '@emotion/react', '@emotion/styled', '@mui/icons-material', '@mui/material', '@xstate/react', 'formik', 'react', 'react-dom',
    'react-router', 'sonner', 'xstate', 'yup',
]);
const HOOK_FORM_DEPENDENCIES = Object.freeze(['@hookform/resolvers', 'react-hook-form']);
// la cuenta: las llaves de acceso (las pide @stackcraftmx/calcita/account) y el QR de la demostración
const ACCOUNT_DEPENDENCIES = Object.freeze(['@simplewebauthn/browser', 'qrcode']);
const DEV_DEPENDENCIES = Object.freeze(['@vitejs/plugin-react', 'vite']);

/** Un objeto con sus llaves en orden alfabético (como los escribe npm). */
const sortedByKey = (record) => Object.fromEntries(Object.entries(record).sort(([first], [second]) => first.localeCompare(second)));

/**
 * @param {object} options
 * @param {string} options.packageName
 * @param {Record<string, string>} options.answers
 * @param {{version: string, devDependencies: Record<string, string>}} options.calcitaPackage
 * @returns {string}
 */
export function packageJsonOf({packageName, answers, calcitaPackage}) {
    const flags = templateFlagsOf(answers);
    const dependencyNames = [
        ...BASE_DEPENDENCIES,
        ...(flags.hookForm ? HOOK_FORM_DEPENDENCIES : []),
        ...(flags.auth ? ACCOUNT_DEPENDENCIES : []),
        ...(flags.i18next ? ['i18next'] : []),
    ];
    const packageJson = {
        name: packageName,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {dev: 'vite', build: 'vite build', preview: 'vite preview'},
        dependencies: sortedByKey({'@stackcraftmx/calcita': `^${calcitaPackage.version}`, ...versionsOf(dependencyNames, calcitaPackage)}),
        devDependencies: sortedByKey(versionsOf([...DEV_DEPENDENCIES], calcitaPackage)),
        engines: {node: '>=22'},
    };
    return `${JSON.stringify(packageJson, null, 4)}\n`;
}

/**
 * src/app/appTheme.js con lo elegido.
 *
 * @param {Record<string, string>} answers
 * @returns {string}
 */
export function appThemeFileOf(answers) {
    const flags = templateFlagsOf(answers);
    const usesStackcraftPalettes = answers.colors !== 'mui';
    // con vidrio también el minimalista: en Android arranca así
    const imports = [
        ...(answers.style === 'minimal' || answers.style === 'glass' ? ['THEME_LOOK'] : []),
        'createToolkitTheme',
        ...(answers.style === 'glass' ? ['isAndroidDevice'] : []),
        ...(usesStackcraftPalettes && flags.darkMode ? ['stackcraftDarkPalette'] : []),
        ...(usesStackcraftPalettes ? ['stackcraftLightPalette'] : []),
    ];

    const lines = [
        '// El tema de la app: el del framework (createToolkitTheme), con los ajustes de cada componente de Calcita.',
        '//',
        '// Los colores van por modo de color. De cada color basta el «main»: MUI saca su versión clara, la oscura y el',
        '// color de la letra encima. El configurador de tema de los ejemplos de Calcita arma este archivo con vista previa.',
        `import {${imports.join(', ')}} from '@stackcraftmx/calcita';`,
        '',
    ];

    if (answers.colors === 'custom') {
        lines.push(
            '// el color principal de la app; los demás (éxito, aviso, error) se quedan los de Stackcraft',
            `const PRIMARY_COLOR = '${primaryColorOf(answers)}';`,
            '',
        );
    }
    lines.push(...colorSchemesLinesOf(answers.colors, flags.darkMode), '');

    if (answers.style === 'glass') {
        lines.push(
            '// vidrio líquido en lo que flota (barra, menús, avisos) y en los controles; el contenido, sólido (guía de Apple).',
            '// En Android, el minimalista: el vidrio es el estilo de Apple (allá se ve ajeno) y el desenfoque pesa en los teléfonos',
            '// baratos',
            'export const appTheme = isAndroidDevice()',
            '    ? createToolkitTheme({colorSchemes, look: THEME_LOOK.minimal})',
            '    : createToolkitTheme({colorSchemes, glass: true});',
            '',
        );
        return lines.join('\n');
    }
    lines.push('export const appTheme = createToolkitTheme({', '    colorSchemes,');
    if (answers.style === 'minimal') {
        lines.push('    // plano y tonal: sin bordes ni sombras, las superficies se separan por su tono', '    look: THEME_LOOK.minimal,');
    }
    lines.push('});', '');
    return lines.join('\n');
}

/** Los renglones de `colorSchemes` según los colores y los modos. */
function colorSchemesLinesOf(colors, darkMode) {
    if (colors === 'mui') {
        return [
            '// los colores de MUI tal cual (true: su paleta por omisión)',
            darkMode ? 'const colorSchemes = {light: true, dark: true};' : '// solo claro: sin el modo oscuro\nconst colorSchemes = {light: true};',
        ];
    }
    if (colors === 'custom') {
        return darkMode
            ? [
                'const colorSchemes = {',
                '    light: {palette: {...stackcraftLightPalette, primary: {main: PRIMARY_COLOR}}},',
                '    dark: {palette: {...stackcraftDarkPalette, primary: {main: PRIMARY_COLOR}}},',
                '};',
            ]
            : ['// solo claro: sin el modo oscuro', 'const colorSchemes = {light: {palette: {...stackcraftLightPalette, primary: {main: PRIMARY_COLOR}}}};'];
    }
    return darkMode
        ? ['// los colores de Stackcraft', 'const colorSchemes = {light: {palette: stackcraftLightPalette}, dark: {palette: stackcraftDarkPalette}};']
        : ['// los colores de Stackcraft, solo claro (sin el modo oscuro)', 'const colorSchemes = {light: {palette: stackcraftLightPalette}};'];
}
