// Construcción del paquete en modo librería: solo ESM, un archivo por módulo (preserveModules) para que cada proyecto
// cargue solo lo que importa, y sin meter adentro React, MUI ni ninguna otra dependencia: esas las pone el proyecto.
import {fileURLToPath, URL} from 'node:url';
import {readFileSync} from 'node:fs';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// una puerta por entrada de "exports" en package.json
const ENTRIES = Object.freeze({
    index: 'src/index.js',
    table: 'src/table.js',
    forms: 'src/forms.js',
    charts: 'src/charts.js',
    timeline: 'src/timeline.js',
    excel: 'src/excel.js',
    'react-router': 'src/react-router.js',
    i18next: 'src/i18next.js',
    laravel: 'src/laravel.js',
    money: 'src/money.js',
    filepond: 'src/filepond.js',
    'react-hook-form': 'src/react-hook-form.js',
    'date-pickers': 'src/date-pickers.js',
    next: 'src/next.js',
    passkeys: 'src/passkeys.js',
    maps: 'src/maps.js',
    calendar: 'src/calendar.js',
    kanban: 'src/kanban.js',
});

// lo que instala el proyecto (peerDependencies) y las dependencias del paquete se quedan fuera del build
const EXTERNAL_PACKAGES = [...Object.keys(packageJson.peerDependencies), ...Object.keys(packageJson.dependencies)];

/**
 * Si un import se queda fuera del build: un paquete externo (o uno de sus archivos, como @mui/material/Button o
 * react/jsx-runtime) o un módulo de node.
 *
 * @param {string} importPath
 * @returns {boolean}
 */
function isExternal(importPath) {
    return importPath.startsWith('node:')
        || EXTERNAL_PACKAGES.some((packageName) => importPath === packageName || importPath.startsWith(`${packageName}/`));
}

// Los archivos que Next.js tiene que tratar como «de cliente» ('use client'): los que pintan (JSX) o usan algo que solo
// vive en el navegador (hooks y contexto de React, o librerías de componentes). Los puros (formatos, Money, permisos,
// menú, diccionarios) quedan sin marca: Next los puede usar también en sus componentes de servidor.
// OJO: la marca se pone al CONSTRUIR y no en el código fuente: Rollup quita las directivas que encuentra en los módulos
// al juntar el build («Module level directives cause errors when bundled») y con preserveModules cada archivo sale solo.
const CLIENT_ONLY_IMPORT = /from\s*["'](react|react\/jsx-runtime|@xstate\/react|formik|react-hook-form|nuqs|react-router|sonner|react-filepond|recharts|@mui\/[^"']+)["']/;
const USE_CLIENT_DIRECTIVE = '"use client";';

/**
 * El plugin que anota qué módulos de src/ son de cliente; el banner de cada archivo del build les pone la marca.
 *
 * @param {Set<string>} clientModuleIds se llena al transformar
 * @returns {import('vite').Plugin}
 */
function collectClientModules(clientModuleIds) {
    return {
        name: 'calcita-collect-client-modules',
        transform(code, id) {
            if (id.includes('/src/') && (id.endsWith('.jsx') || CLIENT_ONLY_IMPORT.test(code))) {
                clientModuleIds.add(id);
            }
            return null;
        },
    };
}

const clientModuleIds = new Set();

export default defineConfig({
    plugins: [react(), collectClientModules(clientModuleIds)],
    resolve: {
        alias: {'@': fileURLToPath(new URL('./src', import.meta.url))},
    },
    build: {
        lib: {entry: ENTRIES, formats: ['es']},
        sourcemap: true,
        minify: false,
        rollupOptions: {
            external: isExternal,
            output: {
                preserveModules: true,
                preserveModulesRoot: 'src',
                entryFileNames: '[name].js',
                // el banner va antes que todo lo demás del archivo, como pide la directiva; Rollup corre el mapa de fuentes
                banner: (chunk) => (clientModuleIds.has(chunk.facadeModuleId) ? USE_CLIENT_DIRECTIVE : ''),
            },
        },
    },
});
