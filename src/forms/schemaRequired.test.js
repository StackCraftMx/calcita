// Pruebas de lo obligatorio leído del esquema de yup (schemaRequired.js).
import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as Yup from 'yup';

import {fieldPathOf, isRequiredInSchema} from '@/forms/schemaRequired.js';

const SCHEMA = Yup.object({
    company: Yup.string().trim().required(),
    nickname: Yup.string(),
    kind: Yup.string().required(),
    // solo a una empresa se le pide el RFC
    rfc: Yup.string().when('kind', {is: 'company', then: (schema) => schema.required()}),
    validUntil: Yup.string().required(),
    branches: Yup.array().of(Yup.string()).min(1),
    tags: Yup.array().of(Yup.string()),
    contacts: Yup.array().of(Yup.object({email: Yup.string().required(), phone: Yup.string()})),
});

test('el nombre de formik en partes, con punto o con corchetes', () => {
    assert.deepEqual(fieldPathOf('contacts.2.email'), ['contacts', '2', 'email']);
    assert.deepEqual(fieldPathOf('contacts[2].email'), ['contacts', '2', 'email']);
});

test('lo que yup pide lleva asterisco; lo opcional, no; una lista con min(1) pide al menos uno', () => {
    assert.equal(isRequiredInSchema(SCHEMA, 'company', {}), true);
    assert.equal(isRequiredInSchema(SCHEMA, 'nickname', {}), false);
    assert.equal(isRequiredInSchema(SCHEMA, 'validUntil', {}), true);
    assert.equal(isRequiredInSchema(SCHEMA, 'branches', {}), true);
    assert.equal(isRequiredInSchema(SCHEMA, 'tags', {}), false);
});

test('las condiciones se resuelven con los valores de ese momento, también dentro de los renglones', () => {
    assert.equal(isRequiredInSchema(SCHEMA, 'rfc', {kind: 'company'}), true);
    assert.equal(isRequiredInSchema(SCHEMA, 'rfc', {kind: 'person'}), false);
    const values = {contacts: [{email: '', phone: ''}, {email: '', phone: ''}]};
    assert.equal(isRequiredInSchema(SCHEMA, 'contacts.1.email', values), true);
    assert.equal(isRequiredInSchema(SCHEMA, 'contacts[1].phone', values), false);
});

test('sin esquema, con algo que no es de yup o con un campo que no está: sin asterisco y sin tronar', () => {
    assert.equal(isRequiredInSchema(undefined, 'company', {}), false);
    assert.equal(isRequiredInSchema({}, 'company', {}), false);
    assert.equal(isRequiredInSchema(SCHEMA, 'missing.deep', {}), false);
    // formik también acepta una función que da el esquema
    assert.equal(isRequiredInSchema(() => SCHEMA, 'company', {}), true);
});
