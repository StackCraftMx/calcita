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
        const translated = translateValidationMessage((key, values) => `${key}|${values.count}`, error.errors[0]);
        return translated === 'validation:stringMin|8';
    });
});

test('un texto del backend (ya traducido) se pinta tal cual', () => {
    assert.equal(translateValidationMessage(() => 'no debería llamarse', 'El correo ya existe.'), 'El correo ya existe.');
    assert.equal(translateValidationMessage(() => 'x', undefined), undefined);
});
