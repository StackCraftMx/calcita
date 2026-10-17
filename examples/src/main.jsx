// La entrada de la app de ejemplos: el tema por fuera de todo y el router adentro. Lo demás del framework se conecta en
// AppProviders (la ruta raíz), porque necesita estar dentro del router.
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router/dom';
import {buildYupLocale} from '@stackcraftmx/calcita/forms';

import {AppThemeProvider} from '@/app/AppThemeProvider.jsx';
import {appRouter} from '@/app/appRouter.jsx';

// los mensajes de yup como llaves de texto, para que salgan en el idioma activo. Una sola vez y antes de armar el primer
// esquema (por eso los esquemas de los módulos se arman dentro de una función y no al importar el archivo)
buildYupLocale();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AppThemeProvider>
            <RouterProvider router={appRouter} />
        </AppThemeProvider>
    </StrictMode>,
);
