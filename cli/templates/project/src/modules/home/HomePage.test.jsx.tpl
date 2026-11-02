// La prueba de pantalla del inicio: la app completa abre en «/» y enseña la bienvenida con sus primeros pasos. Es el ejemplo
// para las demás: abrir la pantalla, buscar lo que ve la persona por su papel y su nombre, y picar como ella.
//
//     pnpm test
import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {openScreen} from '@/testing/openScreen.jsx';

describe('el inicio', () => {
    it('enseña la bienvenida y cómo seguir con el CLI', async () => {
        await openScreen('/');
        expect(await screen.findByRole('heading', {name: 'Bienvenida'})).toBeTruthy();
        expect(screen.getByText('pnpm exec calcita make:module orders')).toBeTruthy();
    });
});
