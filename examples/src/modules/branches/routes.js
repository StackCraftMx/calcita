// Las rutas de Sucursales: el mapa y la ruta de reparto. Cada pantalla viaja en su propio archivo (lazy): Leaflet solo se
// baja al abrir el mapa.
export const BRANCHES_PATH = '/branches';
export const DELIVERY_ROUTE_PATH = '/branches/delivery-route';

export const routes = [
    {path: BRANCHES_PATH, lazy: async () => ({Component: (await import('@/modules/branches/BranchesPage.jsx')).BranchesPage})},
    {path: DELIVERY_ROUTE_PATH, lazy: async () => ({Component: (await import('@/modules/branches/DeliveryRoutePage.jsx')).DeliveryRoutePage})},
];
