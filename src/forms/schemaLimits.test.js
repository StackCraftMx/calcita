// Pruebas de los topes leídos del esquema de yup (schemaLimits.js).
import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as Yup from 'yup';

import {LIMIT_KIND} from '@/inputs/fieldLimits.js';
import {limitsInSchema} from '@/forms/schemaLimits.js';

const SCHEMA = Yup.object({
    amount: Yup.number().min(100).max(50000),
    discount: Yup.number().positive().lessThan(100),
    reference: Yup.string().min(3).max(80),
    postalCode: Yup.string().length(5),
    branches: Yup.array().of(Yup.string()).min(1).max(3),
    plain: Yup.string(),
    startsAt: Yup.number(),
    endsAt: Yup.number().min(Yup.ref('startsAt')),
    kind: Yup.string(),
    // el tope cambia con otro campo: una empresa escribe más
    nickname: Yup.string().when('kind', {is: 'company', then: (schema) => schema.max(120), otherwise: (schema) => schema.max(40)}),
    contacts: Yup.array().of(Yup.object({phone: Yup.string().max(10)})),
});

test('número, texto y lista: cada uno con los nombres de sus props', () => {
    assert.deepEqual(limitsInSchema(SCHEMA, 'amount', {}, LIMIT_KIND.number), {min: 100, max: 50000});
    assert.deepEqual(limitsInSchema(SCHEMA, 'reference', {}, LIMIT_KIND.text), {minLength: 3, maxLength: 80});
    assert.deepEqual(limitsInSchema(SCHEMA, 'postalCode', {}, LIMIT_KIND.text), {minLength: 5, maxLength: 5});
    assert.deepEqual(limitsInSchema(SCHEMA, 'branches', {}, LIMIT_KIND.list), {minSelected: 1, maxSelected: 3});
    assert.deepEqual(limitsInSchema(SCHEMA, 'contacts.0.phone', {contacts: [{phone: ''}]}, LIMIT_KIND.text), {maxLength: 10});
});

test('las reglas que dejan fuera al tope mismo y los topes de otro campo no se leen', () => {
    assert.deepEqual(limitsInSchema(SCHEMA, 'discount', {}, LIMIT_KIND.number), {});
    assert.deepEqual(limitsInSchema(SCHEMA, 'endsAt', {}, LIMIT_KIND.number), {});
});

test('las condiciones se resuelven con los valores de ese momento', () => {
    assert.deepEqual(limitsInSchema(SCHEMA, 'nickname', {kind: 'company'}, LIMIT_KIND.text), {maxLength: 120});
    assert.deepEqual(limitsInSchema(SCHEMA, 'nickname', {kind: 'person'}, LIMIT_KIND.text), {maxLength: 40});
});

test('sin tope, de otro tipo, sin esquema o con un campo que no está: nada y sin tronar', () => {
    assert.deepEqual(limitsInSchema(SCHEMA, 'plain', {}, LIMIT_KIND.text), {});
    // un número de Calcita viaja como texto: si el esquema lo declara string, sus min y max son de letras, no de valor
    assert.deepEqual(limitsInSchema(SCHEMA, 'reference', {}, LIMIT_KIND.number), {});
    assert.deepEqual(limitsInSchema(undefined, 'amount', {}, LIMIT_KIND.number), {});
    assert.deepEqual(limitsInSchema(SCHEMA, 'missing', {}, LIMIT_KIND.number), {});
    assert.deepEqual(limitsInSchema(() => SCHEMA, 'amount', {}, LIMIT_KIND.number), {min: 100, max: 50000});
});
