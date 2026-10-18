// La configuración de Vite: React y el alias @/ (= src/). El alias va también en jsconfig.json, para que el editor
// (PhpStorm, VS Code) encuentre los archivos y no marque en rojo los imports.
import {fileURLToPath, URL} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// OJO: dos copias de React, de MUI o del router rompen los hooks y los contextos (Calcita pediría el tema o el router a SU
// copia y no encontraría los de la app). dedupe obliga a que todos usen la de este proyecto.
const SINGLE_COPY_PACKAGES = [
    'react', 'react-dom', 'react-router', '@mui/material', '@emotion/react', '@emotion/styled', 'sonner', 'xstate', '@xstate/react',
//#if hookForm
    'react-hook-form',
//#endif
];

// el aviso de Vite de «archivo de más de 500 kB» saldría desde el primer build: React, MUI y el router ya pesan unos 520 kB
// de los ~790 kB del archivo principal (medido con el proyecto recién creado). Cada pantalla va aparte (rutas lazy)
const LARGEST_CHUNK_KILOBYTES = 1000;

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {'@': fileURLToPath(new URL('./src', import.meta.url))},
        dedupe: SINGLE_COPY_PACKAGES,
    },
    build: {chunkSizeWarningLimit: LARGEST_CHUNK_KILOBYTES},
});
