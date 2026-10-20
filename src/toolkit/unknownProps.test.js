// Pruebas del aviso de opciones que una pieza no conoce: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {isDevelopmentBuild, unknownPropMessageOf, warnUnknownProps} from '@/toolkit/unknownProps.js';

// junta lo que se manda a console.warn mientras corre `run`
function warningsOf(run) {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (message) => warnings.push(message);
    try {
        run();
    } finally {
        console.warn = originalWarn;
    }
    return warnings;
}

test('en las pruebas (sin NODE_ENV de producción) se está programando', () => {
    assert.equal(isDevelopmentBuild(), true);
});

test('el aviso dice el componente sin el prefijo del tema y la opción que no conoce', () => {
    assert.equal(unknownPropMessageOf('CalcitaServerTable', 'countNoun'),
        'Calcita · ServerTable no conoce la opción «countNoun» y no la usa. Revise el nombre en el README o en «Hecho en Calcita».');
    assert.match(unknownPropMessageOf('detailColumn', 'label'), /^Calcita · detailColumn no conoce la opción «label»/);
});

test('avisa una vez por pieza y opción, no en cada render, y no cuenta el ref de React', () => {
    const warnings = warningsOf(() => {
        warnUnknownProps('CalcitaPruebaUno', {countNoun: 'cliente', ref: null});
        warnUnknownProps('CalcitaPruebaUno', {countNoun: 'cliente'});
        warnUnknownProps('CalcitaPruebaDos', {countNoun: 'cliente'});
        warnUnknownProps('CalcitaPruebaDos', {});
    });
    assert.deepEqual(warnings, [unknownPropMessageOf('CalcitaPruebaUno', 'countNoun'), unknownPropMessageOf('CalcitaPruebaDos', 'countNoun')]);
});

test('en producción no avisa', () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
        assert.deepEqual(warningsOf(() => warnUnknownProps('CalcitaPruebaTres', {countNoun: 'cliente'})), []);
    } finally {
        // OJO: process.env guarda texto; asignarle undefined deja la palabra «undefined»
        if (previous === undefined) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = previous;
        }
    }
});
