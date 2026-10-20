// Los ajustes de cómo se ve la app para esta persona: tamaño de letra, idioma y claro u oscuro, cada uno con sus opciones
// a la vista (botones de grupo) en lugar de un botón que cambia sin decir a qué. Los usan el engrane del teléfono
// (SettingsMenu), el menú de la cuenta (AccountMenu) y la pantalla de «Mi perfil» del proyecto: un solo lugar para todos.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaAppearanceSettings con defaultProps y
// styleOverrides de sus partes: selectSection, section, sectionLabel, option, divider.
//
// Genérico del paquete: function (regla de la casa).
import {Fragment} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import {useColorScheme} from '@mui/material/styles';
import AutomaticModeIcon from '@mui/icons-material/BrightnessAutoOutlined';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';

import {useToolkitSettings} from '@/toolkit/toolkitContext.js';
import {DEFAULT_LANGUAGES} from '@/toolkit/toolkitSettings.js';
import {useFontSize} from '@/ui/navigation/useFontSize.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaAppearanceSettings)
const THEME_NAME = 'CalcitaAppearanceSettings';
const AppearanceSelectSection = piecePart(THEME_NAME, 'SelectSection', Box);
const AppearanceSection = piecePart(THEME_NAME, 'Section', Box);
const AppearanceSectionLabel = piecePart(THEME_NAME, 'SectionLabel', Typography);
const AppearanceOption = piecePart(THEME_NAME, 'Option', ToggleButton);
const AppearanceDivider = piecePart(THEME_NAME, 'Divider', Divider);

// cuántas opciones caben como botones lado a lado en el menú de la cuenta; con más, lista desplegable
const SETTING_BUTTONS_LIMIT = 3;

/**
 * Un ajuste: su nombre y sus opciones a la vista. Es público: el proyecto agrega los suyos al menú de la cuenta con la
 * misma forma (AppLayout accountSettings), como el vidrio en los ejemplos.
 *
 * @param {object} props
 * @param {string} props.label ya traducido
 * @param {string} props.value la opción elegida
 * @param {Object[]} props.options
 * @param {string} props.options[].value
 * @param {string} props.options[].label ya traducido
 * @param {import('react').ReactNode} [props.options[].icon]
 * @param {(value: string) => void} props.onChange
 */
export function SettingSection({label, value, options, onChange}) {
    // con muchas opciones (los idiomas de una app que ofrece cinco) los botones lado a lado no caben: lista desplegable
    if (options.length > SETTING_BUTTONS_LIMIT) {
        return (
            <AppearanceSelectSection ownSx={{px: 1, py: 0.5}}>
                <TextField select fullWidth size="small" label={label} value={value} onChange={(event) => onChange(event.target.value)}>
                    {options.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                </TextField>
            </AppearanceSelectSection>
        );
    }
    return (
        <AppearanceSection ownSx={{px: 1, py: 0.5}}>
            <AppearanceSectionLabel variant="overline" color="text.secondary" component="p" ownSx={{px: 1, lineHeight: 1.6}}>{label}</AppearanceSectionLabel>
            <ToggleButtonGroup value={value} exclusive fullWidth size="small" aria-label={label}
                               onChange={(event, nextValue) => {
                                   // al picar la opción ya elegida MUI manda null: se queda la que estaba
                                   if (nextValue) {
                                       onChange(nextValue);
                                   }
                               }}>
                {options.map((option) => (
                    <AppearanceOption key={option.value} value={option.value} ownSx={{gap: 0.75}}>{option.icon}{option.label}</AppearanceOption>
                ))}
            </ToggleButtonGroup>
        </AppearanceSection>
    );
}

/**
 * @param {object} props
 * @param {boolean} [props.showFontSize] por omisión sí
 * @param {boolean} [props.showLanguage] por omisión sí
 * @param {boolean} [props.showColorScheme] por omisión sí
 * @param {(level: string) => void} [props.onFontSizeChange] la persona eligió otro tamaño de letra (para guardarlo en su
 *     servidor; el idioma ya sale por onLanguageChange de ToolkitProvider)
 * @param {(mode: 'light'|'dark'|'system') => void} [props.onColorSchemeChange] la persona eligió otro modo
 * @param {object} [props.texts] los textos que cambian, con la forma de `layout` en los textos del paquete
 */
export default function AppearanceSettings(props) {
    // lo que el proyecto puso en su tema (components.CalcitaAppearanceSettings.defaultProps) y encima lo que llega aquí
    const {
    showFontSize = true, showLanguage = true, showColorScheme = true, onFontSizeChange, onColorSchemeChange, texts,
    ...unknownProps
} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t, language, changeLanguage} = useToolkitTranslation('layout', texts);
    const {languages = DEFAULT_LANGUAGES} = useToolkitSettings();
    const {level, setLevel, levels} = useFontSize();
    const {mode, setMode} = useColorScheme();
    const chooseFontSize = (nextLevel) => {
        setLevel(nextLevel);
        onFontSizeChange?.(nextLevel);
    };
    const chooseColorScheme = (nextMode) => {
        setMode(nextMode);
        onColorSchemeChange?.(nextMode);
    };

    const sections = [
        showFontSize && (
            <SettingSection key="fontSize" label={t('fontSize.label')} value={level} onChange={chooseFontSize}
                            options={levels.map((option) => ({value: option.key, label: t(option.labelKey)}))} />
        ),
        showLanguage && (
            <SettingSection key="language" label={t('settings.language')} value={language} onChange={changeLanguage}
                            // los idiomas de la app; español e inglés con su nombre de siempre, los del proyecto con el suyo
                            options={languages.map((entry) => ({value: entry.code, label: t(`languageName.${entry.code}`, {defaultValue: entry.label})}))} />
        ),
        // antes de montar no se sabe el modo (el servidor no lo conoce): la sección sale ya montada.
        // Tres opciones: «Automático» (system de MUI) sigue lo que diga el equipo y es lo de omisión. Es la ÚNICA salida
        // para volver a seguirlo: el botón de la barra (ColorSchemeToggle) fija claro u oscuro para siempre. La guía de
        // Apple pide seguir el ajuste del equipo; el botón de la barra se queda con dos estados para no sumar una decisión.
        showColorScheme && mode && (
            <SettingSection key="colorScheme" label={t('settings.colorScheme')} value={mode} onChange={chooseColorScheme}
                            options={[
                                {value: 'light', label: t('settings.light'), icon: <LightModeIcon fontSize="small" />},
                                {value: 'dark', label: t('settings.dark'), icon: <DarkModeIcon fontSize="small" />},
                                {value: 'system', label: t('settings.system'), icon: <AutomaticModeIcon fontSize="small" />},
                            ]} />
        ),
    ].filter(Boolean);

    return sections.map((section, index) => (
        <Fragment key={section.key}>
            {index > 0 && <AppearanceDivider ownSx={{my: 0.5}} />}
            {section}
        </Fragment>
    ));
}
