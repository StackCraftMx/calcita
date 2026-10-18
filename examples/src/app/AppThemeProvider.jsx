// El tema de los ejemplos por fuera de todo, con lo que elige la persona: el estilo (GlassModeSetting, en el menú de la
// cuenta: sin vidrio, en lo que flota, también en las tarjetas o minimalista) y sus colores y esquinas (el configurador de
// tema, que cambia TODA la app mientras se elige). Todo se recuerda en este navegador; si el almacenamiento está bloqueado o
// nunca eligió, vidrio en lo que flota con los colores de Stackcraft, y en Android el minimalista (isAndroidDevice: el
// vidrio es de Apple y el desenfoque pesa en los teléfonos baratos). resetThemeChoices regresa todo a lo de fábrica.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useCallback, useEffect, useMemo, useState} from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {isAndroidDevice} from '@stackcraftmx/calcita';

import {DEFAULT_THEME_CHOICES, GLASS_MODES, buildAppTheme} from '@/app/appTheme.js';
import {AppThemeChoiceContext, THEME_COLOR_KEYS, useAppThemeChoice} from '@/core';

// OJO: el estilo se guardaba aunque nadie lo eligiera, así que todos tenían guardado el de fábrica de su primera visita y
// no veían el nuevo (pasó dos veces: calcita-examples:glass y luego calcita-examples:style). Ahora se guarda SOLO cuando la
// persona elige, y lo de fábrica se calcula en cada visita (así en Android sale el minimalista). La llave es nueva para
// que lo guardado sin elegir con las llaves viejas no tape lo de fábrica
const GLASS_STORAGE_KEY = 'calcita-examples:chosen-style';
// por omisión lo que pide la guía de Apple: vidrio en lo que flota y en los controles, el contenido sólido. Las tarjetas de
// vidrio solo se prenden desde el configurador de tema, con su advertencia. En Android, el minimalista
const defaultGlassModeOf = () => (isAndroidDevice() ? GLASS_MODES.minimal : GLASS_MODES.floating);
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
        return Object.values(GLASS_MODES).includes(storedValue) ? storedValue : defaultGlassModeOf();
    } catch {
        return defaultGlassModeOf();
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

    // el estilo se guarda solo cuando la persona lo elige (null: lo borra y vuelve a lo de fábrica de este equipo)
    const rememberGlassMode = useCallback((nextGlassMode) => {
        setGlassMode(nextGlassMode ?? defaultGlassModeOf());
        try {
            if (nextGlassMode) {
                window.localStorage.setItem(GLASS_STORAGE_KEY, nextGlassMode);
            } else {
                window.localStorage.removeItem(GLASS_STORAGE_KEY);
            }
        } catch {
            // almacenamiento bloqueado: cambia igual, solo no se recuerda
        }
    }, []);

    const choice = useMemo(() => ({
        glassMode,
        setGlassMode: rememberGlassMode,
        themeChoices,
        setThemeChoices,
        // todo a lo de fábrica: colores, esquinas y estilo
        resetThemeChoices: () => {
            setThemeChoices(DEFAULT_THEME_CHOICES);
            rememberGlassMode(null);
        },
    }), [glassMode, themeChoices, rememberGlassMode]);

    useEffect(() => {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeChoices));
        } catch {
            // almacenamiento bloqueado: cambia igual, solo no se recuerda
        }
    }, [themeChoices]);

    return (
        <AppThemeChoiceContext.Provider value={choice}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </AppThemeChoiceContext.Provider>
    );
};
