// Pruebas de las rutas sin router (prefijo y #): pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {documentBasePath, hashHrefOf, hashLocationOf, isPlainLeftClick, normalizedBasePath, pathWithBase, pathWithoutBase} from '@/toolkit/navigationPaths.js';

test('el prefijo se limpia: con / al inicio y sin / al final; vacío es la raíz', () => {
    assert.equal(normalizedBasePath('portal/'), '/portal');
    assert.equal(normalizedBasePath('/portal'), '/portal');
    assert.equal(normalizedBasePath(''), '');
    assert.equal(normalizedBasePath(undefined), '');
});

test('con prefijo, una ruta de la app lleva el prefijo y lo de afuera se queda como viene', () => {
    assert.equal(pathWithBase('/portal', '/pedidos?estado=pendiente'), '/portal/pedidos?estado=pendiente');
    assert.equal(pathWithBase('/portal', 'https://otro.sitio/x'), 'https://otro.sitio/x');
    assert.equal(pathWithBase('/portal', '//otro.sitio'), '//otro.sitio');
    assert.equal(pathWithBase('', '/pedidos'), '/pedidos');
});

test('la ruta que ven los componentes no lleva el prefijo; el prefijo solo es el inicio', () => {
    assert.equal(pathWithoutBase('/portal', '/portal/pedidos'), '/pedidos');
    assert.equal(pathWithoutBase('/portal', '/portal'), '/');
    // /portales no es /portal: no se corta a medias
    assert.equal(pathWithoutBase('/portal', '/portales/x'), '/portales/x');
});

test('con #, la página es lo que va después del # y sin nada es el inicio', () => {
    assert.deepEqual(hashLocationOf('#/pedidos?estado=pendiente'), {pathname: '/pedidos', search: '?estado=pendiente'});
    assert.deepEqual(hashLocationOf('#pedidos'), {pathname: '/pedidos', search: ''});
    assert.deepEqual(hashLocationOf(''), {pathname: '/', search: ''});
    assert.deepEqual(hashLocationOf('#'), {pathname: '/', search: ''});
});

test('el enlace con # solo para rutas de la app', () => {
    assert.equal(hashHrefOf('/pedidos'), '#/pedidos');
    assert.equal(hashHrefOf('https://otro.sitio'), 'https://otro.sitio');
});

test('solo el clic normal se hace por dentro: con Cmd/Ctrl, Shift, el botón de en medio o _blank lo hace el navegador', () => {
    const plain = {button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false};
    assert.equal(isPlainLeftClick(plain), true);
    assert.equal(isPlainLeftClick({...plain, metaKey: true}), false);
    assert.equal(isPlainLeftClick({...plain, ctrlKey: true}), false);
    assert.equal(isPlainLeftClick({...plain, shiftKey: true}), false);
    assert.equal(isPlainLeftClick({...plain, button: 1}), false);
    assert.equal(isPlainLeftClick({...plain, defaultPrevented: true}), false);
    assert.equal(isPlainLeftClick(plain, '_blank'), false);
    assert.equal(isPlainLeftClick(plain, '_self'), true);
});

test('el prefijo sale del <base href> de la página; sin <base>, null', () => {
    const pageWithBase = (href) => ({baseURI: href, querySelector: () => ({href})});
    assert.equal(documentBasePath(pageWithBase('https://ejemplo.mx/ventas/')), '/ventas');
    assert.equal(documentBasePath(pageWithBase('https://ejemplo.mx/')), '');
    assert.equal(documentBasePath({baseURI: 'https://ejemplo.mx/pedidos', querySelector: () => null}), null);
    assert.equal(documentBasePath(undefined), null);
});
