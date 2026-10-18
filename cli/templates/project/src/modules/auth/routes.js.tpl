// Las pantallas de entrar: van FUERA del marco (publicRoutes), porque quien llega aquí todavía no tiene sesión.
import {APP_PATHS} from '@/core';

export const routes = [];

// lazy: cada pantalla se descarga hasta que alguien la abre
export const publicRoutes = [
    {path: APP_PATHS.signIn, lazy: async () => ({Component: (await import('@/modules/auth/SignInPage.jsx')).SignInPage})},
    {path: APP_PATHS.forgotPassword, lazy: async () => ({Component: (await import('@/modules/auth/ForgotPasswordPage.jsx')).ForgotPasswordPage})},
];
