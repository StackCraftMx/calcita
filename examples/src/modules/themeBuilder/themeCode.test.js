import assert from 'node:assert/strict';
import {test} from 'node:test';

import {DEFAULT_GLASS_SURFACES} from '@stackcraftmx/calcita';

import {STACKCRAFT_COLORS, changedColorsOf, paletteWithColors} from '@/core/themeColors.js';
import {THEME_BAR, THEME_FLOATING_SURFACES, THEME_GLASS, THEME_OUTLINED_BUTTON, THEME_SELECTED_TAB, glassOptionOf, themeCodeOf} from '@/modules/themeBuilder/themeCode.js';

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

test('la barra: las cápsulas son lo de omisión y no se escriben; la franja sí, con vidrio o con el minimalista', () => {
    assert.doesNotMatch(themeCodeOf({...CHOICES, bar: THEME_BAR.capsules}), /bar:/);
    assert.match(themeCodeOf({...CHOICES, bar: THEME_BAR.band}), /^ {4}bar: 'band',$/m);
    assert.match(themeCodeOf({...CHOICES, look: 'minimal', bar: THEME_BAR.band}), /^ {4}bar: 'band',$/m);
    // sin vidrio y sin minimalista no aplica
    assert.doesNotMatch(themeCodeOf({...CHOICES, glass: THEME_GLASS.off, bar: THEME_BAR.band}), /bar:/);
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

test('el vidrio por superficie: solo se escriben las apagadas; con las tarjetas, también cards; la pestaña de color', () => {
    assert.deepEqual(glassOptionOf(THEME_GLASS.floating, {surfacesOff: ['backdrop', 'drawers']}), {surfaces: {backdrop: false, drawers: false}});
    assert.deepEqual(glassOptionOf(THEME_GLASS.surfaces, {surfacesOff: ['menus']}), {surfaces: {menus: false, cards: true}});
    assert.deepEqual(glassOptionOf(THEME_GLASS.floating, {selectedTab: THEME_SELECTED_TAB.accent}), {selectedTab: 'accent'});
    // sin vidrio no aplica nada de esto
    assert.equal(glassOptionOf(THEME_GLASS.off, {surfacesOff: ['menus'], selectedTab: THEME_SELECTED_TAB.accent}), false);

    const code = themeCodeOf({...CHOICES, glass: THEME_GLASS.floating, surfacesOff: ['backdrop'], selectedTab: THEME_SELECTED_TAB.accent});
    assert.match(code, /^ {4}glass: \{surfaces: \{backdrop: false\}, selectedTab: 'accent'\},$/m);
    assert.match(themeCodeOf({...CHOICES, glass: THEME_GLASS.floating}), /^ {4}glass: true,$/m);
});

test('el botón con borde: con borde de verdad se escribe; la cápsula de vidrio (de fábrica) no', () => {
    assert.deepEqual(glassOptionOf(THEME_GLASS.floating, {outlinedButton: THEME_OUTLINED_BUTTON.bordered}), {outlinedButton: 'bordered'});
    assert.equal(glassOptionOf(THEME_GLASS.floating, {outlinedButton: THEME_OUTLINED_BUTTON.glass}), true);
    assert.equal(glassOptionOf(THEME_GLASS.off, {outlinedButton: THEME_OUTLINED_BUTTON.bordered}), false);

    const code = themeCodeOf({...CHOICES, glass: THEME_GLASS.floating, selectedTab: THEME_SELECTED_TAB.accent, outlinedButton: THEME_OUTLINED_BUTTON.bordered});
    assert.match(code, /^ {4}glass: \{selectedTab: 'accent', outlinedButton: 'bordered'\},$/m);
});

test('las superficies del configurador son las de Calcita que flotan (sin las tarjetas, que van aparte)', () => {
    assert.ok(THEME_FLOATING_SURFACES.every((surface) => surface in DEFAULT_GLASS_SURFACES));
    assert.equal(THEME_FLOATING_SURFACES.length, Object.keys(DEFAULT_GLASS_SURFACES).length - 1);
    assert.ok(!THEME_FLOATING_SURFACES.includes('cards'));
});
