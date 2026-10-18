// La ruta de Sucursales. La pantalla viaja en su propio archivo (lazy): Leaflet solo se baja al abrirla.
export const BRANCHES_PATH = '/branches';

export const routes = [
    {path: BRANCHES_PATH, lazy: async () => ({Component: (await import('@/modules/branches/BranchesPage.jsx')).BranchesPage})},
];
