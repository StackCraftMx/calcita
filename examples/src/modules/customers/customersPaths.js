// Las direcciones del módulo de formularios. La primera vive en core (la usa la barra de navegación).
import {APP_PATHS} from '@/core';

export const CUSTOMERS_PATHS = Object.freeze({
    formik: APP_PATHS.customers,
    hookForm: `${APP_PATHS.customers}/hook-form`,
    creditRequest: `${APP_PATHS.customers}/credit-request`,
});
