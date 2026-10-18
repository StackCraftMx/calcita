// Pruebas del menú compuesto desde el menu.js de cada módulo. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {createAccessChecker} from '@/access/accessRules.js';
import {activeMenuItemOf, composeMenu, menuBadgeOf, menuBreadcrumbsOf, mobileTabsOf, parentMenuItemOf} from '@/navigation/appMenu.js';

// lo que regresaría import.meta.glob('@/modules/*/menu.js', {eager: true})
const MENU_MODULES = {
    '/src/modules/reports/menu.js': {order: 30, access: {ability: 'reports.view'}, buildMenuItem: () => ({to: '/reports', label: 'Reportes'})},
    '/src/modules/orders/menu.js': {
        order: 10,
        buildMenuItems: () => [
            {to: '/orders', label: 'Pedidos'},
            {to: '/orders/returns', label: 'Devoluciones', access: {ability: 'returns.view'}},
        ],
    },
    '/src/modules/home/menu.js': {order: 1, buildMenuItem: () => ({to: '/', label: 'Inicio'})},
    '/src/modules/beta/menu.js': {buildMenuItem: () => null},
};

test('junta los módulos en su orden, con las entradas que le tocan a la sesión', () => {
    const canAccess = createAccessChecker({abilities: ['reports.view']});
    const menuItems = composeMenu(MENU_MODULES, {canAccess});

    assert.deepEqual(menuItems.map((menuItem) => menuItem.label), ['Inicio', 'Pedidos', 'Reportes']);
});

test('sin permiso no sale el módulo ni la entrada con su propia regla; una entrada apagada (null) tampoco', () => {
    const canAccess = createAccessChecker({abilities: ['returns.view']});
    const menuItems = composeMenu(MENU_MODULES, {canAccess});

    assert.deepEqual(menuItems.map((menuItem) => menuItem.to), ['/', '/orders', '/orders/returns']);
});

test('la entrada activa es la más específica, y el inicio solo en el inicio', () => {
    const menuItems = composeMenu(MENU_MODULES);

    assert.equal(activeMenuItemOf(menuItems, '/orders/15').to, '/orders');
    assert.equal(activeMenuItemOf(menuItems, '/orders/returns/3').to, '/orders/returns');
    assert.equal(activeMenuItemOf(menuItems, '/').to, '/');
    assert.equal(activeMenuItemOf(menuItems, '/nada'), null);
});

// un módulo con submenú: la entrada de arriba no lleva a una pantalla, sus hijas sí
const MODULES_WITH_SUBMENU = [
    {order: 1, buildMenuItem: () => ({to: '/', label: 'Inicio'})},
    {
        order: 20,
        buildMenuItem: () => ({
            label: 'Catálogos',
            children: [
                {to: '/catalogs/products', label: 'Productos'},
                {to: '/catalogs/prices', label: 'Precios', access: {ability: 'prices.view'}},
            ],
        }),
    },
    {order: 30, buildMenuItem: () => ({label: 'Vacío', children: [{to: '/secret', label: 'Secreto', access: {ability: 'secret.view'}}]})},
];

test('un submenú se filtra por permiso, y si se queda sin hijas no sale', () => {
    const menuItems = composeMenu(MODULES_WITH_SUBMENU, {canAccess: createAccessChecker({abilities: []})});

    assert.deepEqual(menuItems.map((menuItem) => menuItem.label), ['Inicio', 'Catálogos']);
    assert.deepEqual(menuItems[1].children.map((child) => child.label), ['Productos']);
});

test('la entrada activa puede estar en un submenú, y se sabe cuál es su submenú', () => {
    const menuItems = composeMenu(MODULES_WITH_SUBMENU, {canAccess: createAccessChecker({abilities: ['prices.view']})});
    const activeItem = activeMenuItemOf(menuItems, '/catalogs/prices/7');

    assert.equal(activeItem.label, 'Precios');
    assert.equal(parentMenuItemOf(menuItems, activeItem).label, 'Catálogos');
    assert.equal(parentMenuItemOf(menuItems, menuItems[0]), null);
});

test('las migas salen del menú: inicio, submenú y pantalla; en el inicio, solo el inicio', () => {
    const menuItems = composeMenu(MODULES_WITH_SUBMENU, {canAccess: createAccessChecker({abilities: []})});

    assert.deepEqual(menuBreadcrumbsOf(menuItems, '/catalogs/products').map((crumb) => crumb.label), ['Inicio', 'Catálogos', 'Productos']);
    assert.deepEqual(menuBreadcrumbsOf(menuItems, '/').map((crumb) => crumb.label), ['Inicio']);
    assert.deepEqual(menuBreadcrumbsOf(menuItems, '/fuera-del-menu'), []);
});

test('si el submenú y su primera hija llevan al mismo camino, la activa es la hija', () => {
    const menuItems = composeMenu([
        {buildMenuItem: () => ({to: '/forms', label: 'Formularios', children: [{to: '/forms', label: 'Alta'}, {to: '/forms/steps', label: 'Por pasos'}]})},
    ]);

    assert.equal(activeMenuItemOf(menuItems, '/forms').label, 'Alta');
    assert.equal(activeMenuItemOf(menuItems, '/forms/steps').label, 'Por pasos');
    assert.deepEqual(menuBreadcrumbsOf(menuItems, '/forms').map((crumb) => crumb.label), ['Formularios', 'Alta']);
});

test('el badge de una entrada: su conteo del servidor, la suma de sus hijas o el badge fijo; un cero no se enseña', () => {
    const orders = {to: '/orders', badgeKey: 'pendingPayment'};
    const forms = {label: 'Formularios', children: [{to: '/a', badgeKey: 'drafts'}, {to: '/b', badgeKey: 'pendingPayment'}]};

    assert.deepEqual(menuBadgeOf(orders, {pendingPayment: 13}), {content: 13, isCount: true});
    assert.deepEqual(menuBadgeOf(forms, {drafts: 2, pendingPayment: 13}), {content: 15, isCount: true});
    assert.equal(menuBadgeOf(orders, {pendingPayment: 0}), null);
    assert.equal(menuBadgeOf(orders), null);
    assert.deepEqual(menuBadgeOf({to: '/metrics', badge: 'Nuevo'}), {content: 'Nuevo', isCount: false});
});

test('las pestañas del teléfono: las marcadas con mobileTab (o las primeras), hasta 4 y «Más» con el resto', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'].map((name) => ({to: `/${name}`, label: name}));
    const marked = items.map((item, index) => ({...item, mobileTab: index % 2 === 1}));

    assert.deepEqual(mobileTabsOf(items).tabs.map((item) => item.label), ['a', 'b', 'c', 'd']);
    assert.deepEqual(mobileTabsOf(items).more.map((item) => item.label), ['e', 'f']);
    assert.deepEqual(mobileTabsOf(marked).tabs.map((item) => item.label), ['b', 'd', 'f']);
    assert.deepEqual(mobileTabsOf(items.slice(0, 5)), {tabs: items.slice(0, 5), more: []});
});

test('las pestañas que fijó la persona ganan a las marcadas, en el orden del menú', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'].map((name) => ({to: `/${name}`, label: name, mobileTab: name === 'a'}));

    assert.deepEqual(mobileTabsOf(items, ['/f', '/c']).tabs.map((item) => item.label), ['c', 'f']);
    assert.deepEqual(mobileTabsOf(items, ['/f', '/c']).more.map((item) => item.label), ['a', 'b', 'd', 'e']);
    // una que ya no puede ver (o que el proyecto quitó) no cuenta; si no queda ninguna, vuelven las marcadas
    assert.deepEqual(mobileTabsOf(items, ['/borrada', '/e']).tabs.map((item) => item.label), ['e']);
    assert.deepEqual(mobileTabsOf(items, ['/borrada']).tabs.map((item) => item.label), ['a']);
    // nunca más de las que caben junto a «Más»
    assert.equal(mobileTabsOf(items, items.map((item) => item.to)).tabs.length, 4);
});

test('las pestañas del teléfono según las que caben a lo ancho (la barra mide su ancho)', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'].map((name) => ({to: `/${name}`, label: name}));

    // pantalla angosta: caben 3 → 2 pestañas y «Más»
    assert.deepEqual(mobileTabsOf(items, null, 3).tabs.map((item) => item.label), ['a', 'b']);
    assert.deepEqual(mobileTabsOf(items, null, 3).more.map((item) => item.label), ['c', 'd', 'e', 'f']);
    // pantalla ancha: caben todas y no hay «Más»
    assert.deepEqual(mobileTabsOf(items, null, 8), {tabs: items, more: []});
    // las marcadas siguen mandando aunque quepan más
    const marked = items.map((item) => ({...item, mobileTab: item.label === 'b' || item.label === 'e'}));
    assert.deepEqual(mobileTabsOf(marked, null, 5).tabs.map((item) => item.label), ['b', 'e']);
    // aunque no quepa nada, al menos una pestaña junto a «Más»
    assert.equal(mobileTabsOf(items, null, 1).tabs.length, 1);
});
