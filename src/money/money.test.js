// Pruebas del monto exacto. Sin navegador: pnpm test. Los montos son inventados; sirven para ver que no se pierde ni un
// centavo, no dicen nada de ningún negocio.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {MONEY_ROUNDING, Money} from '@/money/money.js';
import {configureToolkit} from '@/toolkit/toolkitSettings.js';

const pesos = (text) => Money.fromString(text, {currency: 'MXN'});

test('sumar centavos es exacto: 0.1 + 0.2 da 0.30, no 0.30000000000000004', () => {
    assert.equal(pesos('0.1').plus(pesos('0.2')).amount(), '0.30');
    assert.equal(pesos('0.03').plus(pesos('0.03')).plus(pesos('0.03')).minorUnits, 9);
});

test('restar es exacto y puede quedar negativo', () => {
    assert.equal(pesos('2132524.01').minus(pesos('50262.53')).amount(), '2082261.48');
    assert.equal(pesos('10').minus(pesos('10.21')).amount(), '-0.21');
});

test('lee el texto del API sin adivinar: lo que no es un número simple truena', () => {
    const readableAmounts = {'10.21': 1021, '-10.21': -1021, '3065': 306500, '0': 0, '0.5': 50, '20000.01': 2000001};
    for (const [text, minorUnits] of Object.entries(readableAmounts)) {
        assert.equal(pesos(text).minorUnits, minorUnits, text);
    }

    for (const text of ['', 'abc', '1,234', '12.', '.5', ' 12', '1e3', '$10']) {
        assert.throws(() => pesos(text), TypeError, `«${text}» no debía poder leerse`);
    }
    assert.throws(() => Money.fromString(12.5), TypeError);
});

test('decimales de más truenan, salvo que sean ceros; con más decimales configurados sí entran', () => {
    assert.throws(() => pesos('10.219'), /más de 2 decimales/);
    assert.equal(pesos('10.500').amount(), '10.50');
    assert.equal(Money.fromString('10.219', {currency: 'MXN', decimals: 4}).amount(), '10.2190');
});

test('los decimales salen de la moneda: yenes sin decimales y dinares de Kuwait con tres', () => {
    assert.equal(Money.fromString('1500', {currency: 'JPY'}).amount(), '1500');
    assert.throws(() => Money.fromString('1500.5', {currency: 'JPY'}), RangeError);
    assert.equal(Money.fromString('2.5', {currency: 'KWD'}).amount(), '2.500');
});

test('lee números del JSON y truena con los que dejaron las cuentas con decimales', () => {
    assert.equal(Money.fromNumber(2450.5, {currency: 'MXN'}).amount(), '2450.50');
    assert.equal(Money.fromNumber(-3, {currency: 'MXN'}).amount(), '-3.00');
    assert.throws(() => Money.fromNumber(0.1 + 0.2, {currency: 'MXN'}), RangeError);
    assert.throws(() => Money.fromNumber(Number.NaN, {currency: 'MXN'}), TypeError);
    assert.throws(() => Money.fromNumber('2450.5', {currency: 'MXN'}), TypeError);
});

test('multiplicar redondea una sola vez al centavo, con el modo que se pida', () => {
    // 10.05 × 1.16 = 11.658 → 11.66
    assert.equal(pesos('10.05').times('1.16').amount(), '11.66');
    assert.equal(pesos('2450').times(3).amount(), '7350.00');
    // 0.25 × 0.5 = 0.125: justo la mitad
    assert.equal(pesos('0.25').times('0.5').amount(), '0.13');
    assert.equal(pesos('0.25').times('0.5', {rounding: MONEY_ROUNDING.halfEven}).amount(), '0.12');
    assert.equal(pesos('0.25').times('0.5', {rounding: MONEY_ROUNDING.down}).amount(), '0.12');
    assert.equal(pesos('-0.25').times('0.5').amount(), '-0.13');
    assert.throws(() => pesos('1').times('1,5'), TypeError);
});

test('dividir redondea al centavo y no se divide entre cero', () => {
    assert.equal(pesos('10').dividedBy(3).amount(), '3.33');
    assert.equal(pesos('20').dividedBy(3).amount(), '6.67');
    assert.equal(pesos('116').dividedBy('1.16').amount(), '100.00');
    assert.equal(pesos('20').dividedBy(3, {rounding: MONEY_ROUNDING.down}).amount(), '6.66');
    assert.throws(() => pesos('10').dividedBy(0), /entre cero/);
});

test('la potencia es exacta hasta el redondeo final y solo acepta enteros', () => {
    assert.equal(pesos('1.05').pow(2).amount(), '1.10');
    assert.equal(pesos('1.05').pow(10).amount(), '1.63');
    assert.equal(pesos('12.34').pow(0).amount(), '1.00');
    assert.equal(pesos('3').pow(3).amount(), '27.00');
    assert.throws(() => pesos('4').pow(0.5), /sqrt/);
});

test('la raíz cuadrada redondea al centavo y no acepta negativos', () => {
    assert.equal(pesos('2').sqrt().amount(), '1.41');
    assert.equal(pesos('100').sqrt().amount(), '10.00');
    // √0.02 = 0.1414…
    assert.equal(pesos('0.02').sqrt().amount(), '0.14');
    assert.equal(pesos('1.21').sqrt().amount(), '1.10');
    assert.throws(() => pesos('-4').sqrt(), RangeError);
});

test('compara hasta el centavo y no mezcla monedas ni decimales', () => {
    assert.equal(pesos('3.45').equals(pesos('3.450')), true);
    assert.equal(pesos('20000.01').isGreaterThan(pesos('20000')), true);
    assert.equal(pesos('0').isZeroOrLess(), true);
    assert.equal(pesos('-1').isZeroOrLess(), true);
    assert.throws(() => pesos('1').plus(Money.fromString('1', {currency: 'USD'})), /No se mezclan/);
    assert.throws(() => pesos('1').equals(Money.fromString('1', {currency: 'MXN', decimals: 4})), /No se mezclan/);
    assert.throws(() => pesos('1').plus(1), TypeError);
});

test('no se opera con + ni >, y en JSON o en un texto sale su monto', () => {
    const total = pesos('1234.5');
    assert.throws(() => total + 1, /plus/);
    assert.throws(() => total > pesos('1'), /isGreaterThan/);
    assert.equal(JSON.stringify({total}), '{"total":"1234.50"}');
    assert.equal(`${total}`, '1234.50');
    assert.throws(() => {
        total.minorUnits = 0;
    }, TypeError);
});

test('el tope de los enteros exactos de JavaScript truena en vez de perder centavos', () => {
    const almostTheLimit = Money.fromMinorUnits(Number.MAX_SAFE_INTEGER, {currency: 'MXN'});
    assert.equal(almostTheLimit.amount(), '90071992547409.91');
    assert.throws(() => almostTheLimit.plus(pesos('0.01')), /tope/);
    assert.throws(() => Money.fromMinorUnits(10.5, {currency: 'MXN'}), RangeError);
});

test('se pinta en el idioma y la moneda del proveedor, exacto aunque sea enorme', () => {
    configureToolkit({language: 'es', currency: 'MXN'});
    assert.equal(Money.fromString('-1234.5').format(), '-$1,234.50');
    assert.equal(Money.fromMinorUnits(Number.MAX_SAFE_INTEGER).format(), '$90,071,992,547,409.91');
    assert.equal(Money.zero().currency, 'MXN');

    configureToolkit({language: 'en', currency: 'USD'});
    assert.equal(Money.fromString('1234.5').format(), '$1,234.50');
    assert.equal(Money.fromString('1500', {currency: 'JPY'}).format(), '¥1,500');
    configureToolkit({language: 'es', currency: 'MXN'});
});
