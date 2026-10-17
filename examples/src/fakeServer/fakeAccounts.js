// Las personas y los perfiles de la tienda de mentira: tres personas, una por perfil, para ver cómo cambia el menú según
// quién entra. Nombres y correos son inventados.
//
// Los perfiles traen sus permisos: los mismos textos que piden los menu.js (access: {ability: 'orders.view'}). La pantalla
// de «Perfiles y permisos» los cambia en esta memoria: al recargar la página vuelven a como estaban.
//
// Funciones puras, sin React: function (regla de la casa).

/** Los perfiles: los códigos que viajan en el API. */
export const PROFILE_KEYS = Object.freeze({
    admin: 'admin',
    supervisor: 'supervisor',
    viewer: 'viewer',
});

/** Todos los permisos que existen en la tienda. */
export const ABILITIES = Object.freeze({
    dashboardView: 'dashboard.view',
    ordersView: 'orders.view',
    ordersCancel: 'orders.cancel',
    customersCreate: 'customers.create',
    filesUpload: 'files.upload',
    reportsDownload: 'reports.download',
    metricsView: 'metrics.view',
    profilesManage: 'profiles.manage',
});

/** Los perfiles, cada uno con su nombre en los dos idiomas (en la base irían en su tabla de traducciones). */
export const fakeProfiles = [
    {
        key: PROFILE_KEYS.admin,
        names: {es: 'Administración', en: 'Administration'},
        descriptions: {es: 'Todo, incluidos los perfiles y sus permisos.', en: 'Everything, including the profiles and their permissions.'},
        abilities: Object.values(ABILITIES),
        // siempre con todo: si se le pudieran quitar los perfiles, nadie podría volver a darlos
        isLocked: true,
    },
    {
        key: PROFILE_KEYS.supervisor,
        names: {es: 'Supervisor', en: 'Supervisor'},
        descriptions: {es: 'Opera la tienda: pedidos, clientes, archivos y reportes.', en: 'Runs the store: orders, customers, files and reports.'},
        abilities: [
            ABILITIES.dashboardView, ABILITIES.ordersView, ABILITIES.ordersCancel, ABILITIES.customersCreate, ABILITIES.filesUpload,
            ABILITIES.reportsDownload, ABILITIES.metricsView,
        ],
        isLocked: false,
    },
    {
        key: PROFILE_KEYS.viewer,
        names: {es: 'Consulta', en: 'Read only'},
        descriptions: {es: 'Solo mira: el tablero, los pedidos y las métricas.', en: 'Only looks: the dashboard, the orders and the metrics.'},
        abilities: [ABILITIES.dashboardView, ABILITIES.ordersView, ABILITIES.metricsView],
        isLocked: false,
    },
];

/** Las personas: una por perfil. La de administración es la que está dentro al abrir los ejemplos. */
export const fakeUsers = [
    {
        id: 'user-ana',
        name: 'Ana Martínez Ruiz',
        email: 'ana.martinez@ejemplo.com',
        phone: '',
        positions: {es: 'Administración', en: 'Administration'},
        profileKey: PROFILE_KEYS.admin,
    },
    {
        id: 'user-sample',
        name: 'Usuario de Ejemplo',
        email: 'usuario@ejemplo.com',
        phone: '',
        positions: {es: 'Supervisor', en: 'Supervisor'},
        profileKey: PROFILE_KEYS.supervisor,
    },
    {
        id: 'user-luis',
        name: 'Luis Herrera',
        email: 'luis.herrera@ejemplo.com',
        phone: '',
        positions: {es: 'Consulta', en: 'Read only'},
        profileKey: PROFILE_KEYS.viewer,
    },
];

/**
 * Quién está dentro al abrir los ejemplos por primera vez: administración, porque ve todo el menú (también «Perfiles y
 * permisos»). Con otro perfil por omisión, quien abre los ejemplos no sabe que hay pantallas escondidas.
 */
export const DEFAULT_SIGNED_IN_USER_ID = 'user-ana';
