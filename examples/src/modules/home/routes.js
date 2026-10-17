// Las rutas del módulo de inicio: la página principal.
//
// lazy: la pantalla se descarga hasta que alguien la abre
export const routes = [
    {index: true, lazy: async () => ({Component: (await import('@/modules/home/HomePage.jsx')).HomePage})},
];
