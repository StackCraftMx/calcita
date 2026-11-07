// El tema de los ejemplos: el del framework (createToolkitTheme, el estilo de Stackcraft con claro y oscuro), con el estilo
// que se elige en el menú de la cuenta (vidrio o minimalista) y lo que la persona eligió en el configurador de tema (sus
// colores, sus esquinas, las superficies con vidrio y la pestaña elegida). Con los de fábrica queda idéntico al de siempre,
// más dos ajustes de proyecto: el botón «⋯» y la × del cajón de filtros.
import {
    FILTER_DRAWER_CLOSE_PLACEMENT, GLASS_SELECTED_TAB, THEME_LOOK, TOP_BAR, createToolkitTheme, stackcraftDarkPalette, stackcraftLightPalette,
} from '@stackcraftmx/calcita';

import {DEFAULT_CORNER_RADIUS, GLASS_MODES, STACKCRAFT_COLORS, changedColorsOf, paletteWithColors} from '@/core';

// GLASS_MODES vive en core (lo usan también los módulos); se vuelve a exportar aquí para la app
export {GLASS_MODES};

// EL «⋯» DE 44 PX CON EL DEDO. El botón del menú de acciones (en las tarjetas de Pedidos, el tablero, la bandeja) mide 30 px;
// en una pantalla táctil se agranda a 44, lo que pide Apple para un blanco del dedo (la regla de la web pide 24 como mínimo).
// Así lo haría cualquier proyecto: con la parte button de CalcitaActionsMenu en su tema, sin tocar las pantallas
//
// LA × DEL CAJÓN DE FILTROS A LA DERECHA. En el teléfono el cajón ocupa casi toda la pantalla y el pulgar de la mano derecha no
// alcanza la esquina de la izquierda. Una línea en el tema la mueve en todos los cajones de filtros de la app (Pedidos, el
// catálogo); de fábrica Calcita la deja al principio
const PROJECT_COMPONENTS = Object.freeze({
    CalcitaActionsMenu: {styleOverrides: {button: {'@media (pointer: coarse)': {minWidth: 44, minHeight: 44}}}},
    CalcitaFilterDrawer: {defaultProps: {closePlacement: FILTER_DRAWER_CLOSE_PLACEMENT.end}},
});

/** Lo que trae el configurador de tema de fábrica: los colores de Stackcraft, las esquinas y la barra del framework. */
export const DEFAULT_THEME_CHOICES = Object.freeze({
    colors: STACKCRAFT_COLORS, cornerRadius: DEFAULT_CORNER_RADIUS, bar: TOP_BAR.capsules, surfacesOff: [], selectedTab: GLASS_SELECTED_TAB.drop,
});

/**
 * @param {object} options
 * @param {string} options.glassMode uno de GLASS_MODES
 * @param {{colors: Record<string, string>, cornerRadius: number, bar?: string, surfacesOff?: string[], selectedTab?: string}} [options.themeChoices]
 *     lo del configurador de tema (bar: la barra de arriba con vidrio o minimalista, TOP_BAR; surfacesOff: las superficies
 *     que van sin vidrio, GLASS_SURFACE; selectedTab: la pestaña elegida, GLASS_SELECTED_TAB)
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
        return createToolkitTheme({colorSchemes, overrides, components: PROJECT_COMPONENTS});
    }
    // la barra en cápsulas o en franja: con vidrio y con el minimalista (sin vidrio no aplica)
    const bar = themeChoices.bar ?? TOP_BAR.capsules;
    if (glassMode === GLASS_MODES.minimal) {
        return createToolkitTheme({colorSchemes, overrides, look: THEME_LOOK.minimal, bar, components: PROJECT_COMPONENTS});
    }
    // cada superficie apagada va con false; las tarjetas, según el estilo elegido en el menú de la cuenta
    const surfaces = {
        ...Object.fromEntries((themeChoices.surfacesOff ?? []).map((surface) => [surface, false])),
        cards: glassMode === GLASS_MODES.surfaces,
    };
    const glass = {surfaces, selectedTab: themeChoices.selectedTab ?? GLASS_SELECTED_TAB.drop};
    return createToolkitTheme({colorSchemes, overrides, glass, bar, components: PROJECT_COMPONENTS});
}
