// Revisión del CLI sin internet: arma dos proyectos opuestos con «calcita new» (lo recomendado, y react-hook-form +
// i18next + menú arriba + MUI + solo claro + minimalista, sin entrar ni PWA), corre los make:* en el segundo y revisa que:
//   - cada .js y .jsx se pueda compilar (esbuild de Vite);
//   - cada import con @/ lleve a un archivo que existe;
//   - cada pieza que se importa de @stackcraftmx/calcita exista en el dist/ del paquete (lo que de verdad se publica).
// No instala ni construye los proyectos (eso pide internet): la prueba completa, con pnpm install, build y Chrome, se
// hace a mano antes de publicar. Se corre después de construir el paquete:
//   node testing/cliProjects.js
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {mkdtemp, readFile, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {transformWithEsbuild} from 'vite';

const ROOT = new URL('..', import.meta.url).pathname;
const CLI = join(ROOT, 'cli', 'calcita.js');
const PACKAGE_EXPORTS = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8')).exports;
const IMPORT_PATTERN = /import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*'([^']+)'/g;
const SOURCE_EXTENSIONS = ['.js', '.jsx'];

const runCli = (cwd, args) => execFileSync('node', [CLI, ...args, '--yes'], {cwd, stdio: 'pipe', encoding: 'utf8'});

/** Los nombres que exporta cada puerta del paquete (se importa su archivo de dist/ una vez). */
const exportsByEntry = new Map();
async function packageExportsOf(specifier) {
    if (!exportsByEntry.has(specifier)) {
        const entry = specifier === '@stackcraftmx/calcita' ? '.' : `./${specifier.split('/').slice(2).join('/')}`;
        const distFile = PACKAGE_EXPORTS[entry]?.import ?? PACKAGE_EXPORTS[entry]?.default;
        if (!distFile) {
            throw new Error(`el paquete no tiene la puerta ${specifier}`);
        }
        exportsByEntry.set(specifier, new Set(Object.keys(await import(pathToFileURL(join(ROOT, distFile)).href))));
    }
    return exportsByEntry.get(specifier);
}

async function sourceFilesOf(folder) {
    const entries = await readdir(folder, {recursive: true, withFileTypes: true});
    return entries.filter((entry) => entry.isFile() && SOURCE_EXTENSIONS.some((extension) => entry.name.endsWith(extension)))
        .map((entry) => join(entry.parentPath, entry.name));
}

/** Los problemas de un proyecto armado, uno por renglón. */
async function problemsOf(projectRoot) {
    const problems = [];
    for (const file of await sourceFilesOf(join(projectRoot, 'src'))) {
        const shortName = relative(projectRoot, file);
        const code = await readFile(file, 'utf8');
        try {
            await transformWithEsbuild(code, file, {loader: 'jsx', jsx: 'automatic'});
        } catch (error) {
            problems.push(`${shortName}: no compila (${error.message.split('\n')[0]})`);
        }
        for (const [, defaultName, namedList, specifier] of code.matchAll(IMPORT_PATTERN)) {
            if (specifier.startsWith('@/')) {
                const target = join(projectRoot, 'src', specifier.slice(2));
                const exists = existsSync(target) || existsSync(join(target, 'index.js'));
                if (!exists) {
                    problems.push(`${shortName}: no existe ${specifier}`);
                }
            } else if (specifier.startsWith('@stackcraftmx/calcita')) {
                const available = await packageExportsOf(specifier);
                const names = (namedList ?? '').split(',').map((part) => part.trim().split(/\s+as\s+/)[0]).filter(Boolean);
                for (const name of [...names, ...(defaultName ? ['default'] : [])]) {
                    if (!available.has(name)) {
                        problems.push(`${shortName}: ${specifier} no exporta ${name}`);
                    }
                }
            }
        }
    }
    return problems;
}

const workFolder = await mkdtemp(join(tmpdir(), 'calcita-cli-'));
let failures = 0;
try {
    runCli(workFolder, ['new', 'recommended-app']);
    runCli(workFolder, [
        'new', 'other-app', '--forms=react-hook-form', '--texts=i18next', '--menu-position=top', '--colors=mui', '--color-modes=lightOnly',
        '--style=minimal', '--auth=no', '--pwa=no',
    ]);
    const otherApp = join(workFolder, 'other-app');
    runCli(otherApp, ['make:module', 'purchase-orders', '--label-es', 'Órdenes de compra', '--label-en', 'Purchase orders']);
    runCli(otherApp, ['make:page', 'purchase-orders', 'OrderDetail']);
    runCli(otherApp, ['make:form', 'purchase-orders', 'SupplierForm']);
    runCli(otherApp, ['make:component', 'StatusBadge']);
    runCli(otherApp, ['make:component', 'OrderTotals', '--module', 'purchase-orders']);

    for (const project of ['recommended-app', 'other-app']) {
        const problems = await problemsOf(join(workFolder, project));
        const fileCount = (await sourceFilesOf(join(workFolder, project, 'src'))).length;
        if (problems.length > 0) {
            failures += problems.length;
            problems.forEach((problem) => console.log(`FALLA  ${project}/${problem}`));
        } else {
            console.log(`OK     ${project}: ${fileCount} archivos compilan y sus imports existen`);
        }
    }
    // lo que no debe salir con cada opción
    const checks = [
        ['other-app/src/app/i18n.js', true], ['other-app/src/modules/auth', false], ['other-app/public/manifest.webmanifest', false],
        ['recommended-app/public/manifest.webmanifest', true], ['recommended-app/src/modules/auth/SignInPage.jsx', true],
        ['recommended-app/.gitignore', true], ['other-app/src/modules/purchaseOrders/components/OrderTotals.jsx', true],
    ];
    for (const [path, shouldExist] of checks) {
        if (existsSync(join(workFolder, path)) !== shouldExist) {
            failures += 1;
            console.log(`FALLA  ${path} ${shouldExist ? 'falta' : 'no debía salir'}`);
        }
    }
} catch (error) {
    failures += 1;
    console.log(`TRUENA ${error.stdout ?? ''}${error.message.split('\n')[0]}`);
} finally {
    await rm(workFolder, {recursive: true, force: true});
}
process.exitCode = failures === 0 ? 0 : 1;
console.log(failures === 0 ? 'el CLI arma bien' : `${failures} con problema`);
