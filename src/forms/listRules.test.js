// Pruebas de las reglas de listas con el yup de verdad. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as Yup from 'yup';

import {listTotalAtMostRule, listTotalOf, orderedInListRule, uniqueInListRule} from '@/forms/listRules.js';

// los errores de una validación como {ruta: mensaje}
const errorsOf = async (schema, values) => {
    try {
        await schema.validate(values, {abortEarly: false});
        return {};
    } catch (error) {
        return Object.fromEntries(error.inner.map((inner) => [inner.path, inner.message]));
    }
};

const tiersSchema = (options) => Yup.object({
    tiers: Yup.array().of(Yup.object({
        min_quantity: Yup.string().test(uniqueInListRule('tiers', 'min_quantity')).test(orderedInListRule('tiers', 'min_quantity', options)),
    })),
});

test('sin repetidos: el primero se queda bien y el que repite dice con cuál choca', async () => {
    const schema = Yup.object({
        contacts: Yup.array().of(Yup.object({email: Yup.string().test(uniqueInListRule('contacts', 'email'))})),
    });
    const errors = await errorsOf(schema, {contacts: [{email: 'a@x.mx'}, {email: 'b@x.mx'}, {email: 'a@x.mx'}, {email: ''}]});
    assert.deepEqual(errors, {'contacts[2].email': {key: 'validation:listDuplicate', values: {row: 1}}});
});

test('en orden de menor a mayor: dice con quién choca y entre cuáles debe ir', async () => {
    const errors = await errorsOf(tiersSchema(), {tiers: [{min_quantity: '10'}, {min_quantity: '5'}, {min_quantity: '50'}, {min_quantity: '40'}]});
    // el 5 va después del 10: debe ser mayor que 10; el 40 después del 50: mayor que 50 (el de arriba)
    assert.equal(errors['tiers[1].min_quantity'].key, 'validation:listOrderAbovePrevious');
    assert.deepEqual(errors['tiers[1].min_quantity'].values, {previous: '10', previousRow: 1, next: '50', nextRow: 3});
    assert.equal(errors['tiers[3].min_quantity'].key, 'validation:listOrderAbovePrevious');
    // el 10 tiene abajo un 5 (menor): debe ser menor que 5
    assert.equal(errors['tiers[0].min_quantity'].key, 'validation:listOrderBelowNext');
    // uno en medio que choca con los dos
    const between = await errorsOf(tiersSchema(), {tiers: [{min_quantity: '10'}, {min_quantity: '99'}, {min_quantity: '50'}, {min_quantity: '1'}]});
    assert.equal(between['tiers[2].min_quantity'].key, 'validation:listOrderBetween');
});

test('en orden: los vacíos no cuentan y de mayor a menor también', async () => {
    assert.deepEqual(await errorsOf(tiersSchema(), {tiers: [{min_quantity: '10'}, {min_quantity: ''}, {min_quantity: '20'}]}), {});
    const descending = await errorsOf(tiersSchema({ascending: false, displayOf: (text) => `${text} %`}), {tiers: [{min_quantity: '9'}, {min_quantity: '12'}]});
    assert.equal(descending['tiers[1].min_quantity'].key, 'validation:listOrderBelowPrevious');
    assert.equal(descending['tiers[1].min_quantity'].values.previous, '9 %');
});

test('la suma de una columna con Money y su tope tomado de otro campo', async () => {
    assert.equal(listTotalOf([{amount: '0.10'}, {amount: '0.20'}, {amount: ''}, {amount: 'no'}], 'amount', {currency: 'MXN'}).amount(), '0.30');
    const schema = Yup.object({
        credit_limit: Yup.string(),
        split: Yup.array().test(listTotalAtMostRule('amount', (values) => values.credit_limit, {currency: 'MXN'})),
    });
    assert.deepEqual(await errorsOf(schema, {credit_limit: '1000', split: [{amount: '600'}, {amount: '400'}]}), {});
    const over = await errorsOf(schema, {credit_limit: '1000', split: [{amount: '600'}, {amount: '400.01'}]});
    assert.equal(over.split.key, 'validation:listTotalMax');
    assert.match(over.split.values.total, /1,000\.01/);
    // sin tope escrito todavía, no hay contra qué comparar
    assert.deepEqual(await errorsOf(schema, {credit_limit: '', split: [{amount: '600'}]}), {});
});
