import assert from 'node:assert/strict';
import {test} from 'node:test';

import {forgetPageName, pageNameAt, rememberPageName} from '@/navigationTrail.js';

// sessionStorage de mentiras: guarda texto como el del navegador, sin ventana
function fakeStorage() {
    const values = new Map();
    return {
        getItem: (key) => (values.has(key) ? values.get(key) : null),
        setItem: (key, value) => values.set(key, String(value)),
    };
}

test('el botón de la página siguiente lee el nombre que anotó la anterior', () => {
    // la lista en la posición 0, el detalle en la 1: la validación (posición 2) regresa al detalle
    const storage = fakeStorage();
    rememberPageName(0, {labelKey: 'upload-control:detail.backToList'}, storage);
    rememberPageName(1, {labelKey: 'upload-control:detail.backToBatchNamed', params: {label: 'Q15 · 1-15 ago 2026'}}, storage);

    assert.deepEqual(pageNameAt(1, storage), {labelKey: 'upload-control:detail.backToBatchNamed', params: {label: 'Q15 · 1-15 ago 2026'}});
    assert.deepEqual(pageNameAt(0, storage), {labelKey: 'upload-control:detail.backToList', params: {}});
});

test('una página nueva en una posición reusada borra el nombre viejo y los de más adelante', () => {
    // lista (0) → detalle (1) → validación (2); el usuario regresa a la lista y entra a otra página que no anota nombre
    const storage = fakeStorage();
    rememberPageName(0, {labelKey: 'lista'}, storage);
    rememberPageName(1, {labelKey: 'detalle'}, storage);
    rememberPageName(2, {labelKey: 'validacion'}, storage);

    forgetPageName(1, storage);

    assert.equal(pageNameAt(1, storage), null);
    assert.equal(pageNameAt(2, storage), null);
    assert.deepEqual(pageNameAt(0, storage), {labelKey: 'lista', params: {}});
});

test('anotar una posición descarta las de más adelante: el navegador ya las descartó', () => {
    const storage = fakeStorage();
    rememberPageName(3, {labelKey: 'vieja'}, storage);
    rememberPageName(1, {labelKey: 'nueva'}, storage);

    assert.equal(pageNameAt(3, storage), null);
    assert.deepEqual(pageNameAt(1, storage), {labelKey: 'nueva', params: {}});
});

test('sin almacenamiento o con uno roto el botón vuelve a su texto de siempre', () => {
    // ventana privada (null), un valor que no es JSON y uno que no es objeto: ninguno truena
    assert.equal(pageNameAt(0, null), null);
    rememberPageName(0, {labelKey: 'lista'}, null);

    const brokenStorage = fakeStorage();
    brokenStorage.setItem('calcita:navigationTrail', '{no es json');
    assert.equal(pageNameAt(0, brokenStorage), null);
    brokenStorage.setItem('calcita:navigationTrail', '[1,2]');
    assert.equal(pageNameAt(0, brokenStorage), null);

    const blockedStorage = {
        getItem: () => { throw new Error('bloqueado'); },
        setItem: () => { throw new Error('bloqueado'); },
    };
    rememberPageName(0, {labelKey: 'lista'}, blockedStorage);
    assert.equal(pageNameAt(0, blockedStorage), null);
});
