// Las rutas que conocen varios módulos (la barra, la guardia de la sesión, «Mi perfil»). Las de un solo módulo viven en su
// routes.js.
export const APP_PATHS = Object.freeze({
    home: '/',
//#if auth
    signIn: '/sign-in',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    profile: '/profile',
//#endif
});
