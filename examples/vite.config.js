// Los ejemplos se construyen como cualquier proyecto que instala el paquete: importan @stackcraftmx/calcita desde su
// dist/ (el enlace del workspace de pnpm), no desde su código fuente. Por eso antes hay que construir el paquete
// (pnpm run examples lo hace solo).
import {readFile} from 'node:fs/promises';
import {fileURLToPath, URL} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

import {demoSourcesOf} from './tooling/demoSource.js';

// OJO: dos copias de React (o de MUI, emotion, el router o react-hook-form) rompen los hooks y los contextos: el paquete pediría
// el tema, el router o el formulario a SU copia y no encontraría el de la app. dedupe obliga a que todos usen la copia de
// este proyecto. Solo van las que el proyecto instala directo; una que no esté en su package.json no se puede resolver.
// FilePond también: sus complementos se registran en SU copia, y con dos copias la zona no validaría tipos ni pesos. Y
// dayjs: el idioma del calendario se registra en su copia. formik y yup no van: el proyecto no los instala, vienen con
// el paquete (se importan de @stackcraftmx/calcita/forms).
const SINGLE_COPY_PACKAGES = [
    'react', 'react-dom', 'react-router', '@mui/material', '@emotion/react', '@emotion/styled', 'nuqs', '@xstate/react', 'xstate',
    'sonner', 'filepond', 'react-filepond', 'react-hook-form', 'dayjs',
];

// exceljs pesa casi 1 MB y se carga solo al pedir el Excel (import dinámico): es un archivo aparte que la pantalla no
// espera. El aviso de Vite de «archivo de más de 500 kB» sería por él; el tope se sube lo justo para que no salga
const LARGEST_CHUNK_KILOBYTES = 1000;

// Las direcciones por las que se puede entrar al servidor de desarrollo además de localhost: la del túnel de la demo
// (scripts/tunnel.sh). Vite rechaza cualquier otra con 403 («Blocked request»), que lo protege de que una página ajena lo
// lea desde el navegador. Otra dirección se agrega con EXAMPLES_ALLOWED_HOSTS="una.com,otra.com".
const DEMO_HOSTS = ['calcita.stackcraft.com.mx'];

// Detrás de un proxy con prefijo (calcita.stackcraft.com.mx/demo/, sin subdominio): UNA variable al construir, ASSET_URL=/demo,
// la misma línea que lleva el .env del servidor. Vite pide sus archivos con el prefijo y lo deja en import.meta.env.BASE_URL,
// de donde lo toman el router, las imágenes y version.json (src/core/publicPaths.js). Sin ella, todo en la raíz (el servidor de
// desarrollo de siempre). Con otro prefijo hay que volver a construir.
const basePathOf = (assetUrl) => {
    const prefix = (assetUrl ?? '').trim().replace(/^\/+|\/+$/g, '');
    return prefix ? `/${prefix}/` : '/';
};
const extraAllowedHosts = (process.env.EXAMPLES_ALLOWED_HOSTS ?? '').split(',').map((host) => host.trim()).filter(Boolean);

// El código de los ejemplos del catálogo para su «Ver código»: import('…/Demo.tsx?demo-source') da {ts, js}
// (tooling/demoSource.js). Va con un id propio (\0…) para que ningún otro plugin lo trate como componente.
const DEMO_SOURCE_QUERY = '?demo-source';

// La versión de esta compilación: va dentro de la app (import.meta.env.VITE_BUILD_ID → ToolkitProvider buildId) y en
// version.json, que la app publicada vuelve a leer al abrirla para saber si ya hay otra (usePublishedBuildWatch). Se puede
// fijar desde afuera (VITE_BUILD_ID=… al construir, p. ej. el commit); si no, la hora en que se construyó
const BUILD_ID = process.env.VITE_BUILD_ID || new Date().toISOString();

function buildVersionPlugin() {
    return {
        name: 'calcita-build-version',
        apply: 'build',
        generateBundle() {
            this.emitFile({type: 'asset', fileName: 'version.json', source: JSON.stringify({buildId: BUILD_ID})});
        },
    };
}
const DEMO_SOURCE_PREFIX = '\0demo-source:';

function demoSourcePlugin() {
    return {
        name: 'calcita-demo-source',
        // OJO: antes que el resolvedor de Vite; si no, él resolvía '…/Demo.tsx?demo-source' al componente y «Ver código»
        // recibía el ejemplo en lugar de su código (React tronaba al guardarlo como si fuera texto)
        enforce: 'pre',
        async resolveId(id, importer) {
            if (!id.endsWith(DEMO_SOURCE_QUERY)) {
                return null;
            }
            // primero la ruta real del .tsx (con el alias @/ ya resuelto); una ruta mal escrita truena al construir
            const demoFile = await this.resolve(id.slice(0, -DEMO_SOURCE_QUERY.length), importer, {skipSelf: true});
            if (!demoFile) {
                this.error(`No existe el ejemplo ${id}`);
            }
            return DEMO_SOURCE_PREFIX + demoFile.id;
        },
        async load(id) {
            if (!id.startsWith(DEMO_SOURCE_PREFIX)) {
                return null;
            }
            const demoFile = id.slice(DEMO_SOURCE_PREFIX.length);
            // al editar el ejemplo se vuelve a sacar su código
            this.addWatchFile(demoFile);
            const sources = await demoSourcesOf(await readFile(demoFile, 'utf8'), demoFile);
            return `export default ${JSON.stringify(sources)};`;
        },
    };
}

export default defineConfig({
    base: basePathOf(process.env.ASSET_URL),
    plugins: [react(), demoSourcePlugin(), buildVersionPlugin()],
    define: {'import.meta.env.VITE_BUILD_ID': JSON.stringify(BUILD_ID)},
    resolve: {
        alias: {'@': fileURLToPath(new URL('./src', import.meta.url))},
        dedupe: SINGLE_COPY_PACKAGES,
    },
    server: {
        allowedHosts: [...DEMO_HOSTS, ...extraAllowedHosts],
    },
    preview: {
        allowedHosts: [...DEMO_HOSTS, ...extraAllowedHosts],
    },
    build: {
        chunkSizeWarningLimit: LARGEST_CHUNK_KILOBYTES,
    },
});
