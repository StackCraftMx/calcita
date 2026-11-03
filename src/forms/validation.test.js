// Pruebas del locale de yup con llaves de i18n. Sin navegador: npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {YUP_LOCALE, Yup, buildYupLocale, translateValidationMessage} from '@/forms/validation.js';
import en from '@/locales/en.js';
import es from '@/locales/es.js';

const catalogOf = (language) => ({es, en})[language].validation;

/** Todas las llaves que puede producir el locale (las funciones se evalúan con parámetros de muestra). */
function localeKeys() {
    const sampleParams = {min: 1, max: 2, length: 3, less: 4, more: 5, values: ['a']};
    const keys = new Set();
    for (const messages of Object.values(YUP_LOCALE)) {
        for (const message of Object.values(messages)) {
            const resolvedMessage = typeof message === 'function' ? message(sampleParams) : message;
            keys.add(resolvedMessage.key.replace(/^validation:/, ''));
        }
    }
    return keys;
}

test('cada llave del locale existe en es y en (con sus plurales cuando lleva count)', () => {
    for (const language of ['es', 'en']) {
        const catalog = catalogOf(language);
        const missingKeys = [...localeKeys()].filter((key) => !(key in catalog) && !(`${key}_one` in catalog && `${key}_other` in catalog));
        assert.deepEqual(missingKeys, [], language);
    }
});

test('un esquema sin textos regresa la llave con sus valores y se traduce al pintarla', () => {
    buildYupLocale();
    const schema = Yup.object({password: Yup.string().required().min(8)});

    assert.throws(() => schema.validateSync({password: ''}), (error) => error.errors[0].key === 'validation:required');
    assert.throws(() => schema.validateSync({password: 'corta'}), (error) => {
        // un traductor como el t de la casa: con defaultValue, el texto opcional que no existe da ese valor
        const translate = (key, values) => (values?.defaultValue !== undefined ? values.defaultValue : `${key}|${values.count}`);
        const translated = translateValidationMessage(translate, error.errors[0]);
        return translated === 'validation:stringMin|8';
    });
});

test('un texto del backend (ya traducido) se pinta tal cual', () => {
    assert.equal(translateValidationMessage(() => 'no debería llamarse', 'El correo ya existe.'), 'El correo ya existe.');
    assert.equal(translateValidationMessage(() => 'x', undefined), undefined);
});

// un traductor de prueba con unos textos: respeta defaultValue como el t de la casa y el de i18next
const TEXTS = {
    'validation:required': 'Este campo es obligatorio.',
    'validation:default': 'Revise este campo.',
    'validation:fields.rfc.matches': 'El RFC lleva 12 o 13 caracteres.',
    'legado:requerido': 'Falta {{label}}.',
};
function translateWithTexts(key, values = {}) {
    const text = TEXTS[key];
    if (text === undefined) {
        return values.defaultValue !== undefined ? values.defaultValue : key;
    }
    return text.replace(/\{\{(\w+)\}\}/g, (whole, name) => String(values[name] ?? whole));
}

test('cada mensaje de Calcita lleva su regla y su campo (y el nombre del esquema, si lo tiene)', () => {
    buildYupLocale();
    const schema = Yup.object({rfc: Yup.string().label('RFC').required()});
    assert.throws(() => schema.validateSync({rfc: ''}), (error) => {
        const message = error.errors[0];
        return message.key === 'validation:required' && message.rule === 'required' && message.path === 'rfc' && message.values.label === 'RFC';
    });
});

test('el texto de la pantalla para la regla gana; luego el del proyecto para el campo; al final el general', () => {
    const matchesError = {key: 'validation:matches', values: {}, rule: 'matches', path: 'rfc'};
    assert.equal(translateValidationMessage(translateWithTexts, matchesError, {messages: {matches: 'Así no va el RFC.'}}), 'Así no va el RFC.');
    assert.equal(translateValidationMessage(translateWithTexts, matchesError), 'El RFC lleva 12 o 13 caracteres.');
    // el mismo campo dentro de una lista (contacts[2].rfc) usa el texto de contacts.rfc, no hay: el general
    const requiredInList = {key: 'validation:required', values: {}, rule: 'required', path: 'contacts[2].rfc'};
    assert.equal(translateValidationMessage(translateWithTexts, requiredInList), 'Este campo es obligatorio.');
});

test('las formas de un sistema que ya existe: {msg, values}, {message} y el error entero de react-hook-form', () => {
    assert.equal(translateValidationMessage(translateWithTexts, {msg: 'legado:requerido', values: {label: 'el RFC'}}), 'Falta el RFC.');
    assert.equal(translateValidationMessage(translateWithTexts, {message: 'El correo ya existe.'}), 'El correo ya existe.');
    assert.equal(translateValidationMessage(translateWithTexts, {message: {key: 'validation:required'}, type: 'required'}), 'Este campo es obligatorio.');
});

test('el nombre del campo llega a los textos que lo dicen', () => {
    assert.equal(translateValidationMessage(translateWithTexts, {key: 'legado:requerido', values: {}}, {label: 'la razón social'}), 'Falta la razón social.');
});

test('una forma que no se entiende da el mensaje general, nunca «[object Object]»', () => {
    assert.equal(translateValidationMessage(translateWithTexts, {codigo: 17}), 'Revise este campo.');
});

test('la lectura propia del proyecto (readValidationMessage) va primero; si no sabe, la de siempre', () => {
    const readMessage = (error) => (error?.codigo === 'REQ' ? {key: 'legado:requerido', values: {label: error.campo}} : undefined);
    assert.equal(translateValidationMessage(translateWithTexts, {codigo: 'REQ', campo: 'el RFC'}, {readMessage}), 'Falta el RFC.');
    assert.equal(translateValidationMessage(translateWithTexts, 'Texto del servidor', {readMessage}), 'Texto del servidor');
});

test('una regla propia sin campo en su mensaje usa el name del campo que la pinta para su texto propio', () => {
    const percentError = {key: 'validation:percent', values: {min: 0, max: 100}, rule: 'percent'};
    const translate = (key, values = {}) => (key === 'validation:fields.commission.percent' ? 'La comisión va de 0 a 100.' : (values.defaultValue ?? key));
    assert.equal(translateValidationMessage(translate, percentError, {fieldName: 'commission'}), 'La comisión va de 0 a 100.');
    assert.equal(translateValidationMessage(translate, percentError, {fieldName: 'discount'}), 'validation:percent');
});
