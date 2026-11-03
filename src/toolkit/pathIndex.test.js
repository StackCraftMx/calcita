// Pruebas del índice de direcciones con nombre. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {createPathIndex, fillPath} from '@/toolkit/pathIndex.js';

// lo que daría import.meta.glob('@/modules/**/paths.js', {eager: true})
const MODULES = {
    '/src/modules/admin/clients/paths.js': {paths: {providerList: '/admin/user/providers/list'}},
    '/src/modules/admin/profile/paths.js': {paths: {detail: '/admin/user/detail/:groupId/:userId'}},
    '/src/modules/orders/paths.js': {paths: {list: '/orders/:page?'}},
    '/src/modules/home/menu.js': {menuItems: []},
};

test('una dirección se busca por su camino y se le ponen sus partes', () => {
    const {pathOf} = createPathIndex(MODULES);
    assert.equal(pathOf('admin:clients:providerList'), '/admin/user/providers/list');
    assert.equal(pathOf('admin:profile:detail', {groupId: 2, userId: 7675}), '/admin/user/detail/2/7675');
});

test('lo que sobra se va como consulta; los vacíos no se escriben; una parte opcional puede faltar', () => {
    const {pathOf} = createPathIndex(MODULES);
    assert.equal(pathOf('admin:profile:detail', {groupId: 2, userId: 7675, tab: 'documentos', empty: ''}), '/admin/user/detail/2/7675?tab=documentos');
    assert.equal(pathOf('orders:list'), '/orders');
    assert.equal(pathOf('orders:list', {page: 3}), '/orders/3');
});

test('un nombre que no existe truena y dice qué sí hay; falta una parte, también', () => {
    const {pathOf} = createPathIndex(MODULES);
    assert.throws(() => pathOf('admin:clientes:list'), /En admin hay: clients, profile/);
    assert.throws(() => pathOf('admin:profile'), /no es una dirección sino un grupo/);
    assert.throws(() => pathOf('admin:profile:detail', {groupId: 2}), /necesita userId/);
});

test('las direcciones del API con su propio export (uris) y una dirección completa con https', () => {
    const {pathOf} = createPathIndex({'/src/modules/billing/uris.js': {uris: {invoice: 'https://api.ejemplo.mx/v1/invoices/:id'}}}, {exportName: 'uris'});
    assert.equal(pathOf('billing:invoice', {id: 'F-12'}), 'https://api.ejemplo.mx/v1/invoices/F-12');
});

test('fillPath suelto codifica las partes', () => {
    assert.equal(fillPath('/search/:text', {text: 'a b/c'}), '/search/a%20b%2Fc');
});
