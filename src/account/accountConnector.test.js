import assert from 'node:assert/strict';
import {test} from 'node:test';

import {ACCOUNT_CONNECTOR_FUNCTIONS, missingConnectorFunctionsOf} from '@/account/accountConnector.js';

test('dice qué funciones le faltan al conector', () => {
    const complete = Object.fromEntries(ACCOUNT_CONNECTOR_FUNCTIONS.map((name) => [name, async () => {}]));
    assert.deepEqual(missingConnectorFunctionsOf(complete), []);
    const {signIn, listActivity, ...incomplete} = complete;
    assert.deepEqual(missingConnectorFunctionsOf(incomplete), ['signIn', 'listActivity']);
    assert.equal(missingConnectorFunctionsOf(null).length, ACCOUNT_CONNECTOR_FUNCTIONS.length);
});
