// El configurador de tema: la persona elige los colores de su marca, el estilo (vidrio o minimalista) y las esquinas, y
// TODA la app cambia mientras elige (AppThemeProvider; se recuerda en el navegador; «Restablecer» regresa a lo de fábrica).
// La vista previa enseña además el otro modo (claro u oscuro) (componentes reales del framework con ese tema) y al final copia o descarga el código del tema en
// JS o en TS, listo para pegar. Lo puro (las paletas y el código) vive en themeCode.js.
//
// Cómo se pinta la vista previa: un ThemeProvider dentro de la página con el tema elegido, SIN variables CSS
// (cssVariables: false): las variables las pone el tema de la app en la raíz y dos temas con variables se pisarían. Por eso
// la vista previa enseña un modo a la vez (claro u oscuro, a elegir).
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import {ThemeProvider} from '@mui/material/styles';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import {
    ColorInput, CopyButton, FormRow, FormSection, MetricCard, PageHeading, SegmentedControl, THEME_LOOK, TREND_DIRECTION, TextInput,
    createToolkitTheme, stackcraftDarkPalette, stackcraftLightPalette, useToolkitTranslation,
} from '@stackcraftmx/calcita';

import {GLASS_MODES, STACKCRAFT_COLORS, THEME_COLOR_KEYS, paletteWithColors, useAppThemeChoice} from '@/core';
import {THEME_GLASS, glassOptionOf, themeCodeOf} from '@/modules/themeBuilder/themeCode.js';

const PREVIEW_MODES = Object.freeze({light: 'light', dark: 'dark'});
const CODE_LANGUAGES = Object.freeze({js: 'js', ts: 'ts'});
// las esquinas: de cuadradas a muy redondas (px), y las de omisión del framework
const CORNER_RADIUS = Object.freeze({min: 0, max: 20});
// lo ancho de la columna de las opciones en escritorio (px)
const CONTROLS_WIDTH_PIXELS = 420;

/**
 * Descarga el código como archivo, sin servidor: un Blob con su liga temporal.
 *
 * @param {string} code
 * @param {string} fileName
 */
const downloadCode = (code, fileName) => {
    const url = URL.createObjectURL(new Blob([code], {type: 'text/javascript'}));
    const link = Object.assign(document.createElement('a'), {href: url, download: fileName});
    link.click();
    URL.revokeObjectURL(url);
};

/** Lo que se ve con el tema elegido: componentes reales del framework. */
const PreviewContent = () => {
    const {t} = useToolkitTranslation('themeBuilder');
    const [tab, setTab] = useState('orders');
    const [name, setName] = useState('Ana Martínez');
    return (
        <Stack spacing={2.5}>
            <SegmentedControl ariaLabel={t('preview.title')} value={tab} onChange={setTab}
                              options={['orders', 'customers', 'reports'].map((key) => ({value: key, label: t(`preview.tabs.${key}`)}))} />
            <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap'}}>
                <Button variant="contained">{t('preview.save')}</Button>
                <Button variant="outlined">{t('preview.cancel')}</Button>
                <Button>{t('preview.more')}</Button>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap'}}>
                <Chip label={t('preview.chipNew')} color="primary" />
                <Chip label={t('preview.chipPaid')} color="success" variant="outlined" />
                <Chip label={t('preview.chipLate')} color="error" variant="outlined" />
            </Stack>
            <MetricCard label={t('preview.sold')} value={t('preview.soldValue')} caption={t('preview.soldCaption')} tone="success"
                        trend={{label: '+17.0%', direction: TREND_DIRECTION.up}} />
            <Paper variant="outlined" sx={{p: 2.5}}>
                <TextInput label={t('preview.field')} value={name} onChange={setName} />
                <Stack direction="row" spacing={2} useFlexGap sx={{alignItems: 'center', flexWrap: 'wrap'}}>
                    <FormControlLabel control={<Switch defaultChecked />} label={t('preview.notices')} />
                    <Checkbox defaultChecked slotProps={{input: {'aria-label': t('preview.notices')}}} />
                </Stack>
                <Slider defaultValue={60} aria-label={t('look.corners')} />
            </Paper>
            <Alert severity="success">{t('preview.success')}</Alert>
            <Alert severity="error">{t('preview.error')}</Alert>
        </Stack>
    );
};

export const ThemeBuilderPage = () => {
    const {t} = useToolkitTranslation('themeBuilder');
    // lo que se elige aquí es lo de TODA la app (AppThemeProvider): cambia mientras se elige y se recuerda en el navegador
    const {glassMode, setGlassMode, themeChoices, setThemeChoices, resetThemeChoices} = useAppThemeChoice();
    const {colors, cornerRadius} = themeChoices;
    const isMinimal = glassMode === GLASS_MODES.minimal;
    const look = isMinimal ? THEME_LOOK.minimal : THEME_LOOK.standard;
    // el vidrio del código exportado: el de la app (con el minimalista no aplica; se exporta look)
    const glass = isMinimal ? THEME_GLASS.floating : glassMode;
    // al volver de minimalista a vidrio, el de fábrica: en lo que flota
    const setLook = (nextLook) => setGlassMode(nextLook === THEME_LOOK.minimal ? GLASS_MODES.minimal : GLASS_MODES.floating);
    const setColors = (update) => setThemeChoices((current) => ({...current, colors: update(current.colors)}));
    const setCornerRadius = (nextRadius) => setThemeChoices((current) => ({...current, cornerRadius: nextRadius}));
    const [previewMode, setPreviewMode] = useState(PREVIEW_MODES.light);
    const [codeLanguage, setCodeLanguage] = useState(CODE_LANGUAGES.js);

    const isDarkPreview = previewMode === PREVIEW_MODES.dark;
    const previewTheme = useMemo(() => createToolkitTheme({
        // OJO: sin variables CSS, MUI no deduce el modo por el nombre del esquema: se le dice (si no, los avisos en oscuro
        // oscurecían su letra como en claro y casi no se leían)
        colorSchemes: {[previewMode]: {palette: {
            ...paletteWithColors(isDarkPreview ? stackcraftDarkPalette : stackcraftLightPalette, colors, isDarkPreview), mode: previewMode,
        }}},
        glass: glassOptionOf(glass),
        look,
        overrides: {cssVariables: false, defaultColorScheme: previewMode, shape: {borderRadius: cornerRadius}},
    }), [colors, glass, look, cornerRadius, previewMode, isDarkPreview]);
    const code = themeCodeOf({colors, glass, cornerRadius, look}, codeLanguage === CODE_LANGUAGES.ts);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('page.title')} description={t('page.subtitle')}
                         actions={<Button variant="outlined" startIcon={<RestartAltRoundedIcon />} onClick={resetThemeChoices}>{t('look.reset')}</Button>} />

            <Stack direction={{xs: 'column', md: 'row'}} spacing={3} sx={{alignItems: 'flex-start'}}>
                <Stack spacing={3} sx={{width: {xs: '100%', md: CONTROLS_WIDTH_PIXELS}, flexShrink: 0}}>
                    <FormSection title={t('colors.title')} footer={t('colors.footer')}>
                        {THEME_COLOR_KEYS.map((key) => (
                            <ColorInput key={key} label={t(`colors.${key}`)} value={colors[key]} checkContrast={false}
                                        onChange={(color) => setColors((current) => ({...current, [key]: color || STACKCRAFT_COLORS[key]}))} />
                        ))}
                    </FormSection>
                    <FormSection title={t('look.title')}>
                        <FormRow label={t('look.style')}>
                            <SegmentedControl ariaLabel={t('look.style')} value={look} onChange={setLook}
                                              options={[{value: THEME_LOOK.standard, label: t('look.styleGlass')}, {value: THEME_LOOK.minimal, label: t('look.styleMinimal')}]} />
                        </FormRow>
                        {!isMinimal && (
                            <FormRow label={t('look.glass')}>
                            <SegmentedControl ariaLabel={t('look.glass')} value={glass} onChange={setGlassMode}
                                              options={[
                                                  {value: THEME_GLASS.off, label: t('look.glassOff')},
                                                  {value: THEME_GLASS.floating, label: t('look.glassFloating')},
                                                  {value: THEME_GLASS.surfaces, label: t('look.glassSurfaces')},
                                              ]} />
                        </FormRow>
                        )}
                        {/* las tarjetas de vidrio se permiten, pero con su advertencia (también sale en la consola del proyecto) */}
                        {!isMinimal && glass === THEME_GLASS.surfaces && <Alert severity="warning">{t('look.glassSurfacesWarning')}</Alert>}
                        <FormRow label={t('look.corners')}>
                            <Stack direction="row" spacing={2} sx={{alignItems: 'center', minHeight: 40}}>
                                <Slider value={cornerRadius} min={CORNER_RADIUS.min} max={CORNER_RADIUS.max} step={1} aria-label={t('look.corners')}
                                        onChange={(event, nextValue) => setCornerRadius(nextValue)} />
                                <Typography variant="body2" sx={{minWidth: 44, textAlign: 'end', fontVariantNumeric: 'tabular-nums'}}>
                                    {t('look.cornersValue', {pixels: cornerRadius})}
                                </Typography>
                            </Stack>
                        </FormRow>
                        <FormRow label={t('look.preview')}>
                            <SegmentedControl ariaLabel={t('look.preview')} value={previewMode} onChange={setPreviewMode}
                                              options={[{value: PREVIEW_MODES.light, label: t('look.light')}, {value: PREVIEW_MODES.dark, label: t('look.dark')}]} />
                        </FormRow>
                    </FormSection>
                </Stack>

                {/* la vista previa con el tema elegido: un fondo con color para que se note el vidrio */}
                <ThemeProvider theme={previewTheme}>
                    <Box aria-label={t('preview.title')} role="region"
                         sx={(theme) => ({
                             flex: 1, minWidth: 0, width: '100%', p: {xs: 2, md: 3}, borderRadius: '20px', color: 'text.primary',
                             bgcolor: 'background.default',
                             // con vidrio, manchas de color detrás para que se note; el minimalista es plano: sin manchas ni borde
                             ...(isMinimal ? {} : {
                                 backgroundImage: `radial-gradient(60% 50% at 0% 0%, color-mix(in srgb, ${theme.palette.primary.main} 28%, transparent), transparent 70%),
                                     radial-gradient(50% 45% at 100% 100%, color-mix(in srgb, ${theme.palette.info.main} 24%, transparent), transparent 70%)`,
                                 border: 1, borderColor: 'divider',
                             }),
                         })}>
                        <PreviewContent />
                    </Box>
                </ThemeProvider>
            </Stack>

            <Paper variant="outlined" sx={{p: {xs: 2, md: 3}}}>
                <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} sx={{alignItems: {sm: 'center'}, justifyContent: 'space-between', mb: 2}}>
                    <Box>
                        <Typography variant="h6" component="h2">{t('code.title')}</Typography>
                        <Typography variant="body2" color="text.secondary">{t('code.description')}</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{alignItems: 'center', flexShrink: 0}}>
                        <SegmentedControl ariaLabel={t('code.title')} value={codeLanguage} onChange={setCodeLanguage}
                                          options={[{value: CODE_LANGUAGES.js, label: 'JS'}, {value: CODE_LANGUAGES.ts, label: 'TS'}]} />
                        <CopyButton value={code} label={t('code.copy')} />
                        <Button startIcon={<DownloadOutlinedIcon />} onClick={() => downloadCode(code, `appTheme.${codeLanguage}`)}>{t('code.download')}</Button>
                    </Stack>
                </Stack>
                <Box component="pre"
                     sx={{m: 0, p: 2, borderRadius: '12px', overflowX: 'auto', fontSize: '0.8125rem', lineHeight: 1.6, bgcolor: 'action.hover',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace'}}>
                    {code}
                </Box>
            </Paper>
        </Stack>
    );
};
