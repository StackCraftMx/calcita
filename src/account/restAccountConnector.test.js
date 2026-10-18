import assert from 'node:assert/strict';
import {test} from 'node:test';

import {ACCOUNT_CONNECTOR_FUNCTIONS, missingConnectorFunctionsOf} from '@/account/accountConnector.js';
import {createRestAccountConnector} from '@/account/restAccountConnector.js';
import {ApiError} from '@/api/ApiError.js';

/** Un cliente que anota cada petición y responde lo que se le diga por ruta. */
function recordingClient(responses = {}) {
    const calls = [];
    const answer = (method) => async (path, ...rest) => {
        calls.push({method, path, args: rest});
        const response = responses[`${method} ${path}`];
        if (response instanceof Error) {
            throw response;
        }
        return response;
    };
    return {calls, client: {get: answer('GET'), post: answer('POST'), put: answer('PUT'), delete: answer('DELETE')}};
}

const SECURITY_RESPONSE = {
    is_enabled: true, enabled_at: '2026-10-01T10:00:00Z',
    passkeys: [{id: 'p1', name: 'MacBook', created_at: '2026-10-01T10:00:00Z', last_used_at: null}],
    totp: {is_enabled: true, enabled_at: '2026-10-01T10:00:00Z'}, recovery_codes_remaining: 8,
};

test('trae todas las funciones del contrato', () => {
    assert.deepEqual(missingConnectorFunctionsOf(createRestAccountConnector(recordingClient().client)), []);
    assert.ok(ACCOUNT_CONNECTOR_FUNCTIONS.length > 20);
});

test('sin sesión (401) regresa null, sin el aviso de sesión vencida', async () => {
    const {client, calls} = recordingClient({'GET /auth/session': new ApiError({status: 401, problem: {}})});
    assert.equal(await createRestAccountConnector(client).loadSession(), null);
    assert.deepEqual(calls[0].args[0], {skipUnauthenticatedHandler: true});
});

test('entrar: el segundo paso llega en camelCase (recovery_code → recoveryCode)', async () => {
    const {client, calls} = recordingClient({'POST /auth/sign-in': {second_step: {methods: ['passkey', 'totp', 'recovery_code']}}});
    const connector = createRestAccountConnector(client);
    assert.deepEqual(await connector.signIn({email: 'a@b.mx', password: 'x', remember: true}), {secondStep: {methods: ['passkey', 'totp', 'recoveryCode']}});
    assert.deepEqual(calls[0].args[0], {email: 'a@b.mx', password: 'x', remember: true});
    await connector.signInSecondStep({method: 'recoveryCode', code: 'ABCDE-FGHJK'});
    assert.deepEqual(calls[1], {method: 'POST', path: '/auth/second-step', args: [{method: 'recovery_code', code: 'ABCDE-FGHJK'}, {skipUnauthenticatedHandler: true}]});
});

test('sin segundo paso (204) ya está dentro', async () => {
    const {client} = recordingClient();
    assert.deepEqual(await createRestAccountConnector(client).signIn({email: 'a@b.mx', password: 'x'}), {secondStep: null});
});

test('la seguridad de snake_case a camelCase, y lo que quita protección manda la contraseña', async () => {
    const {client, calls} = recordingClient({
        'GET /account/security': SECURITY_RESPONSE,
        'DELETE /account/security/passkeys/p%201': {security: SECURITY_RESPONSE},
        'POST /account/security/recovery-codes': {security: SECURITY_RESPONSE, recovery_codes: ['A', 'B']},
    });
    const connector = createRestAccountConnector(client);
    const security = await connector.loadSecurity();
    assert.equal(security.recoveryCodesRemaining, 8);
    assert.equal(security.passkeys[0].createdAt, '2026-10-01T10:00:00Z');
    await connector.removePasskey({passkeyId: 'p 1', password: 'secreta'});
    assert.deepEqual(calls[1].args[0], {body: {password: 'secreta'}});
    assert.deepEqual((await connector.regenerateRecoveryCodes('secreta')).recoveryCodes, ['A', 'B']);
});

test('las rutas se cambian una por una', async () => {
    const {client, calls} = recordingClient({'GET /api/me': {user: {id: '1'}}});
    await createRestAccountConnector(client, {paths: {session: '/api/me'}}).loadSession();
    assert.equal(calls[0].path, '/api/me');
});
