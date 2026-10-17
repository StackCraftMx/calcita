// Pruebas de la superficie de vidrio. Sin navegador: pnpm test.
import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
    accentTextStylesOf, ambientBackgroundOf, glassStylesOf, glassSurfaceOf, materialBackgroundOf, materialSurfaceOf, whiteLabelFillOf,
} from '@/theme/glassSurface.js';

test('el vidrio mezcla el color del tema con la opacidad pedida y desenfoca lo de atrás', () => {
    const surface = glassSurfaceOf('var(--mui-palette-background-paper)', {opacity: 0.8});

    assert.equal(surface.backgroundColor, 'color-mix(in srgb, var(--mui-palette-background-paper) 80%, transparent)');
    assert.match(surface.backdropFilter, /blur\(20px\)/);
    assert.equal(surface.WebkitBackdropFilter, surface.backdropFilter);
});

test('con «reducir transparencia», más contraste o sin desenfoque en el navegador, se pinta sólido', () => {
    const surface = glassSurfaceOf('#ffffff');
    const fallbacks = Object.entries(surface).filter(([key]) => key.startsWith('@'));

    assert.equal(fallbacks.length, 2);
    fallbacks.forEach(([, solidStyle]) => {
        assert.equal(solidStyle.backgroundColor, '#ffffff');
        assert.equal(solidStyle.backdropFilter, 'none');
    });
});

test('el fondo del lienzo con vidrio lleva manchas del color principal y del de información', () => {
    const theme = {
        palette: {primary: {main: '#ff6b1a', light: '#ff8a4d', dark: '#cc5614'}, info: {main: '#0369a1', dark: '#075985'}, background: {default: '#fafafa'}},
        applyStyles: (mode, styles) => ({[`.${mode} &`]: styles}),
    };
    const background = ambientBackgroundOf(theme);

    // el fondo va en una capa fija (::before), no con background-attachment: fixed, que el iPhone ignora
    const layer = background['&::before'];
    assert.equal(background.backgroundColor, '#fafafa');
    assert.equal(layer.position, 'fixed');
    assert.match(layer.backgroundImage, /#ff6b1a 40%/);
    assert.match(layer.backgroundImage, /#0369a1 30%/);
    // la de en medio, detrás del contenido, para que las tarjetas de vidrio no queden sobre blanco
    assert.match(layer.backgroundImage, /#0369a1 16%/);
    // en oscuro, los tonos oscuros sobre un casi negro: tiñen sin aclarar el fondo hasta el gris de las tarjetas
    assert.equal(layer['.dark &'].backgroundColor, '#05070B');
    assert.match(layer['.dark &'].backgroundImage, /#cc5614 18%/);
    assert.doesNotMatch(layer['.dark &'].backgroundImage, /#ff6b1a/);
});

test('en oscuro el vidrio se aclara un poco sobre su color, para distinguirse del lienzo; el sólido de respaldo no', () => {
    const surface = glassSurfaceOf('#121212', {opacity: 0.8, isDark: true});
    const fallbacks = Object.entries(surface).filter(([key]) => key.startsWith('@'));

    assert.equal(surface.backgroundColor, 'color-mix(in srgb, color-mix(in srgb, #121212, white 16%) 80%, transparent)');
    fallbacks.forEach(([, solidStyle]) => assert.equal(solidStyle.backgroundColor, '#121212'));
});

test('el material del contenido esmerila sin el brillo del borde y es más transparente que el vidrio (0.8 - 0.15)', () => {
    const material = materialSurfaceOf('#ffffff', {opacity: 0.8});

    assert.match(material.backdropFilter, /blur\(20px\)/);
    assert.equal(material.backgroundImage, 'none');
    assert.doesNotMatch(material.boxShadow, /inset/);
    assert.equal(material.backgroundColor, 'color-mix(in srgb, #ffffff 65%, transparent)');
});

test('el lente va detrás de la marca de <body> (solo Chrome), también en oscuro, y con «reducir transparencia» se pinta sólido', () => {
    const theme = {
        palette: {background: {paper: '#ffffff'}},
        applyStyles: (mode, styles) => ({[`*:where(.${mode}) &`]: styles}),
    };
    const styles = glassStylesOf(theme, {isControl: true});
    const lens = styles['body[data-glass-lens="on"] &'];
    const darkLens = styles['*:where(.dark) body[data-glass-lens="on"] &'];

    assert.match(lens.backdropFilter, /url\(#toolkit-glass-lens-control\)/);
    assert.match(darkLens.backdropFilter, /url\(#toolkit-glass-lens-control\)/);
    // el control con lente es más claro que el esmerilado
    assert.match(lens.backgroundColor, / 35%, transparent\)$/);
    const fallback = Object.entries(lens).find(([key]) => key.startsWith('@media'))[1];
    assert.equal(fallback.backdropFilter, 'none');
});

test('el texto del color del tema se oscurece en claro y se aclara en oscuro, para leerse (4.5 : 1 o más)', () => {
    const theme = {
        palette: {primary: {main: '#ff6b1a'}, error: {main: '#b91c1c'}},
        applyStyles: (mode, styles) => ({[`.${mode} &`]: styles}),
    };
    const primaryText = accentTextStylesOf(theme);
    const errorText = accentTextStylesOf(theme, 'error');

    // medido: el naranja tal cual daba 2.78 : 1 sobre una tarjeta clara; con 30 % de negro, 5.24 : 1
    assert.equal(primaryText.color, 'color-mix(in srgb, #ff6b1a 70%, black)');
    assert.equal(primaryText['.dark &'].color, 'color-mix(in srgb, #ff6b1a 70%, white)');
    assert.equal(errorText.color, 'color-mix(in srgb, #b91c1c 70%, black)');
});

test('el relleno para letra blanca se oscurece lo justo para 4.5 : 1, y un color que ya se lee no cambia', () => {
    // el naranja de la marca con blanco daba 2.85 : 1; al 75 % da 4.79 : 1
    assert.equal(whiteLabelFillOf('#FF6B1A'), '#bf5014');
    // el rojo de la paleta clara ya se lee con blanco
    assert.equal(whiteLabelFillOf('#b91c1c'), '#b91c1c');
    // el blanco baja al gris más claro que ya se lee con letra blanca (4.74 : 1)
    assert.equal(whiteLabelFillOf('#fff'), '#737373');
    assert.equal(whiteLabelFillOf('var(--mui-palette-primary-main)'), null);
});

test('en oscuro la tarjeta es menos transparente que en claro (0.6 - 0.05), para no perderse en el fondo', () => {
    const lightCard = materialSurfaceOf('#1a1a1a', {opacity: 0.6});
    const darkCard = materialSurfaceOf('#1a1a1a', {opacity: 0.6, isDark: true});

    assert.match(lightCard.backgroundColor, / 45%, transparent\)$/);
    assert.match(darkCard.backgroundColor, / 55%, transparent\)$/);
});

test('el material grueso (la columna fija de una tabla) tapa lo de abajo al 92 %, en claro y en oscuro', () => {
    const theme = {
        palette: {background: {paper: '#ffffff'}},
        toolkit: {glass: {opacity: 0.6}},
        applyStyles: (mode, styles) => ({[`.${mode} &`]: styles}),
    };
    const thin = materialBackgroundOf(theme);
    const thick = materialBackgroundOf(theme, {thick: true});

    assert.match(thin.backgroundImage, / 45%, transparent\)/);
    assert.match(thick.backgroundImage, / 92%, transparent\)/);
    assert.match(thick['.dark &'].backgroundImage, / 92%, transparent\)/);
});
