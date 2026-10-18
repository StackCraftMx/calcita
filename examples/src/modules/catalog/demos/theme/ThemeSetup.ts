// El tema del framework (createToolkitTheme): los ajustes de cada componente de Calcita, claro y oscuro, el vidrio líquido
// en lo que flota (según la guía de Apple) o el estilo minimalista. Cada proyecto pone sus colores: de cada uno basta el
// «main» (MUI saca la versión clara, la oscura y el color de la letra encima). El configurador de tema de estos ejemplos
// arma este archivo con vista previa.
import {THEME_LOOK, createToolkitTheme, stackcraftDarkPalette, stackcraftLightPalette} from '@stackcraftmx/calcita';

const PRIMARY_COLOR = '#2563EB';

// con vidrio en lo que flota (barra, menús, avisos) y el contenido sólido
export const glassTheme = createToolkitTheme({
    colorSchemes: {
        light: {palette: {...stackcraftLightPalette, primary: {main: PRIMARY_COLOR}}},
        dark: {palette: {...stackcraftDarkPalette, primary: {main: PRIMARY_COLOR}}},
    },
    glass: true,
    overrides: {shape: {borderRadius: 12}},
});

// plano y tonal: sin bordes ni sombras; las superficies se separan por su tono
export const minimalTheme = createToolkitTheme({look: THEME_LOOK.minimal});

// los colores de MUI tal cual, solo claro, con un ajuste propio de un componente (se suma a los de Calcita)
export const muiColorsTheme = createToolkitTheme({
    colorSchemes: {light: true},
    components: {MuiButton: {defaultProps: {disableElevation: true}}},
});
