// La misma regla en el menú, en las rutas y en los botones:
//   - menu.js: `access` decide si el módulo sale en el menú y protege sus rutas (withAccess en el router); `permissions`
//     declara los permisos del módulo para la pantalla de perfiles (composePermissionGroups los junta: no hay lista central);
//   - Can y useCan: un botón o un bloque solo para quien puede;
//   - RequireAccess: una parte de la pantalla (o toda) con la página de «sin permiso» para quien no.
import Button from '@mui/material/Button';
import {Can, RequireAccess, useCan} from '@stackcraftmx/calcita';

// modules/orders/menu.js
export const access = {ability: 'orders.view'};
export const permissions = [
    {key: 'orders.view', labelKey: 'orders:permissions.view'},
    {key: 'orders.cancel', labelKey: 'orders:permissions.cancel', descriptionKey: 'orders:permissions.cancelDescription'},
];

export const OrderActions = () => {
    // el mismo permiso, en código: p. ej. para no pedir datos que no se van a enseñar
    const canExport = useCan({ability: 'orders.export'});
    return (
        <>
            <Can access={{ability: 'orders.cancel'}}>
                <Button color="error">Cancelar pedido</Button>
            </Can>
            {canExport && <Button>Exportar</Button>}
        </>
    );
};

export const ReportsSection = () => (
    <RequireAccess access={{anyOf: ['reports.view', 'reports.admin']}}>
        <p>Los reportes del mes…</p>
    </RequireAccess>
);
