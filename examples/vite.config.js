// Los ejemplos se construyen como cualquier proyecto que instala el paquete: importan @stackcraftmx/calcita desde su
// dist/ (el enlace del workspace de pnpm), no desde su código fuente. Por eso antes hay que construir el paquete
// (pnpm run examples lo hace solo).
import {fileURLToPath, URL} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

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
const extraAllowedHosts = (process.env.EXAMPLES_ALLOWED_HOSTS ?? '').split(',').map((host) => host.trim()).filter(Boolean);

export default defineConfig({
    plugins: [react()],
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
