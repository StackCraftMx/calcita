// Pruebas del RFC, la CURP y la CLABE. Sin navegador: pnpm test. Los RFC son de instituciones públicas (salen en sus
// facturas); la CURP es inventada con su dígito calculado; la CLABE es el ejemplo público de Banxico.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
    RFC_KIND, clabeCheckDigitOf, curpCheckDigitOf, isValidClabe, isValidCurp, isValidRfc, rfcCheckDigitOf, rfcKindOf,
} from '@/mexico/mexicoIdentifiers.js';

test('el RFC de persona moral, física y los genéricos', () => {
    assert.equal(isValidRfc('SAT970701NN3'), true);
    assert.equal(rfcKindOf('SAT970701NN3'), RFC_KIND.company);
    assert.equal(rfcKindOf('MARA850101AB1'), RFC_KIND.person);
    assert.equal(rfcKindOf('XAXX010101000'), RFC_KIND.generic);
    assert.equal(isValidRfc(' xaxx010101000 '), true);
});

test('un RFC con una fecha que no existe o con otra forma no pasa', () => {
    assert.equal(isValidRfc('MARA850231AB1'), false);
    assert.equal(isValidRfc('MARA85010AB1'), false);
    assert.equal(isValidRfc('MA1A850101AB1'), false);
    assert.equal(isValidRfc(''), false);
});

test('el dígito verificador del RFC (resto de 11 del SAT), solo con strict', () => {
    for (const rfc of ['SAT970701NN3', 'CFE370814QI0', 'BMI9312038R3', 'IMS421231I45']) {
        assert.equal(rfcCheckDigitOf(rfc), rfc.at(-1), rfc);
        assert.equal(isValidRfc(rfc, {strict: true}), true, rfc);
    }
    assert.equal(isValidRfc('SAT970701NN4', {strict: true}), false);
    // sin strict, la forma basta
    assert.equal(isValidRfc('SAT970701NN4'), true);
});

test('la CURP: forma, estado, fecha y dígito', () => {
    const curp = 'MAPA850101HDFRRN03';
    assert.equal(curpCheckDigitOf(curp), '3');
    assert.equal(isValidCurp(curp), true);
    assert.equal(isValidCurp('MAPA850101HDFRRN04'), false);
    assert.equal(isValidCurp('MAPA850101HZZRRN03'), false);
    assert.equal(isValidCurp('MAPA850132HDFRRN03'), false);
});

test('la CLABE: 18 dígitos y su dígito (pesos 3, 7, 1)', () => {
    assert.equal(clabeCheckDigitOf('032180000118359719'), '9');
    assert.equal(isValidClabe('032180000118359719'), true);
    assert.equal(isValidClabe('032 180 00011835971 9'), true);
    assert.equal(isValidClabe('032180000118359718'), false);
    assert.equal(isValidClabe('0321800001183597'), false);
});
