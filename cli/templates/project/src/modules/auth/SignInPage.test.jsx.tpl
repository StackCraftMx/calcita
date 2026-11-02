// La prueba de pantalla de entrar: sin sesión, la app manda a «Iniciar sesión» y regresa a donde iba al entrar. Entra con
// el botón de la cuenta de ejemplo (la demostración): la prueba nunca escribe una contraseña.
//
//     pnpm test
import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {openScreen} from '@/testing/openScreen.jsx';

describe('entrar', () => {
    it('sin sesión pide entrar y después abre la pantalla que se pidió', async () => {
        const {user, router} = await openScreen('/', {signedIn: false});
        expect(await screen.findByRole('heading', {name: 'Iniciar sesión'})).toBeTruthy();

        await user.click(screen.getByRole('button', {name: 'Entrar con la cuenta de ejemplo'}));

        expect(await screen.findByRole('heading', {name: 'Bienvenida'})).toBeTruthy();
        expect(router.state.location.pathname).toBe('/');
    });
});
