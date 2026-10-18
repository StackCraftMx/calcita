// Pruebas de los códigos TOTP con los valores oficiales del RFC 6238 (sin navegador): pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {base32Of, bytesOfBase32, isValidTotpCode, otpauthUrlOf, totpCodeAt} from '@/fakeServer/totp.js';

// la clave de los ejemplos del RFC: «12345678901234567890» en ASCII
const RFC_SECRET = base32Of(new TextEncoder().encode('12345678901234567890'));

test('base32 de ida y vuelta, como lo escribe la persona en su app', () => {
    assert.equal(RFC_SECRET, 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
    assert.deepEqual([...bytesOfBase32(RFC_SECRET)], [...new TextEncoder().encode('12345678901234567890')]);
});

test('los códigos de los ejemplos del RFC 6238 (SHA-1, 8 dígitos)', async () => {
    assert.equal(await totpCodeAt(RFC_SECRET, 59_000, 8), '94287082');
    assert.equal(await totpCodeAt(RFC_SECRET, 1_111_111_109_000, 8), '07081804');
    assert.equal(await totpCodeAt(RFC_SECRET, 2_000_000_000_000, 8), '69279037');
});

test('se acepta el código de ahora y el de un paso antes o después; uno viejo no', async () => {
    const now = 1_700_000_000_000;
    assert.equal(await isValidTotpCode(RFC_SECRET, await totpCodeAt(RFC_SECRET, now), now), true);
    assert.equal(await isValidTotpCode(RFC_SECRET, await totpCodeAt(RFC_SECRET, now - 30_000), now), true);
    assert.equal(await isValidTotpCode(RFC_SECRET, await totpCodeAt(RFC_SECRET, now - 120_000), now), false);
});

test('la dirección del QR lleva la cuenta, la clave y quién la emite', () => {
    assert.equal(otpauthUrlOf({secret: 'ABC', account: 'ana@ejemplo.com', issuer: 'Calcita'}),
        'otpauth://totp/Calcita%3Aana%40ejemplo.com?secret=ABC&issuer=Calcita&digits=6&period=30');
});
