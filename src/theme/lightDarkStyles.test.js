// Pruebas de los estilos de claro y oscuro que el sx del proyecto puede pisar: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {lightDarkStylesOf} from '@/theme/lightDarkStyles.js';

const DARK_KEY = '*:where(.dark) &';
const theme = {applyStyles: (mode, styles) => ({[`*:where(.${mode}) &`]: styles})};

test('lo que cambia de modo va en la clase con su variable, y la regla de oscuro solo cambia la variable', () => {
    const styles = lightDarkStylesOf(theme, {backgroundColor: '#E5E5EA', color: '#fff'}, {backgroundColor: '#2C2C2E', color: '#fff'});

    assert.equal(styles.backgroundColor, 'var(--calcita-background-color)');
    assert.equal(styles['--calcita-background-color'], '#E5E5EA');
    assert.equal(styles.color, '#fff');
    // la regla de oscuro NO toca background-color: así el sx del proyecto (en la clase, después) gana también en oscuro
    assert.deepEqual(styles[DARK_KEY], {'--calcita-background-color': '#2C2C2E'});
});

test('los bloques anidados de los dos modos se arman igual, y van después de la regla de oscuro', () => {
    const styles = lightDarkStylesOf(theme,
        {backgroundColor: 'a', '&:hover': {backgroundColor: 'b'}},
        {backgroundColor: 'c', '&:hover': {backgroundColor: 'd'}});

    assert.deepEqual(Object.keys(styles), ['--calcita-background-color', 'backgroundColor', DARK_KEY, '&:hover']);
    assert.deepEqual(styles['&:hover'], {
        '--calcita-background-color': 'b', backgroundColor: 'var(--calcita-background-color)', [DARK_KEY]: {'--calcita-background-color': 'd'},
    });
});

test('un número, una palabra de CSS o algo que solo trae el oscuro se quedan como antes, en la regla de oscuro', () => {
    const styles = lightDarkStylesOf(theme, {opacity: 1, color: 'inherit'}, {opacity: 0.8, color: '#fff', borderColor: '#333'});

    assert.equal(styles.opacity, 1);
    assert.equal(styles.color, 'inherit');
    assert.deepEqual(styles[DARK_KEY], {opacity: 0.8, color: '#fff', borderColor: '#333'});
});

test('un tema sin modo oscuro (applyStyles no regresa nada) se queda con lo de claro', () => {
    const lightOnly = {applyStyles: () => ({})};

    assert.deepEqual(lightDarkStylesOf(lightOnly, {color: 'a'}, {color: 'b'}), {'--calcita-color': 'a', color: 'var(--calcita-color)'});
});
