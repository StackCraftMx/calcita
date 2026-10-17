import assert from 'node:assert/strict';
import {test} from 'node:test';

import {STACKCRAFT_COLORS, changedColorsOf, paletteWithColors} from '@/core/themeColors.js';
import {THEME_GLASS, glassOptionOf, themeCodeOf} from '@/modules/themeBuilder/themeCode.js';

const CHOICES = {colors: {primary: '#ff6b1a', error: '#b91c1c'}, glass: THEME_GLASS.surfaces, cornerRadius: 12};

test('la paleta parte de la base y solo cambia los colores elegidos; en oscuro los de estado se aclaran', () => {
    const base = {background: {default: '#FAFAFA'}, primary: {main: '#000000'}};
    const light = paletteWithColors(base, CHOICES.colors, false);
    const dark = paletteWithColors(base, CHOICES.colors, true);

    assert.equal(light.background.default, '#FAFAFA');
    assert.deepEqual(light.primary, {main: '#ff6b1a'});
    assert.deepEqual(dark.primary, {main: '#ff6b1a'});
    assert.notEqual(dark.error.main, '#b91c1c');
});

test('el vidrio que se exporta: apagado, en lo que flota o también en las tarjetas', () => {
    assert.equal(glassOptionOf(THEME_GLASS.off), false);
    assert.equal(glassOptionOf(THEME_GLASS.floating), true);
    assert.deepEqual(glassOptionOf(THEME_GLASS.surfaces), {surfaces: true});
});

test('con el estilo minimalista el código lleva look y no vidrio', () => {
    const code = themeCodeOf({...CHOICES, look: 'minimal'});

    assert.match(code, /look: 'minimal'/);
    assert.doesNotMatch(code, /glass:/);
});

test('el código exportado trae los colores elegidos, el vidrio y las esquinas; la versión TS trae su tipo', () => {
    const code = themeCodeOf(CHOICES);
    const typed = themeCodeOf(CHOICES, true);

    assert.match(code, /primary: \{main: '#FF6B1A'\}/);
    assert.match(code, /glass: \{surfaces: true\}/);
    assert.match(code, /borderRadius: 12/);
    assert.doesNotMatch(code, /Theme\b.*from '@mui\/material\/styles'/);
    assert.match(typed, /import type \{Theme\} from '@mui\/material\/styles';/);
    assert.match(typed, /export const appTheme: Theme = /);
});

test('solo cuentan los colores cambiados: con los de fábrica no se toca la paleta de Stackcraft', () => {
    assert.deepEqual(changedColorsOf(STACKCRAFT_COLORS), {});
    assert.deepEqual(changedColorsOf({...STACKCRAFT_COLORS, primary: '#2563EB'}), {primary: '#2563EB'});
});
