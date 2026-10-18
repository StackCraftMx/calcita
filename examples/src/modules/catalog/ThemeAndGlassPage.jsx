// Hecho en Calcita · el tema y el vidrio: createToolkitTheme (claro y oscuro, vidrio líquido o minimalista, colores
// propios) y la apariencia que elige cada persona.
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import AppearanceDemo from '@/modules/catalog/demos/theme/AppearanceDemo.tsx';

const loadAppearance = () => import('@/modules/catalog/demos/theme/AppearanceDemo.tsx?demo-source');
const loadSetup = () => import('@/modules/catalog/demos/theme/ThemeSetup.ts?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (themeAndGlass.<sección>.extend.<id>)
const APPEARANCE_EXTENSIONS = [
    {id: 'settings', option: '<AppearanceSettings />', example: '<AppearanceSettings />'},
    {id: 'show', option: 'showFontSize · showLanguage · showColorScheme', example: '<AppearanceSettings showLanguage={false} />'},
    {id: 'panel', option: '<GlassPanel>', example: '<GlassPanel sx={{p: 1}}><ZoomButtons /></GlassPanel>'},
    {id: 'panelSx', option: 'sx · component', example: '<GlassPanel component="aside" sx={{position: "absolute", top: 16}}>'},
    {id: 'glassStyles', option: 'glassStylesOf · materialStylesOf', example: 'sx={(theme) => glassStylesOf(theme)}'},
    {id: 'isGlass', option: 'isGlassTheme(theme)', example: 'const hasGlass = isGlassTheme(useTheme());'},
];
const SETUP_EXTENSIONS = [
    {id: 'colors', option: 'colorSchemes', example: "colorSchemes: {light: {palette: {...stackcraftLightPalette, primary: {main: '#2563EB'}}}, dark: {…}}"},
    {id: 'glass', option: 'glass', example: 'glass: true  ·  glass: {opacity: 0.7, surfaces: true}'},
    {id: 'look', option: 'look', example: 'look: THEME_LOOK.minimal'},
    {id: 'bar', option: 'bar', example: 'bar: TOP_BAR.band'},
    {id: 'font', option: 'fontFamily', example: "fontFamily: 'Inter, system-ui, sans-serif'"},
    {id: 'components', option: 'components', example: 'components: {MuiButton: {defaultProps: {disableElevation: true}}}'},
    {id: 'overrides', option: 'overrides', example: 'overrides: {shape: {borderRadius: 12}}'},
    {id: 'selector', option: 'colorSchemeSelector', example: "colorSchemeSelector: 'data'"},
    {id: 'android', option: 'isAndroidDevice()', example: 'isAndroidDevice() ? minimalTheme : glassTheme'},
];

export const ThemeAndGlassPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `themeAndGlass.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('themeAndGlass.title')} description={t('themeAndGlass.description')} />
            <DemoSection title={t('themeAndGlass.appearance.title')} description={t('themeAndGlass.appearance.description')}
                         extensions={rowsOf('appearance', APPEARANCE_EXTENSIONS)} Demo={AppearanceDemo} loadSource={loadAppearance} />
            <CodeSection title={t('themeAndGlass.setup.title')} description={t('themeAndGlass.setup.description')}
                         extensions={rowsOf('setup', SETUP_EXTENSIONS)} loadSource={loadSetup} />
        </Stack>
    );
};
