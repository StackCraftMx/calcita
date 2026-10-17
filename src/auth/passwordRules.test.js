// Pruebas de las reglas de contraseña. Sin navegador: pnpm test. Las contraseñas de aquí son inventadas.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {DEFAULT_PASSWORD_POLICY, PASSWORD_RULE, isPasswordAccepted, passwordChecksOf} from '@/auth/passwordRules.js';

test('la lista trae solo las reglas que pide la política, en orden, con si se cumplen', () => {
    const checks = passwordChecksOf('abc', DEFAULT_PASSWORD_POLICY);

    assert.deepEqual(checks.map((check) => check.rule), [PASSWORD_RULE.minLength, PASSWORD_RULE.lowercase, PASSWORD_RULE.uppercase, PASSWORD_RULE.number]);
    assert.deepEqual(checks.map((check) => check.isMet), [false, true, false, false]);
    assert.deepEqual(checks[0].values, {count: 12});
});

test('las mayúsculas y minúsculas con acento o ñ cuentan', () => {
    const checks = passwordChecksOf('ÑANDÚ', {minLength: 0, lowercase: true, uppercase: true});

    assert.deepEqual(checks.map((check) => check.isMet), [false, true]);
    assert.equal(passwordChecksOf('ñandú', {lowercase: true})[0].isMet, true);
});

test('el largo se cuenta por caracteres que se ven: un emoji es uno', () => {
    assert.equal(passwordChecksOf('🔒🔒🔒', {minLength: 3})[0].isMet, true);
    assert.equal(passwordChecksOf('🔒🔒', {minLength: 3})[0].isMet, false);
});

test('el símbolo es cualquier cosa que no sea letra, número ni espacio', () => {
    assert.equal(passwordChecksOf('abc def', {symbol: true})[0].isMet, false);
    assert.equal(passwordChecksOf('abc-def', {symbol: true})[0].isMet, true);
});

test('aceptada solo si cumple todo; sin contraseña, nada se cumple', () => {
    assert.equal(isPasswordAccepted('Prueba-de-ejemplo-7'), true);
    assert.equal(isPasswordAccepted('prueba-de-ejemplo-7'), false);
    assert.equal(isPasswordAccepted(undefined), false);
});
