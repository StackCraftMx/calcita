import assert from 'node:assert/strict';
import {test} from 'node:test';

import {answersFromFlags, defaultAnswersOf, primaryColorOf, problemWithAnswer, templateFlagsOf} from './projectAnswers.js';

test('las recomendadas: menú a un lado, vidrio, claro y oscuro, Stackcraft, formik, textos de Calcita, entrar y PWA', () => {
    const answers = defaultAnswersOf('mi-tienda');
    assert.deepEqual(answers, {
        appTitle: 'Mi tienda', menuPosition: 'side', style: 'glass', colorModes: 'lightAndDark', colors: 'stackcraft', forms: 'formik',
        texts: 'calcita', auth: 'yes', pwa: 'yes',
    });
    assert.deepEqual(templateFlagsOf(answers), {auth: true, pwa: true, i18next: false, hookForm: false, darkMode: true});
    assert.equal(primaryColorOf(answers), '#FF6B1A');
});

test('las banderas cambian solo lo que dicen', () => {
    const answers = answersFromFlags('tienda', {forms: 'react-hook-form', texts: 'i18next', colors: 'custom', primaryColor: '#2563eb'});
    assert.equal(answers.forms, 'react-hook-form');
    assert.equal(answers.menuPosition, 'side');
    assert.equal(primaryColorOf(answers), '#2563EB');
    assert.equal(templateFlagsOf(answers).i18next, true);
});

test('una respuesta que no sirve se explica', () => {
    assert.match(problemWithAnswer('forms', 'redux-form'), /formik, react-hook-form/);
    assert.match(problemWithAnswer('primaryColor', 'azul'), /#RRGGBB/);
    assert.match(problemWithAnswer('appTitle', "Ana's"), /sin comillas/);
    assert.equal(problemWithAnswer('appTitle', 'Tienda de Ana · Pedidos'), null);
    assert.throws(() => answersFromFlags('tienda', {colors: 'custom'}), /color principal/);
});
