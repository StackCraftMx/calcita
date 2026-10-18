// Pruebas de las reglas de los códigos de la verificación en dos pasos: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
    RECOVERY_CODE_PATTERN, TOTP_CODE_PATTERN, normalizeRecoveryCode, normalizeTotpCode,
} from '@/forms/security/securityRules.js';

test('el código de la app acepta 6 dígitos con o sin espacio y se manda sin espacios', () => {
    assert.equal(TOTP_CODE_PATTERN.test('123456'), true);
    assert.equal(TOTP_CODE_PATTERN.test('123 456'), true);
    assert.equal(TOTP_CODE_PATTERN.test('12345'), false);
    assert.equal(TOTP_CODE_PATTERN.test('12a456'), false);
    assert.equal(normalizeTotpCode(' 123 456 '), '123456');
});

test('el código de recuperación acepta ABCDE-FGHJK con o sin guion y se manda en mayúsculas con guion', () => {
    assert.equal(RECOVERY_CODE_PATTERN.test('ABCDE-FGHJK'), true);
    assert.equal(RECOVERY_CODE_PATTERN.test('abcdefghjk'), true);
    assert.equal(RECOVERY_CODE_PATTERN.test('ABCD-FGHJK'), false);
    assert.equal(normalizeRecoveryCode('abcde fghjk'), 'ABCDE-FGHJK');
    assert.equal(normalizeRecoveryCode('ABCDE-FGHJK'), 'ABCDE-FGHJK');
});
