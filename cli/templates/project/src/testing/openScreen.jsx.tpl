// Abre una pantalla como la abre una persona: la app COMPLETA (sus rutas, el marco, la sesión, el menú y los avisos) en una
// dirección, con el servidor de mentira contestando (src/fakeServer; sin VITE_API_URL).
//
//     const {user} = await openScreen('/orders');
//     await screen.findByRole('heading', {name: 'Pedidos'});
//     await user.click(screen.getByRole('button', {name: 'Guardar'}));
//
// Por qué la app completa y no el componente suelto: la prueba pasa por lo mismo que la persona (permisos, menú, textos y
// avisos) y no hay un segundo armado de proveedores que se desfase del de la app.
//
// OJO: para esperar a que algo desaparezca, waitForElementToBeRemoved; nunca un waitFor que compare con null: en cada intento
// imprime la página entera y con la app completa se acaba la memoria.
import {render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {RouterProvider, createMemoryRouter} from 'react-router';
import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';

import {appRoutes} from '@/app/appRouter.jsx';
import {appTheme} from '@/app/appTheme.js';
//#if auth
import {DEMO_SESSION_STORAGE_KEY, DEMO_USER} from '@/core/accountConnector.js';
//#endif

//#if auth
/**
 * Abre la app en una dirección.
 *
 * @param {string} path la dirección de la pantalla, con su query (p. ej. '/orders?status=pending')
 * @param {{signedIn?: boolean}} [options] signedIn: entra con la persona de la demostración sin pasar por la pantalla de
 *     entrar (por omisión, sí); con false se ve la app como alguien sin sesión
 * @returns {Promise<{user: object, router: object}>} la persona que da clics y escribe, y el router (para revisar a dónde fue)
 */
export async function openScreen(path, {signedIn = true} = {}) {
    if (signedIn) {
        // la demostración recuerda la sesión en este navegador con el id de la persona
        window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, DEMO_USER.id);
    }
//#endif
//#if !auth
/**
 * Abre la app en una dirección.
 *
 * @param {string} path la dirección de la pantalla, con su query (p. ej. '/orders?status=pending')
 * @returns {Promise<{user: object, router: object}>} la persona que da clics y escribe, y el router (para revisar a dónde fue)
 */
export async function openScreen(path) {
//#endif
    const router = createMemoryRouter(appRoutes, {initialEntries: [path]});
    const user = userEvent.setup();
    render(
        <ThemeProvider theme={appTheme}>
            <CssBaseline />
            <RouterProvider router={router} />
        </ThemeProvider>,
    );
    return {user, router};
}
