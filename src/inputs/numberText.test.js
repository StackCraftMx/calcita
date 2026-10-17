// Pruebas del texto de un número mientras se escribe. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {cleanNumberText, completeDecimals, groupThousands} from '@/inputs/numberText.js';

test('al escribir solo quedan dígitos y un punto, con el tope de decimales', () => {
    assert.equal(cleanNumberText('$2,850,000.567', 2), '2850000.56');
    assert.equal(cleanNumberText('12.3.4', 2), '12.34');
    assert.equal(cleanNumberText('abc', 2), '');
    assert.equal(cleanNumberText('1500.75', 0), '1500');
    // el signo de menos solo si el campo lo permite
    assert.equal(cleanNumberText('-250.5', 2), '250.5');
    assert.equal(cleanNumberText('-250.5', 2, true), '-250.5');
});

test('el separador de miles respeta lo que se está escribiendo', () => {
    assert.equal(groupThousands('2850000.5'), '2,850,000.5');
    assert.equal(groupThousands('2850000.'), '2,850,000.');
    assert.equal(groupThousands('.5'), '0.5');
    assert.equal(groupThousands('-1234'), '-1,234');
    assert.equal(groupThousands(''), '');
});

test('es exacto aunque la cifra no quepa en un número de JavaScript', () => {
    assert.equal(groupThousands('12345678901234567.89'), '12,345,678,901,234,567.89');
    assert.equal(completeDecimals('12345678901234567.8', 2), '12345678901234567.80');
});

test('al salir se completan los decimales con ceros y sin redondear', () => {
    assert.equal(completeDecimals('2850000.5', 2), '2850000.50');
    // un valor del servidor con decimales de más se corta: 1.005 queda en 1.00, no en 1.01
    assert.equal(completeDecimals('1.005', 2), '1.00');
    assert.equal(completeDecimals('007', 2), '7.00');
    assert.equal(completeDecimals('.5', 2), '0.50');
    assert.equal(completeDecimals('', 2), '');
    assert.equal(completeDecimals('.', 2), '');
    assert.equal(completeDecimals('-3', 2), '-3.00');
    assert.equal(completeDecimals('1500', 0), '1500');
});
