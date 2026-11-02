// Pruebas de lo que decide el editor sin pantalla. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {isSafeLinkUrl, linkUrlOf, normalizedHtmlOf} from '@/richText/richTextRules.js';

test('las ligas seguras pasan tal cual; un dominio suelto se completa con https', () => {
    assert.equal(linkUrlOf('https://calcita.mx/docs'), 'https://calcita.mx/docs');
    assert.equal(linkUrlOf(' mailto:ventas@ejemplo.com '), 'mailto:ventas@ejemplo.com');
    assert.equal(linkUrlOf('tel:5551234567'), 'tel:5551234567');
    assert.equal(linkUrlOf('www.ejemplo.com/precios'), 'https://www.ejemplo.com/precios');
});

test('javascript:, data: y lo que no es dirección no pasan (una liga así ejecuta código al picarla)', () => {
    assert.equal(linkUrlOf('javascript:alert(1)'), null);
    assert.equal(linkUrlOf('JaVaScRiPt:alert(1)'), null);
    assert.equal(linkUrlOf('data:text/html,<script>alert(1)</script>'), null);
    assert.equal(linkUrlOf('hola mundo'), null);
    assert.equal(linkUrlOf(''), null);
    assert.equal(isSafeLinkUrl('https://ejemplo.com'), true);
});

test('el documento vacío se guarda como texto vacío', () => {
    assert.equal(normalizedHtmlOf('<p></p>'), '');
    assert.equal(normalizedHtmlOf('<p></p><p> </p>'), '');
    assert.equal(normalizedHtmlOf(null), '');
    assert.equal(normalizedHtmlOf('<p>Hola</p>'), '<p>Hola</p>');
});
