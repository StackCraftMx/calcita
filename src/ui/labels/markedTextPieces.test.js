// Pruebas de leer un texto con marcas. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {parseMarkedText} from '@/ui/labels/markedTextPieces.js';

test('una marca con texto adentro queda como su pedazo, con lo de antes y lo de después', () => {
    assert.deepEqual(parseMarkedText('Optimiza tu negocio con <highlight>financiamiento</highlight> inteligente', ['highlight']), [
        {type: 'text', value: 'Optimiza tu negocio con '},
        {type: 'mark', name: 'highlight', children: [{type: 'text', value: 'financiamiento'}]},
        {type: 'text', value: ' inteligente'},
    ]);
});

test('marcas una dentro de otra y una marca sola', () => {
    assert.deepEqual(parseMarkedText('Lea <link>los <strong>términos</strong></link><br/>y acepte', ['link', 'strong', 'br']), [
        {type: 'text', value: 'Lea '},
        {type: 'mark', name: 'link', children: [
            {type: 'text', value: 'los '},
            {type: 'mark', name: 'strong', children: [{type: 'text', value: 'términos'}]},
        ]},
        {type: 'mark', name: 'br', children: []},
        {type: 'text', value: 'y acepte'},
    ]);
});

test('una marca que la pantalla no nombra sale como texto, letra por letra (un dato con «<b>» no se pierde)', () => {
    assert.deepEqual(parseMarkedText('Hola <b>Juan</b>', ['highlight']), [{type: 'text', value: 'Hola <b>Juan</b>'}]);
});

test('una marca que no cierra, o que cierra sin abrir, sale como texto y no se come la frase', () => {
    assert.deepEqual(parseMarkedText('Con <highlight>financiamiento inteligente', ['highlight']), [
        {type: 'text', value: 'Con <highlight>financiamiento inteligente'},
    ]);
    assert.deepEqual(parseMarkedText('Con financiamiento</highlight> inteligente', ['highlight']), [
        {type: 'text', value: 'Con financiamiento</highlight> inteligente'},
    ]);
});

test('sin texto, nada', () => {
    assert.deepEqual(parseMarkedText('', ['highlight']), []);
    assert.deepEqual(parseMarkedText(undefined, ['highlight']), []);
});
