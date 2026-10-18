// Los ajustes de cómo se ve la app para esta persona: tamaño de letra, idioma y claro u oscuro, cada uno con sus opciones
// a la vista (botones de grupo) en lugar de un botón que cambia sin decir a qué. Los usan el engrane del teléfono
// (SettingsMenu), el menú de la cuenta (AccountMenu) y la pantalla de «Mi perfil» del proyecto: un solo lugar para todos.
//
// Genérico del paquete: function (regla de la casa).
import {Fragment} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import {useColorScheme} from '@mui/material/styles';
import AutomaticModeIcon from '@mui/icons-material/BrightnessAutoOutlined';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';

import {LANGUAGES} from '@/ui/navigation/LanguageToggle.jsx';
import {useFontSize} from '@/ui/navigation/useFontSize.js';

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
    return (
        <Box sx={{px: 1, py: 0.5}}>
            <Typography variant="overline" color="text.secondary" component="p" sx={{px: 1, lineHeight: 1.6}}>{label}</Typography>
            <ToggleButtonGroup value={value} exclusive fullWidth size="small" aria-label={label}
                               onChange={(event, nextValue) => {
                                   // al picar la opción ya elegida MUI manda null: se queda la que estaba
                                   if (nextValue) {
                                       onChange(nextValue);
                                   }
                               }}>
                {options.map((option) => (
                    <ToggleButton key={option.value} value={option.value} sx={{gap: 0.75}}>{option.icon}{option.label}</ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
}

/**
 * @param {object} props
 * @param {boolean} [props.showFontSize] por omisión sí
 * @param {boolean} [props.showLanguage] por omisión sí
 * @param {boolean} [props.showColorScheme] por omisión sí
 */
export default function AppearanceSettings({showFontSize = true, showLanguage = true, showColorScheme = true}) {
    const {t, language, changeLanguage} = useToolkitTranslation('layout');
    const {level, setLevel, levels} = useFontSize();
    const {mode, setMode} = useColorScheme();

    const sections = [
        showFontSize && (
            <SettingSection key="fontSize" label={t('fontSize.label')} value={level} onChange={setLevel}
                            options={levels.map((option) => ({value: option.key, label: t(option.labelKey)}))} />
        ),
        showLanguage && (
            <SettingSection key="language" label={t('settings.language')} value={language} onChange={changeLanguage}
                            options={LANGUAGES.map((languageCode) => ({value: languageCode, label: t(`languageName.${languageCode}`)}))} />
        ),
        // antes de montar no se sabe el modo (el servidor no lo conoce): la sección sale ya montada.
        // Tres opciones: «Automático» (system de MUI) sigue lo que diga el equipo y es lo de omisión. Es la ÚNICA salida
        // para volver a seguirlo: el botón de la barra (ColorSchemeToggle) fija claro u oscuro para siempre. La guía de
        // Apple pide seguir el ajuste del equipo; el botón de la barra se queda con dos estados para no sumar una decisión.
        showColorScheme && mode && (
            <SettingSection key="colorScheme" label={t('settings.colorScheme')} value={mode} onChange={setMode}
                            options={[
                                {value: 'light', label: t('settings.light'), icon: <LightModeIcon fontSize="small" />},
                                {value: 'dark', label: t('settings.dark'), icon: <DarkModeIcon fontSize="small" />},
                                {value: 'system', label: t('settings.system'), icon: <AutomaticModeIcon fontSize="small" />},
                            ]} />
        ),
    ].filter(Boolean);

    return sections.map((section, index) => (
        <Fragment key={section.key}>
            {index > 0 && <Divider sx={{my: 0.5}} />}
            {section}
        </Fragment>
    ));
}
