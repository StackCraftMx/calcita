// La entrada de la app: el tema por fuera de todo y el router adentro. Lo demás del framework se conecta en AppProviders
// (la ruta raíz), porque necesita estar dentro del router.
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router/dom';
import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {buildYupLocale} from '@stackcraftmx/calcita/forms';

import {appRouter} from '@/app/appRouter.jsx';
import {appTheme} from '@/app/appTheme.js';

// los mensajes de yup como llaves de texto, para que salgan en el idioma activo. Una sola vez y antes de armar el primer
// esquema (por eso los esquemas de los formularios se arman dentro de una función y no al importar su archivo)
buildYupLocale();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider theme={appTheme}>
            <CssBaseline />
            <RouterProvider router={appRouter} />
        </ThemeProvider>
    </StrictMode>,
);
