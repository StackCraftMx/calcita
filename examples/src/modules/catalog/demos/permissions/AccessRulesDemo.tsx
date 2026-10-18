// Quién puede ver qué: createAccessChecker arma la regla con lo que manda la sesión (permisos y roles) y las políticas del
// proyecto (ABAC). El menú, las rutas y los botones preguntan con la misma regla. OJO: esto decide lo que se PINTA; el
// backend lo vuelve a decidir en cada petición.
import {useState} from 'react';
import Stack from '@mui/material/Stack';
import {DefinitionList, PermissionMatrix, createAccessChecker} from '@stackcraftmx/calcita';

interface Order {
    ownerId: string;
    status: string;
}

// 1. La regla, armada UNA vez con lo que manda la sesión (sus permisos y su rol) y las reglas de su negocio (policies).
//    En su app la arma la cuenta (AccountProvider) y la recibe ToolkitProvider; aquí va a mano para enseñarla
const canAccess = createAccessChecker({
    abilities: ['orders.view', 'orders.cancel'],
    roles: ['supervisor'],
    policies: {ownsOrder: ({user, order}: {user: {id: string}, order: Order}) => order.ownerId === user.id},
    context: {user: {id: 'user-ana'}, order: {ownerId: 'user-ana', status: 'paid'}},
});

// 2. Los permisos por módulo, juntos para la pantalla de perfiles. En su app salen de cada menu.js con
//    composePermissionGroups; aquí van a mano
const GROUPS = [
    {key: 'orders', label: 'Pedidos', permissions: [
        {key: 'orders.view', label: 'Ver pedidos'},
        {key: 'orders.cancel', label: 'Cancelar pedidos', description: 'Antes de que salgan del almacén'},
    ]},
    {key: 'reports', label: 'Reportes', permissions: [{key: 'reports.view', label: 'Ver y descargar reportes'}]},
];

const yesOrNo = (isAllowed: boolean) => (isAllowed ? '✓ sí' : '✗ no');

const AccessRulesDemo = () => {
    const [abilities, setAbilities] = useState(['orders.view']);
    return (
        <Stack spacing={3}>
            {/* 3. Preguntar: cada renglón es una regla y su respuesta para esta sesión */}
            <DefinitionList entries={[
                {label: "{ability: 'orders.cancel'}", value: yesOrNo(canAccess({ability: 'orders.cancel'}))},
                {label: "{allOf: ['orders.view', 'reports.view']}", value: yesOrNo(canAccess({allOf: ['orders.view', 'reports.view']}))},
                {label: "{anyRole: ['admin', 'supervisor']}", value: yesOrNo(canAccess({anyRole: ['admin', 'supervisor']}))},
                {label: "{policy: 'ownsOrder'}", value: yesOrNo(canAccess({policy: 'ownsOrder'}))},
                {label: 'sin regla (cualquiera con sesión)', value: yesOrNo(canAccess(undefined))},
            ]} />
            {/* 4. Dar o quitar permisos a un perfil: lo elegido se guarda en su backend con onChange */}
            <PermissionMatrix groups={GROUPS} value={abilities} onChange={setAbilities} />
        </Stack>
    );
};

export default AccessRulesDemo;
