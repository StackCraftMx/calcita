// Pruebas de los topes de un campo (fieldLimits.js).
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
    LIMIT_MODE, compareNumberTexts, filesLimitProblemOf, fixedNumberText, isListFull, limitFixOf, limitModeOf, listLimitProblemOf,
    numberLimitProblemOf, textLimitProblemOf, wouldOverfillList,
} from '@/inputs/fieldLimits.js';

test('el modo: el del campo gana al de la app; sin ninguno, avisa; uno que no existe truena', () => {
    assert.equal(limitModeOf(undefined, undefined), LIMIT_MODE.warn);
    assert.equal(limitModeOf(undefined, LIMIT_MODE.fix), LIMIT_MODE.fix);
    assert.equal(limitModeOf(LIMIT_MODE.warn, LIMIT_MODE.fix), LIMIT_MODE.warn);
    assert.throws(() => limitModeOf('clamp'), /limitMode «clamp» no existe/);
});

test('compara números como texto, también los que Number() ya no lee exactos', () => {
    assert.equal(compareNumberTexts('1000', '999.99'), 1);
    assert.equal(compareNumberTexts('0999.990', '999.99'), 0);
    assert.equal(compareNumberTexts('-5', '-4.5'), -1);
    assert.equal(compareNumberTexts('-0', '0.00'), 0);
    assert.equal(compareNumberTexts('-1', '0'), -1);
    assert.equal(compareNumberTexts('12345678901234567.89', '12345678901234567.88'), 1);
});

test('número: el mensaje dice el tope con separador de miles; vacío o a medio escribir no se revisa', () => {
    const limits = {min: '100', max: 1000};
    assert.deepEqual(numberLimitProblemOf('1500', limits), {key: 'validation:numberMax', values: {max: '1,000'}, rule: 'max'});
    assert.deepEqual(numberLimitProblemOf('99.99', limits), {key: 'validation:numberMin', values: {min: '100'}, rule: 'min'});
    assert.equal(numberLimitProblemOf('1000.00', limits), null);
    assert.equal(numberLimitProblemOf('100', limits), null);
    assert.equal(numberLimitProblemOf('', limits), null);
    assert.equal(numberLimitProblemOf('-', limits), null);
    assert.equal(numberLimitProblemOf('1500.', limits).rule, 'max');
});

test('número: corregir lleva al tope con los decimales del campo; dentro del tope no se toca', () => {
    const limits = {min: '100', max: '1000'};
    assert.equal(fixedNumberText('1500', limits, 2), '1000.00');
    assert.equal(fixedNumberText('5.5', limits, 0), '100');
    assert.equal(fixedNumberText('250.5', limits, 2), '250.5');
    assert.equal(fixedNumberText('', limits, 2), '');
});

test('número: un tope mal escrito truena con un mensaje claro', () => {
    assert.throws(() => numberLimitProblemOf('5', {max: '1,000'}), /max «1,000» no es un número/);
    assert.throws(() => numberLimitProblemOf('5', {min: 10, max: 5}), /El mínimo \(10\) es mayor que el máximo \(5\)/);
});

test('texto: al menos y como máximo, contando como yup y el navegador; vacío no se revisa', () => {
    const limits = {minLength: 3, maxLength: 5};
    assert.deepEqual(textLimitProblemOf('ab', limits), {key: 'validation:stringMin', values: {count: 3}, rule: 'min'});
    assert.deepEqual(textLimitProblemOf('abcdef', limits), {key: 'validation:stringMax', values: {count: 5}, rule: 'max'});
    assert.equal(textLimitProblemOf('abcd', limits), null);
    assert.equal(textLimitProblemOf('', limits), null);
    assert.throws(() => textLimitProblemOf('a', {maxLength: 2.5}), /maxLength «2.5» debe ser un número entero/);
    assert.throws(() => textLimitProblemOf('a', {minLength: 4, maxLength: 2}), /minLength \(4\) es mayor que maxLength \(2\)/);
});

test('lista: al menos y como máximo; llena y lo que se pasaría', () => {
    const limits = {minSelected: 2, maxSelected: 3};
    assert.deepEqual(listLimitProblemOf(['a'], limits), {key: 'validation:arrayMin', values: {count: 2}, rule: 'min'});
    assert.deepEqual(listLimitProblemOf(['a', 'b', 'c', 'd'], limits), {key: 'validation:arrayMax', values: {count: 3}, rule: 'max'});
    assert.equal(listLimitProblemOf(['a', 'b'], limits), null);
    assert.equal(listLimitProblemOf([], limits), null);
    assert.equal(isListFull(['a', 'b', 'c'], 3), true);
    assert.equal(isListFull(['a', 'b'], 3), false);
    assert.equal(isListFull(['a', 'b'], undefined), false);
    assert.equal(wouldOverfillList(['a'], 3, 3), true);
    assert.equal(wouldOverfillList(['a'], 2, 3), false);
});

test('archivos: el mínimo que falta; ninguno es cosa del obligatorio', () => {
    assert.deepEqual(filesLimitProblemOf(['a.pdf'], {minFiles: 2}), {key: 'validation:filesMin', values: {count: 2}, rule: 'min'});
    assert.equal(filesLimitProblemOf(['a.pdf', 'b.pdf'], {minFiles: 2}), null);
    assert.equal(filesLimitProblemOf([], {minFiles: 2}), null);
});

test('lo corregido solo trae el tope como se ve y su aviso, con la forma de los de yup', () => {
    const problem = numberLimitProblemOf('900000', {max: 500000});
    assert.deepEqual(limitFixOf(problem, '900000.00', '500000.00'), {
        rule: 'max', limit: '500,000', typedValue: '900000.00', fixedValue: '500000.00',
        message: {key: 'validation:fixedToMax', values: {limit: '500,000'}, rule: 'fixedToMax'},
    });
    assert.equal(limitFixOf(numberLimitProblemOf('10', {min: 5000}), '10', '5000.00').message.key, 'validation:fixedToMin');
});
