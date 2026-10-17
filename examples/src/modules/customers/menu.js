// La entrada del módulo en el menú de la app (composeMenu del framework la descubre sola: no hay lista central que editar),
// con un submenú para sus tres formularios.
//
// access es la regla de quién lo ve; la misma protege sus rutas (withAccess en app/appRouter.jsx).
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';

import {APP_PATHS} from '@/core';
import {CUSTOMERS_PATHS} from '@/modules/customers/customersPaths.js';

export const order = 20;

export const access = {ability: 'customers.create'};

// los permisos que pide este módulo: la pantalla de perfiles los junta con los de los demás (composePermissionGroups)
export const permissions = [
    {key: 'customers.create', labelKey: 'customers:permissions.create', descriptionKey: 'customers:permissions.createDescription'},
];

export function buildMenuItem() {
    return {
        to: APP_PATHS.customers,
        labelKey: 'customers:menu.label',
        descriptionKey: 'customers:menu.description',
        sectionKey: 'shell:sections.operation',
        Icon: AssignmentOutlinedIcon,
        // un submenú: en el menú lateral se abre en su lugar; en las tarjetas del inicio la entrada lleva a la primera. Cada
        // hija con su ícono, como las barras laterales de Apple: se recorren con la vista sin leer
        children: [
            {to: CUSTOMERS_PATHS.formik, labelKey: 'customers:nav.formik', Icon: PersonAddAltOutlinedIcon},
            {to: CUSTOMERS_PATHS.hookForm, labelKey: 'customers:nav.hookForm', Icon: PersonAddAlt1OutlinedIcon},
            {to: CUSTOMERS_PATHS.creditRequest, labelKey: 'customers:nav.creditRequest', Icon: FormatListNumberedOutlinedIcon},
        ],
    };
}
