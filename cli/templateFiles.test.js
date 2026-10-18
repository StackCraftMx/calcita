import assert from 'node:assert/strict';
import {test} from 'node:test';

import {insertAfterLastMatch, insertIntoArray, outputPathOf, renderTemplate} from './templateFiles.js';

test('cambia los valores y quita los renglones de una opción apagada', () => {
    const template = [
        "import {Toaster} from '@stackcraftmx/calcita';",
        '//#if pwa',
        "import {InstallPromptBanner} from '@stackcraftmx/calcita';",
        '//#endif',
        '//#if !pwa',
        '// sin PWA',
        '//#endif',
        "export const APP_NAME = '__APP_TITLE__';",
    ].join('\n');
    const withPwa = renderTemplate(template, {values: {APP_TITLE: 'Mi tienda'}, flags: {pwa: true}});
    assert.match(withPwa, /InstallPromptBanner/);
    assert.doesNotMatch(withPwa, /sin PWA|#if|#endif/);
    assert.match(withPwa, /'Mi tienda'/);
    const withoutPwa = renderTemplate(template, {values: {APP_TITLE: 'Mi tienda'}, flags: {pwa: false}});
    assert.doesNotMatch(withoutPwa, /InstallPromptBanner/);
    assert.match(withoutPwa, /sin PWA/);
});

test('las opciones se anidan', () => {
    const template = ['//#if auth', 'a', '//#if pwa', 'b', '//#endif', 'c', '//#endif'].join('\n');
    assert.equal(renderTemplate(template, {flags: {auth: true, pwa: false}}), 'a\nc');
    assert.equal(renderTemplate(template, {flags: {auth: false, pwa: true}}), '');
});

test('truena con un valor sin dar, una opción que no existe o un #if sin cerrar', () => {
    assert.throws(() => renderTemplate('const x = __Name__;'), /__Name__/);
    assert.throws(() => renderTemplate('//#if offline\nx\n//#endif', {flags: {}}), /offline/);
    assert.throws(() => renderTemplate('//#if pwa\nx', {flags: {pwa: true}}), /endif/);
});

test('el nombre de salida: sin .tpl, con sus valores y dot- como punto', () => {
    assert.equal(outputPathOf('src/modules/__name__/__Name__Page.jsx.tpl', {name: 'contacts', Name: 'Contacts'}), 'src/modules/contacts/ContactsPage.jsx');
    assert.equal(outputPathOf('dot-gitignore.tpl', {}), '.gitignore');
    assert.equal(outputPathOf('public/icons/icon-192.png', {}), 'public/icons/icon-192.png');
});

test('agrega una ruta al final del arreglo y una constante después de la última', () => {
    const routesFile = [
        "export const CONTACTS_PATH = '/contacts';",
        '',
        'export const routes = [',
        '    {path: CONTACTS_PATH},',
        '];',
        '',
    ].join('\n');
    const withRoute = insertIntoArray(routesFile, 'export const routes = [', '    {path: DETAIL_PATH},');
    assert.match(withRoute, /\{path: CONTACTS_PATH\},\n {4}\{path: DETAIL_PATH\},\n\];/);
    const withPath = insertAfterLastMatch(withRoute, /^export const \w+_PATH = .*;$/m, "export const DETAIL_PATH = '/contacts/detail';");
    assert.match(withPath, /'\/contacts';\nexport const DETAIL_PATH = '\/contacts\/detail';\n/);
    assert.equal(insertIntoArray('const otra = [];', 'export const routes = [', 'x'), null);
});
