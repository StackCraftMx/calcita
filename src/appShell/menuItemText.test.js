// Pruebas de los textos del menú y de las iniciales. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {initialsOf, menuItemDescriptionOf, menuItemLabelOf, menuItemSectionOf, menuSectionsOf} from '@/appShell/menuItemText.js';

const translate = (key) => `«${key}»`;

test('el texto escrito manda; si no hay, se traduce la llave', () => {
    assert.equal(menuItemLabelOf({label: 'Pedidos', labelKey: 'orders:menu.label'}, translate), 'Pedidos');
    assert.equal(menuItemLabelOf({labelKey: 'orders:menu.label'}, translate), '«orders:menu.label»');
    assert.equal(menuItemDescriptionOf({}, translate), undefined);
    assert.equal(menuItemSectionOf({sectionKey: 'app:menu.operation'}, translate), '«app:menu.operation»');
});

test('las secciones salen en el orden de su primera entrada y no se parten aunque el orden las intercale', () => {
    const menuItems = [
        {label: 'Inicio'},
        {label: 'Pedidos', section: 'Operación'},
        {label: 'Avisos', section: 'Interfaz'},
        {label: 'Reportes', section: 'Herramientas'},
        {label: 'Métricas', section: 'Interfaz'},
    ];
    const sections = menuSectionsOf(menuItems, translate);

    assert.deepEqual(sections.map((section) => section.title), [undefined, 'Operación', 'Interfaz', 'Herramientas']);
    assert.deepEqual(sections[2].menuItems.map((menuItem) => menuItem.label), ['Avisos', 'Métricas']);
});

test('las iniciales son de las dos primeras palabras, sin las partículas del nombre', () => {
    assert.equal(initialsOf('Ana María López'), 'AM');
    assert.equal(initialsOf('  bruno  '), 'B');
    assert.equal(initialsOf('Usuario de Ejemplo'), 'UE');
    assert.equal(initialsOf('María de la Luz Pérez'), 'ML');
    assert.equal(initialsOf(''), '?');
    assert.equal(initialsOf(null), '?');
});
