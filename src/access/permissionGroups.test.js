// Pruebas de la lógica de perfiles y permisos. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {composePermissionGroups, groupStateOf, withPermission, withPermissionGroup} from '@/access/permissionGroups.js';

const ORDERS = {key: 'orders', permissions: [{key: 'orders.view'}, {key: 'orders.cancel'}, {key: 'orders.export'}]};

test('el estado del grupo dice cuántos tiene y si son todos, algunos o ninguno', () => {
    assert.deepEqual(groupStateOf(ORDERS, ['orders.view', 'reports.download']), {grantedCount: 1, total: 3, isAll: false, isSome: true});
    assert.deepEqual(groupStateOf(ORDERS, ['orders.view', 'orders.cancel', 'orders.export']), {grantedCount: 3, total: 3, isAll: true, isSome: false});
    assert.deepEqual(groupStateOf(ORDERS, []), {grantedCount: 0, total: 3, isAll: false, isSome: false});
    assert.equal(groupStateOf({permissions: []}, []).isAll, false);
});

test('prender un permiso lo agrega una sola vez; apagarlo lo quita sin mover los demás', () => {
    assert.deepEqual(withPermission(['a', 'b'], 'c', true), ['a', 'b', 'c']);
    assert.deepEqual(withPermission(['a', 'b'], 'a', true), ['a', 'b']);
    assert.deepEqual(withPermission(['a', 'b', 'c'], 'b', false), ['a', 'c']);
});

test('el grupo entero se prende o se apaga sin tocar los permisos de otros grupos', () => {
    assert.deepEqual(withPermissionGroup(['reports.download', 'orders.view'], ORDERS, true),
        ['reports.download', 'orders.view', 'orders.cancel', 'orders.export']);
    assert.deepEqual(withPermissionGroup(['reports.download', 'orders.view', 'orders.cancel'], ORDERS, false), ['reports.download']);
});

test('los grupos salen de los menu.js que declaran permisos, en el orden del menú y con sus textos', () => {
    const t = (key) => `«${key}»`;
    const menuModules = {
        '/modules/reports/menu.js': {order: 40, buildMenuItem: () => ({to: '/reports', labelKey: 'reports:menu.label'}), permissions: [{key: 'reports.download', labelKey: 'reports:permissions.download'}]},
        '/modules/home/menu.js': {order: 1, buildMenuItem: () => ({to: '/', label: 'Inicio'})},
        '/modules/orders/menu.js': {order: 10, buildMenuItem: () => ({to: '/orders', label: 'Pedidos'}), permissions: [
            {key: 'orders.view', label: 'Ver pedidos', descriptionKey: 'orders:permissions.viewDescription'},
        ]},
    };

    assert.deepEqual(composePermissionGroups(menuModules, t), [
        {key: '/orders', label: 'Pedidos', permissions: [{key: 'orders.view', label: 'Ver pedidos', description: '«orders:permissions.viewDescription»'}]},
        {key: '/reports', label: '«reports:menu.label»', permissions: [{key: 'reports.download', label: '«reports:permissions.download»', description: undefined}]},
    ]);
});
