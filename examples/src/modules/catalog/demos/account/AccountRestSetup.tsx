// La cuenta completa cuando su backend sigue el contrato REST de Calcita (las rutas y las llaves están en el README).
// Son tres pasos y no hay pantallas que escribir: entrar, «¿Olvidó su contraseña?», la contraseña nueva y Mi perfil ya vienen
// hechos.
import type {ReactNode} from 'react';
import {ToolkitProvider, createApiClient} from '@stackcraftmx/calcita';
import {
    AccountProvider, ForgotPasswordScreen, ProfileScreen, ResetPasswordScreen, SignInScreen, createRestAccountConnector,
} from '@stackcraftmx/calcita/account';

const apiClient = createApiClient({baseUrl: import.meta.env.VITE_API_URL});

// 1. El conector: cómo se llama a su backend. Con el contrato es una línea (si su backend es distinto, vea la sección 2)
export const accountConnector = createRestAccountConnector(apiClient);

// 2. El proveedor alrededor de la app: carga la sesión al abrir y le pasa a ToolkitProvider quién puede ver qué (canAccess)
export const AppProviders = ({children}: {children: ReactNode}) => (
    <AccountProvider connector={accountConnector}>
        {(canAccess) => (
            <ToolkitProvider appName="Mi tienda" canAccess={canAccess}>
                {children}
            </ToolkitProvider>
        )}
    </AccountProvider>
);

// 3. Cada pantalla en su ruta: las de entrar, fuera del marco de la app; Mi perfil, adentro. Lo de abajo es lo mínimo; la
//    tabla «Cómo se extiende» trae todo lo demás que acepta cada pantalla
export const accountRoutes = [
    {path: '/sign-in', element: <SignInScreen forgotPasswordPath="/forgot-password" />},
    {path: '/forgot-password', element: <ForgotPasswordScreen signInPath="/sign-in" />},
    {path: '/reset-password', element: <ResetPasswordScreen signInPath="/sign-in" forgotPasswordPath="/forgot-password" />},
    {path: '/profile', element: <ProfileScreen />},
];
