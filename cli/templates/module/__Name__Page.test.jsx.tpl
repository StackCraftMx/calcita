// La prueba de pantalla de __LABEL_ES__ (la armó el CLI de Calcita con make:module): la app completa abre en su ruta, con su
// servidor de mentira, enseña lo que manda el servidor y agrega uno. Cámbiela junto con la pantalla.
//
//     pnpm test
import {screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {__NAME___PATH} from '@/modules/__name__/routes.js';
import {openScreen} from '@/testing/openScreen.jsx';

describe('__LABEL_ES__', () => {
    it('enseña lo que manda el servidor', async () => {
        await openScreen(__NAME___PATH);
        expect(await screen.findByRole('heading', {name: '__LABEL_ES__'})).toBeTruthy();
        expect(await screen.findByText('Primer ejemplo')).toBeTruthy();
    });

    it('agrega uno y sale en la lista', async () => {
        const {user} = await openScreen(__NAME___PATH);
        await user.type(await screen.findByRole('textbox', {name: 'Nombre'}), 'Uno nuevo');
        await user.click(screen.getByRole('button', {name: 'Guardar'}));
        expect(await screen.findByText('Uno nuevo')).toBeTruthy();
    });
});
