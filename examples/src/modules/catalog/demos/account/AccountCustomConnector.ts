// Un backend que no sigue el contrato al pie de la letra. No se cambia el backend ni se escribe todo el conector: se parte
// del de Calcita y solo se cambia lo distinto. TypeScript avisa si una función no regresa lo que piden las pantallas.
import {createApiClient} from '@stackcraftmx/calcita';
import {createRestAccountConnector} from '@stackcraftmx/calcita/account';
import type {AccountConnector} from '@stackcraftmx/calcita/account';

const apiClient = createApiClient({baseUrl: '/api/v2'});

interface LoginResponse {
    mfa_required: boolean;
}

export const accountConnector: AccountConnector = {
    // 1. Las rutas que se llaman distinto (las demás, como en el contrato)
    ...createRestAccountConnector(apiClient, {paths: {session: '/me', signOut: '/logout'}}),
    // 2. Solo la función cuya respuesta tiene otra forma: este backend entra en /login, con «username», y avisa el segundo
    //    paso con mfa_required en lugar de second_step
    signIn: async ({email, password, remember}) => {
        const response: LoginResponse = await apiClient.post('/login', {username: email, password, remember});
        return {secondStep: response.mfa_required ? {methods: ['totp', 'recoveryCode']} : null};
    },
};
