// Pruebas de las máscaras: lo que se ve, lo que viaja y dónde queda el cursor. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {INPUT_MASK, caretPositionOf, isMaskComplete, maskPatternOf, maskedTextOf, rawValueOf} from '@/inputs/inputMasks.js';

const phone = maskPatternOf('phone');

test('el teléfono se ve con sus espacios y viaja solo con los dígitos', () => {
    assert.equal(maskedTextOf('5551234567', phone), '555 123 4567');
    assert.equal(rawValueOf('(555) 123-4567 ext', phone), '5551234567');
    // sin separadores de más al final mientras se escribe
    assert.equal(maskedTextOf('555', phone), '555');
    assert.equal(maskedTextOf('5551', phone), '555 1');
});

test('lo que no cabe se ignora y nada pasa del largo', () => {
    assert.equal(rawValueOf('55a5-1x2', phone), '55512');
    assert.equal(rawValueOf('555123456789', phone), '5551234567');
});

test('RFC y CURP en mayúsculas, solo letras y dígitos (también Ñ y & del RFC)', () => {
    assert.equal(rawValueOf('mañ-850101 ab1', INPUT_MASK.rfc), 'MAÑ850101AB1');
    assert.equal(rawValueOf('a&b850101xy9', INPUT_MASK.rfc), 'A&B850101XY9');
    assert.equal(rawValueOf('MARA850101hdfrrn09', INPUT_MASK.curp), 'MARA850101HDFRRN09');
});

test('la CLABE en sus cuatro partes y el folio fiscal en hexadecimal', () => {
    assert.equal(maskedTextOf('002180012345678901', INPUT_MASK.clabe), '002 180 01234567890 1');
    assert.equal(rawValueOf('6f2d1c8e-12ab-4cd3-9e0f-0123456789zz', INPUT_MASK.uuid), '6F2D1C8E12AB4CD39E0F0123456789');
    assert.equal(isMaskComplete('002180012345678901', INPUT_MASK.clabe), true);
    assert.equal(isMaskComplete('00218001', INPUT_MASK.clabe), false);
});

test('el cursor se queda después de lo que escribió, aunque entren separadores', () => {
    // escribió el 4.º dígito al final: queda después del «1» de «555 1»
    assert.equal(caretPositionOf('5551', 4, phone), 5);
    // escribió en medio («555 1|23» → agregó un 9 después del 1): queda después del 9
    assert.equal(caretPositionOf('555 1923 4567', 6, phone), 6);
    // al principio
    assert.equal(caretPositionOf('9555 123 4567', 1, phone), 1);
});

test('un patrón propio se usa tal cual', () => {
    assert.equal(maskPatternOf('AAA-999'), 'AAA-999');
    assert.equal(maskedTextOf('abc123', 'AAA-999'), 'ABC-123');
});
