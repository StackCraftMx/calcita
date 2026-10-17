// Pruebas de cómo el paquete resuelve sus textos: namespace, plural, variables y el orden proyecto → textos → paquete.
// Sin navegador: npm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {configureToolkit, translateToolkit, translateWith} from '@/toolkit/toolkitSettings.js';

const SPANISH = {language: 'es', texts: {}, translate: null};

test('sin nada del proyecto salen los textos del paquete, con su plural y sus variables', () => {
    assert.equal(translateWith(SPANISH, 'common', 'actions.cancel'), 'Cancelar');
    assert.equal(translateWith(SPANISH, 'table', 'count.records', {count: 1, total: '1'}), '1 registro');
    assert.equal(translateWith(SPANISH, 'table', 'count.records', {count: 1200, total: '1,200'}), '1,200 registros');
});

test('una llave con «namespace:» manda sobre el namespace por omisión', () => {
    assert.equal(translateWith(SPANISH, 'table', 'common:actions.close'), 'Cerrar');
});

test('en inglés salen los textos en inglés, y lo que no esté en inglés sale en español', () => {
    const english = {...SPANISH, language: 'en'};

    assert.equal(translateWith(english, 'common', 'actions.cancel'), 'Cancel');
    assert.equal(translateWith({...english, language: 'fr'}, 'common', 'actions.cancel'), 'Cancelar');
});

test('los textos del proyecto mandan sobre los del paquete, solo en lo que traen', () => {
    const settings = {...SPANISH, texts: {es: {common: {actions: {cancel: 'Mejor no'}}}}};

    assert.equal(translateWith(settings, 'common', 'actions.cancel'), 'Mejor no');
    assert.equal(translateWith(settings, 'common', 'actions.close'), 'Cerrar');
});

test('el traductor del proyecto manda sobre todo; si no sabe la llave, sigue el paquete', () => {
    const projectTexts = {'common:actions.cancel': 'Cancelar operación'};
    const settings = {...SPANISH, translate: (namespace, key) => projectTexts[`${namespace}:${key}`]};

    assert.equal(translateWith(settings, 'common', 'actions.cancel'), 'Cancelar operación');
    assert.equal(translateWith(settings, 'common', 'actions.close'), 'Cerrar');
});

test('una llave que no existe se pinta como namespace:llave, para que se note qué falta', () => {
    assert.equal(translateWith(SPANISH, 'common', 'actions.nothing'), 'common:actions.nothing');
});

test('una variable sin valor se queda como está', () => {
    const settings = {...SPANISH, texts: {es: {common: {greeting: 'Hola {{name}}, tienes {{count}}'}}}};

    assert.equal(translateWith(settings, 'common', 'greeting', {name: 'Ana'}), 'Hola Ana, tienes {{count}}');
});

test('lo que no es componente (avisos, errores) usa la configuración vigente', () => {
    configureToolkit({language: 'en'});
    assert.equal(translateToolkit('common', 'actions.cancel'), 'Cancel');
    configureToolkit({language: 'es'});
    assert.equal(translateToolkit('common', 'actions.cancel'), 'Cancelar');
});
