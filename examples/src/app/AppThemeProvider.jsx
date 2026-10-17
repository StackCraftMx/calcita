// El tema de los ejemplos por fuera de todo, con lo que elige la persona: el estilo (GlassModeSetting, en el menú de la
// cuenta: sin vidrio, en lo que flota, también en las tarjetas o minimalista) y sus colores y esquinas (el configurador de
// tema, que cambia TODA la app mientras se elige). Todo se recuerda en este navegador; si el almacenamiento está bloqueado o
// nunca eligió, vidrio en lo que flota con los colores de Stackcraft. resetThemeChoices regresa todo a lo de fábrica.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useMemo, useState} from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';

import {DEFAULT_THEME_CHOICES, GLASS_MODES, buildAppTheme} from '@/app/appTheme.js';
import {AppThemeChoiceContext, THEME_COLOR_KEYS, useAppThemeChoice} from '@/core';

// OJO: la llave cambió (antes calcita-examples:glass). El estilo se guardaba aunque nadie lo eligiera, así que todos tenían
// guardado el de fábrica viejo (vidrio también en las tarjetas) y no habrían visto el nuevo
const GLASS_STORAGE_KEY = 'calcita-examples:style';
// por omisión lo que pide la guía de Apple: vidrio en lo que flota y en los controles, el contenido sólido. Las tarjetas de
// vidrio solo se prenden desde el configurador de tema, con su advertencia
const DEFAULT_GLASS_MODE = GLASS_MODES.floating;
const THEME_STORAGE_KEY = 'calcita-examples:theme';
// un color guardado tiene que ser #RRGGBB; lo demás se ignora (algo viejo o editado a mano)
const HEX_COLOR = /^#[0-9A-F]{6}$/i;
// las esquinas que acepta el configurador (px)
const CORNER_RADIUS_LIMITS = Object.freeze({min: 0, max: 20});

// el contexto vive en core (lo leen también los módulos); se vuelve a exportar el gancho para la app
export {useAppThemeChoice};

const readStoredGlassMode = () => {
    try {
        const storedValue = window.localStorage.getItem(GLASS_STORAGE_KEY);
        return Object.values(GLASS_MODES).includes(storedValue) ? storedValue : DEFAULT_GLASS_MODE;
    } catch {
        return DEFAULT_GLASS_MODE;
    }
};

/**
 * Los colores y esquinas guardados, revisados: lo que no sea válido se queda con lo de fábrica.
 *
 * @returns {{colors: Record<string, string>, cornerRadius: number}}
 */
const readStoredThemeChoices = () => {
    try {
        const stored = JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY) ?? 'null');
        if (!stored || typeof stored !== 'object') {
            return DEFAULT_THEME_CHOICES;
        }
        const colors = Object.fromEntries(THEME_COLOR_KEYS.map((key) => (
            [key, HEX_COLOR.test(stored.colors?.[key] ?? '') ? stored.colors[key].toUpperCase() : DEFAULT_THEME_CHOICES.colors[key]]
        )));
        const radius = Number(stored.cornerRadius);
        const cornerRadius = Number.isInteger(radius) && radius >= CORNER_RADIUS_LIMITS.min && radius <= CORNER_RADIUS_LIMITS.max
            ? radius : DEFAULT_THEME_CHOICES.cornerRadius;
        return {colors, cornerRadius};
    } catch {
        return DEFAULT_THEME_CHOICES;
    }
};

export const AppThemeProvider = ({children}) => {
    const [glassMode, setGlassMode] = useState(readStoredGlassMode);
    const [themeChoices, setThemeChoices] = useState(readStoredThemeChoices);
    const theme = useMemo(() => buildAppTheme({glassMode, themeChoices}), [glassMode, themeChoices]);
    const choice = useMemo(() => ({
        glassMode,
        setGlassMode,
        themeChoices,
        setThemeChoices,
        // todo a lo de fábrica: colores, esquinas y estilo
        resetThemeChoices: () => {
            setThemeChoices(DEFAULT_THEME_CHOICES);
            setGlassMode(DEFAULT_GLASS_MODE);
        },
    }), [glassMode, themeChoices]);

    useEffect(() => {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeChoices));
        } catch {
            // almacenamiento bloqueado: cambia igual, solo no se recuerda
        }
    }, [themeChoices]);

    useEffect(() => {
        try {
            window.localStorage.setItem(GLASS_STORAGE_KEY, glassMode);
        } catch {
            // almacenamiento bloqueado: cambia igual, solo no se recuerda
        }
    }, [glassMode]);

    return (
        <AppThemeChoiceContext.Provider value={choice}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </AppThemeChoiceContext.Provider>
    );
};
