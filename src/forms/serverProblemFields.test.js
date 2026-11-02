// Pruebas del reparto de errores 422 entre campos y aviso del formulario. Sin navegador: npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

// OJO: import relativo a propósito, única excepción a la regla del alias @/: node --test no pasa por Vite
import {formLevelMessageOf, splitRowFieldErrors, splitServerFieldErrors} from './serverProblemFields.js';

test('los errores de campos del formulario van a su campo y los demás al aviso', () => {
    const errorsByField = {email: ['El correo no es válido.'], token: ['La liga venció.']};

    assert.deepEqual(splitServerFieldErrors(errorsByField, ['email', 'password']), {
        fieldErrors: {email: 'El correo no es válido.'},
        unassignedMessages: ['La liga venció.'],
    });
    assert.equal(formLevelMessageOf(errorsByField, ['email', 'password'], 'Revisa los datos.'), 'La liga venció.');
});

test('si todo cae en sus campos no se repite arriba; sin errores por campo va el mensaje general', () => {
    assert.equal(formLevelMessageOf({email: ['x']}, ['email'], 'Revisa los datos.'), null);
    assert.equal(formLevelMessageOf({}, ['email'], 'Correo o contraseña incorrectos.'), 'Correo o contraseña incorrectos.');
});

test('el error de un campo dentro de un renglón que el formulario tiene va a ese renglón con su ruta', () => {
    const values = {contacts: [{email: 'a@x.mx'}, {email: 'b@x.mx'}], name: 'Ana'};
    const existsInForm = (path) => path.split('.').reduce((branch, part) => branch?.[part], values) !== undefined;
    const {rowFieldErrors, otherErrors} = splitRowFieldErrors({
        'contacts.1.email': ['Ese correo ya es de otro cliente.'],
        // un renglón que el formulario no tiene: sigue el camino de siempre (se reduce a «email» o va al aviso)
        'contacts.7.email': ['No existe.'],
        name: ['Escriba el nombre.'],
    }, existsInForm);
    assert.deepEqual(rowFieldErrors, {'contacts.1.email': 'Ese correo ya es de otro cliente.'});
    assert.deepEqual(Object.keys(otherErrors), ['contacts.7.email', 'name']);
    assert.deepEqual(splitRowFieldErrors(null, existsInForm), {rowFieldErrors: {}, otherErrors: {}});
});

