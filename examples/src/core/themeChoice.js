// Lo que la persona eligió del tema (el estilo y sus colores y esquinas): el contexto lo da la app (AppThemeProvider) y lo
// usan el ajuste del menú de la cuenta y el configurador de tema. Vive en core, como la sesión: los módulos lo leen sin
// importar nada de la app.
import {createContext, useContext} from 'react';

/** Los estilos que se pueden comparar en los ejemplos: tres formas de vidrio y el minimalista (plano y tonal). */
export const GLASS_MODES = Object.freeze({
    off: 'off',
    // lo que pide la guía: vidrio en lo que flota y en los controles, el contenido sólido
    floating: 'floating',
    // también las tarjetas del contenido (glass: {surfaces: true})
    surfaces: 'surfaces',
    // el minimalista: sin vidrio, sin bordes ni sombras, las superficies por su tono (look: 'minimal')
    minimal: 'minimal',
});

export const AppThemeChoiceContext = createContext({
    glassMode: GLASS_MODES.surfaces, setGlassMode: () => {}, themeChoices: null, setThemeChoices: () => {}, resetThemeChoices: () => {},
});

/** Lo que eligió la persona: {glassMode, setGlassMode, themeChoices, setThemeChoices, resetThemeChoices}. */
export const useAppThemeChoice = () => useContext(AppThemeChoiceContext);
