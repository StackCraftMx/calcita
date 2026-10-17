// Pruebas de quién puede ver qué. Sin navegador: pnpm test. Los permisos y roles son inventados.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {allowOnlyUnrestricted, createAccessChecker} from '@/access/accessRules.js';

test('sin regla lo ve cualquiera; un proyecto sin permisos no abre lo que sí tiene regla', () => {
    assert.equal(allowOnlyUnrestricted(undefined), true);
    assert.equal(allowOnlyUnrestricted({ability: 'orders.view'}), false);
    assert.equal(createAccessChecker()(undefined), true);
});

test('por permisos: uno, alguno o todos (RBAC)', () => {
    const canAccess = createAccessChecker({abilities: ['orders.view', 'reports.view']});
    assert.equal(canAccess({ability: 'orders.view'}), true);
    assert.equal(canAccess({ability: 'users.admin'}), false);
    assert.equal(canAccess({anyOf: ['users.admin', 'reports.view']}), true);
    assert.equal(canAccess({allOf: ['orders.view', 'users.admin']}), false);
});

test('por roles', () => {
    const canAccess = createAccessChecker({roles: ['supervisor']});
    assert.equal(canAccess({role: 'supervisor'}), true);
    assert.equal(canAccess({anyRole: ['admin', 'supervisor']}), true);
    assert.equal(canAccess({role: 'admin'}), false);
});

test('por políticas con nombre y por una regla escrita ahí mismo (ABAC)', () => {
    const context = {user: {id: 7, organizationId: 3}, record: {ownerId: 7, organizationId: 4}};
    const canAccess = createAccessChecker({
        context,
        policies: {
            ownsRecord: ({user, record}) => user.id === record.ownerId,
            sameOrganization: ({user, record}) => user.organizationId === record.organizationId,
        },
    });
    assert.equal(canAccess({policy: 'ownsRecord'}), true);
    assert.equal(canAccess({policies: ['ownsRecord', 'sameOrganization']}), false);
    assert.equal(canAccess({check: ({user}) => user.id > 5}), true);
    assert.throws(() => canAccess({policy: 'noExiste'}), /noExiste/);
});

test('las formas se combinan: todas tienen que cumplirse', () => {
    const canAccess = createAccessChecker({abilities: ['orders.view'], roles: ['seller'], context: {hour: 22}});
    assert.equal(canAccess({ability: 'orders.view', role: 'seller'}), true);
    assert.equal(canAccess({ability: 'orders.view', role: 'seller', check: ({hour}) => hour < 20}), false);
});
