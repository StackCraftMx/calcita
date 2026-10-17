// El ajuste del estilo de los ejemplos: sin vidrio, vidrio (en lo que flota y en los controles, lo que pide la guía) o
// minimalista. Va dentro del menú de la cuenta junto a letra, idioma y claro u oscuro: es un ejemplo de accountSettings
// (lo que el proyecto agrega a ese menú sin tocar el framework), con la misma forma que los del paquete (SettingSection).
//
// Lo renderiza la app: arrow (regla de la casa).
import Typography from '@mui/material/Typography';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {SettingSection, useToolkitTranslation} from '@stackcraftmx/calcita';

import {GLASS_MODES} from '@/app/appTheme.js';
import {useAppThemeChoice} from '@/app/AppThemeProvider.jsx';

// en el menú, tres: sin vidrio, vidrio (en lo que flota) y minimalista. «Vidrio también en las tarjetas» no va aquí: es más
// pesado y contra la guía de Apple; queda en el configurador de tema, con su advertencia
const MENU_MODES = Object.freeze([GLASS_MODES.off, GLASS_MODES.floating, GLASS_MODES.minimal]);

export const GlassModeSetting = () => {
    const {t} = useToolkitTranslation('shell');
    const {glassMode, setGlassMode} = useAppThemeChoice();

    return (
        <>
            {/* con las tarjetas de vidrio (prendidas desde el configurador) se marca «Vidrio» y va la advertencia */}
            <SettingSection label={t('glass.label')} value={glassMode === GLASS_MODES.surfaces ? GLASS_MODES.floating : glassMode} onChange={setGlassMode}
                            options={MENU_MODES.map((mode) => ({value: mode, label: t(`glass.short.${mode}`)}))} />
            {glassMode === GLASS_MODES.surfaces && (
                <Typography variant="caption" color="text.secondary" component="p" role="status"
                            sx={{display: 'flex', gap: 0.75, alignItems: 'flex-start', px: 2, pb: 1, maxWidth: 320, whiteSpace: 'normal'}}>
                    <WarningAmberRoundedIcon fontSize="inherit" color="warning" sx={{mt: 0.25, flexShrink: 0}} />
                    {t('glass.surfacesWarning')}
                </Typography>
            )}
        </>
    );
};
