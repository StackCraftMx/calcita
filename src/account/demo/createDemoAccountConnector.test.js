import assert from 'node:assert/strict';
import {beforeEach, test} from 'node:test';

import {missingConnectorFunctionsOf} from '@/account/accountConnector.js';
import {createDemoAccountConnector} from '@/account/demo/createDemoAccountConnector.js';

// lo del navegador que usa la demostración: el almacenamiento y el dominio
beforeEach(() => {
    const stored = new Map();
    globalThis.window = {
        localStorage: {getItem: (key) => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, String(value)), removeItem: (key) => stored.delete(key)},
        location: {hostname: 'localhost'},
    };
});

const newConnector = () => createDemoAccountConnector({delayMilliseconds: 0, labels: ['Administración']});

test('trae todas las funciones y entra con el correo de la demostración', async () => {
    const connector = newConnector();
    assert.deepEqual(missingConnectorFunctionsOf(connector), []);
    assert.equal(await connector.loadSession(), null);
    await assert.rejects(connector.signIn({email: 'otra@ejemplo.com', password: 'x'}), (error) => error.status === 401);
    assert.deepEqual(await connector.signIn({email: 'ANA.MARTINEZ@ejemplo.com', password: 'x'}), {secondStep: null});
    const session = await connector.loadSession();
    assert.equal(session.user.email, 'ana.martinez@ejemplo.com');
    assert.deepEqual(session.labels, ['Administración']);
});

test('con la app activa pide el segundo paso; 5 códigos equivocados bloquean', async () => {
    const connector = newConnector();
    await connector.signIn({email: 'ana.martinez@ejemplo.com', password: 'x'});
    await connector.startTotp();
    const {security, recoveryCodes} = await connector.confirmTotp(await connector.demoTotpCode());
    assert.equal(security.isEnabled, true);
    assert.equal(recoveryCodes.length, 10);
    await connector.signOut();

    assert.deepEqual(await connector.signIn({email: 'ana.martinez@ejemplo.com', password: 'x'}), {secondStep: {methods: ['totp', 'recoveryCode']}});
    await assert.rejects(connector.signInSecondStep({method: 'totp', code: '000000'}), (error) => error.problem.remaining_attempts === 4);
    for (let attempt = 0; attempt < 3; attempt += 1) {
        await assert.rejects(connector.signInSecondStep({method: 'totp', code: '000000'}));
    }
    await assert.rejects(connector.signInSecondStep({method: 'totp', code: '000000'}), (error) => error.status === 423 && error.code === 'account_locked');
    assert.equal(await connector.loadSession(), null);
});

test('un código de recuperación entra una sola vez', async () => {
    const connector = newConnector();
    await connector.signIn({email: 'ana.martinez@ejemplo.com', password: 'x'});
    await connector.startTotp();
    const {recoveryCodes} = await connector.confirmTotp(await connector.demoTotpCode());
    await connector.signOut();
    await connector.signIn({email: 'ana.martinez@ejemplo.com', password: 'x'});
    await connector.signInSecondStep({method: 'recoveryCode', code: recoveryCodes[0]});
    assert.notEqual(await connector.loadSession(), null);
    assert.equal((await connector.loadSecurity()).recoveryCodesRemaining, 9);
    const activity = await connector.listActivity();
    assert.equal(activity[0].kind, 'recoveryCodeUsed');
});

test('lo que quita protección pide la contraseña (422 en su campo)', async () => {
    const connector = newConnector();
    await connector.signIn({email: 'ana.martinez@ejemplo.com', password: 'x'});
    await assert.rejects(connector.disableTotp(''), (error) => error.status === 422 && Boolean(error.problem.errors.password));
});
