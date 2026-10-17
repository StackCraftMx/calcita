import assert from 'node:assert/strict';
import {test} from 'node:test';

import {menuBadgesFrom} from '@/navigation/useMenuBadges.js';

test('los conteos del servidor se aceptan como lista o como objeto; lo que no es número se ignora', () => {
    assert.deepEqual(menuBadgesFrom({badges: [{badgeKey: 'preauthorization', count: 2}, {badgeKey: 'roto', count: 'x'}]}), {preauthorization: 2});
    assert.deepEqual(menuBadgesFrom([{badgeKey: 'file_integration', count: 5}]), {file_integration: 5});
    assert.deepEqual(menuBadgesFrom({pendingPayment: 13, nada: null}), {pendingPayment: 13});
    assert.deepEqual(menuBadgesFrom(undefined), {});
});
