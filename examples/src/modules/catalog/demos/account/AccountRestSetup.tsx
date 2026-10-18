// La cuenta completa con un backend que sigue el contrato REST de Calcita: el conector es una línea, el proveedor va por
// fuera de ToolkitProvider y cada pantalla en su ruta.
import type {ReactNode} from 'react';
import {ToolkitProvider, createApiClient} from '@stackcraftmx/calcita';
import {
    AccountProvider, ForgotPasswordScreen, ProfileScreen, ResetPasswordScreen, SignInScreen, createRestAccountConnector,
} from '@stackcraftmx/calcita/account';

const apiClient = createApiClient({baseUrl: import.meta.env.VITE_API_URL});

// lo ÚNICO de la app: las llamadas a su backend
export const accountConnector = createRestAccountConnector(apiClient);

export const AppProviders = ({children}: {children: ReactNode}) => (
    <AccountProvider connector={accountConnector}>
        {(canAccess) => (
            <ToolkitProvider appName="Mi tienda" canAccess={canAccess}>
                {children}
            </ToolkitProvider>
        )}
    </AccountProvider>
);

// las pantallas, en sus rutas (las de entrar, fuera del marco de la app)
export const accountRoutes = [
    {path: '/sign-in', element: <SignInScreen forgotPasswordPath="/forgot-password" />},
    {path: '/forgot-password', element: <ForgotPasswordScreen signInPath="/sign-in" />},
    {path: '/reset-password', element: <ResetPasswordScreen signInPath="/sign-in" forgotPasswordPath="/forgot-password" />},
    {path: '/profile', element: <ProfileScreen />},
];
