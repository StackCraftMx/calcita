// El tema de los ejemplos: el del framework (createToolkitTheme, el estilo de Stackcraft con claro y oscuro), con el estilo
// que se elige en el menú de la cuenta (vidrio o minimalista) y lo que la persona eligió en el configurador de tema (sus
// colores y sus esquinas). Con los de fábrica queda idéntico al de siempre.
import {THEME_LOOK, TOP_BAR, createToolkitTheme, stackcraftDarkPalette, stackcraftLightPalette} from '@stackcraftmx/calcita';

import {DEFAULT_CORNER_RADIUS, GLASS_MODES, STACKCRAFT_COLORS, changedColorsOf, paletteWithColors} from '@/core';

// GLASS_MODES vive en core (lo usan también los módulos); se vuelve a exportar aquí para la app
export {GLASS_MODES};

/** Lo que trae el configurador de tema de fábrica: los colores de Stackcraft, las esquinas y la barra del framework. */
export const DEFAULT_THEME_CHOICES = Object.freeze({colors: STACKCRAFT_COLORS, cornerRadius: DEFAULT_CORNER_RADIUS, bar: TOP_BAR.capsules});

/**
 * @param {object} options
 * @param {string} options.glassMode uno de GLASS_MODES
 * @param {{colors: Record<string, string>, cornerRadius: number, bar?: string}} [options.themeChoices] lo del
 *     configurador de tema (bar: la barra de arriba con vidrio o minimalista, TOP_BAR)
 * @returns {object} el tema de MUI
 */
export function buildAppTheme({glassMode, themeChoices = DEFAULT_THEME_CHOICES}) {
    // solo los colores que la persona cambió: con los de fábrica no se toca la paleta de Stackcraft
    const changedColors = changedColorsOf(themeChoices.colors);
    const colorSchemes = {
        light: {palette: paletteWithColors(stackcraftLightPalette, changedColors, false)},
        dark: {palette: paletteWithColors(stackcraftDarkPalette, changedColors, true)},
    };
    const overrides = {shape: {borderRadius: themeChoices.cornerRadius}};
    if (glassMode === GLASS_MODES.off) {
        return createToolkitTheme({colorSchemes, overrides});
    }
    // la barra en cápsulas o en franja: con vidrio y con el minimalista (sin vidrio no aplica)
    const bar = themeChoices.bar ?? TOP_BAR.capsules;
    if (glassMode === GLASS_MODES.minimal) {
        return createToolkitTheme({colorSchemes, overrides, look: THEME_LOOK.minimal, bar});
    }
    return createToolkitTheme({colorSchemes, overrides, glass: {surfaces: glassMode === GLASS_MODES.surfaces}, bar});
}
