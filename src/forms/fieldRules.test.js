// Pruebas de las reglas de un campo. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {Yup, buildYupLocale} from '@/forms/validation.js';
import {percentRule, sameAsFieldRule} from '@/forms/fieldRules.js';

buildYupLocale();

test('igual a otro campo: pasa si coincide o si está vacío; si no, dice con cuál', () => {
    const schema = Yup.object({
        password: Yup.string(),
        password_confirmation: Yup.string().test(sameAsFieldRule('password', {otherLabel: 'la contraseña'})),
    });
    assert.equal(schema.isValidSync({password: 'secreta1', password_confirmation: 'secreta1'}), true);
    assert.equal(schema.isValidSync({password: 'secreta1', password_confirmation: ''}), true);
    assert.throws(() => schema.validateSync({password: 'secreta1', password_confirmation: 'otra'}), (error) => {
        const message = error.errors[0];
        return message.key === 'validation:sameAs' && message.values.other === 'la contraseña' && message.rule === 'sameAs';
    });
});

test('igual a otro campo sin nombre: «No coincide»', () => {
    const schema = Yup.object({clabe: Yup.string(), clabe_confirmation: Yup.string().test(sameAsFieldRule('clabe'))});
    assert.throws(() => schema.validateSync({clabe: '012180001234567891', clabe_confirmation: '0121'}),
        (error) => error.errors[0].key === 'validation:sameAsUnnamed');
});

test('porcentaje: entre 0 y 100 por omisión, con decimales y como texto; fuera de rango dice el rango', () => {
    const schema = Yup.object({rate: Yup.string().test(percentRule())});
    for (const rate of ['0', '12.5', '100', '', undefined]) {
        assert.equal(schema.isValidSync({rate}), true, String(rate));
    }
    for (const rate of ['-1', '100.01', 'abc']) {
        assert.equal(schema.isValidSync({rate}), false, rate);
    }
    const limited = Yup.object({rate: Yup.string().test(percentRule({max: 30}))});
    assert.throws(() => limited.validateSync({rate: '31'}), (error) => error.errors[0].values.max === 30 && error.errors[0].rule === 'percent');
});
