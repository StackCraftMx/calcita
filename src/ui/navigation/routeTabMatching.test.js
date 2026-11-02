// Pruebas de qué pestaña va activa. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {activeRouteTabOf, queryTabOf, searchWithTab} from '@/ui/navigation/routeTabMatching.js';

test('por ruta: gana la idéntica o la más larga de la que es parte; exact solo la idéntica', () => {
    const tabs = [{to: '/customers/12'}, {to: '/customers/12/payments'}, {to: '/customers/12/files', exact: true}];
    assert.equal(activeRouteTabOf(tabs, '/customers/12'), '/customers/12');
    assert.equal(activeRouteTabOf(tabs, '/customers/12/payments/april'), '/customers/12/payments');
    assert.equal(activeRouteTabOf(tabs, '/customers/12/payments/'), '/customers/12/payments');
    assert.equal(activeRouteTabOf(tabs, '/customers/12/files/3'), '/customers/12');
    assert.equal(activeRouteTabOf(tabs, '/orders'), null);
});

test('por consulta: la de ?tab=, o la primera; cambiarla no pierde lo demás', () => {
    const tabs = [{value: 'summary'}, {value: 'payments'}];
    assert.equal(queryTabOf(tabs, '?tab=payments&page=2', 'tab'), 'payments');
    assert.equal(queryTabOf(tabs, '?tab=otra', 'tab'), 'summary');
    assert.equal(queryTabOf(tabs, '', 'tab'), 'summary');
    assert.equal(searchWithTab('?page=2', 'tab', 'payments'), '?page=2&tab=payments');
    assert.equal(searchWithTab('?tab=summary&page=2', 'tab', 'payments'), '?tab=payments&page=2');
});
