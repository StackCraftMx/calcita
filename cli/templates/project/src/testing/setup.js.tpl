// Lo que necesita cada prueba de pantalla antes de empezar (vite.config.js, test.setupFiles).
//
// - Llena lo que jsdom (el navegador de mentira de las pruebas) no trae y la app usa (browserGaps.js).
// - Los mensajes de yup como llaves de texto, igual que main.jsx: así salen en el idioma activo.
// - Al terminar cada prueba borra lo que dibujó y lo que guardó el navegador: sin esto, la siguiente prueba vería la sesión,
//   el modo oscuro o los filtros recordados de la anterior.
import {afterEach} from 'vitest';
import {cleanup, configure} from '@testing-library/react';
import {buildYupLocale} from '@stackcraftmx/calcita/forms';

import {fillBrowserGaps, savedFiles} from '@/testing/browserGaps.js';

fillBrowserGaps();
buildYupLocale();

// findBy… espera hasta 5 s: una pantalla completa (rutas lazy, servidor de mentira con su demora) tarda más que el segundo
// de fábrica
configure({asyncUtilTimeout: 5000});

afterEach(() => {
    cleanup();
    savedFiles.length = 0;
    window.localStorage.clear();
    window.sessionStorage.clear();
});
