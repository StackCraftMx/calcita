// Un backend que no sigue el contrato al pie de la letra: se cambia la ruta que se llama distinto y solo la función cuya
// respuesta tiene otra forma. TypeScript avisa si la función no regresa lo que piden las pantallas.
import {createApiClient} from '@stackcraftmx/calcita';
import {createRestAccountConnector} from '@stackcraftmx/calcita/account';
import type {AccountConnector} from '@stackcraftmx/calcita/account';

const apiClient = createApiClient({baseUrl: '/api/v2'});

interface LoginResponse {
    mfa_required: boolean;
}

export const accountConnector: AccountConnector = {
    ...createRestAccountConnector(apiClient, {paths: {session: '/me', signOut: '/logout'}}),
    // este backend entra en /login, con «username», y avisa el segundo paso con mfa_required
    signIn: async ({email, password, remember}) => {
        const response: LoginResponse = await apiClient.post('/login', {username: email, password, remember});
        return {secondStep: response.mfa_required ? {methods: ['totp', 'recoveryCode']} : null};
    },
};
