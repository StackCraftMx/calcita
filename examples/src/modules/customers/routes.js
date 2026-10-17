// Las rutas del módulo de formularios: el alta con formik, el alta con react-hook-form y la solicitud por pasos.
import {CUSTOMERS_PATHS} from '@/modules/customers/customersPaths.js';

// lazy: cada pantalla (y sus librerías de formularios) se descarga hasta que alguien la abre
export const routes = [
    {path: CUSTOMERS_PATHS.formik, lazy: async () => ({Component: (await import('@/modules/customers/NewCustomerPage.jsx')).NewCustomerPage})},
    {
        path: CUSTOMERS_PATHS.hookForm,
        lazy: async () => ({Component: (await import('@/modules/customers/NewCustomerHookFormPage.jsx')).NewCustomerHookFormPage}),
    },
    {path: CUSTOMERS_PATHS.creditRequest, lazy: async () => ({Component: (await import('@/modules/customers/CreditRequestPage.jsx')).CreditRequestPage})},
];
