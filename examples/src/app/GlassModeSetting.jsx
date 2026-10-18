// El ajuste del estilo de los ejemplos: sin vidrio, vidrio (en lo que flota y en los controles, lo que pide la guía) o
// minimalista; y, con vidrio o minimalista, cómo va la barra de arriba (en cápsulas, la de omisión, o la franja). Va
// dentro del menú de la cuenta junto a letra, idioma y claro u oscuro: es un ejemplo de accountSettings (lo que el
// proyecto agrega a ese menú sin tocar el framework), con la misma forma que los del paquete (SettingSection).
//
// Lo renderiza la app: arrow (regla de la casa).
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {SettingSection, TOP_BAR, useToolkitTranslation} from '@stackcraftmx/calcita';

import {GLASS_MODES} from '@/app/appTheme.js';
import {useAppThemeChoice} from '@/app/AppThemeProvider.jsx';

// en el menú, tres: sin vidrio, vidrio (en lo que flota) y minimalista. «Vidrio también en las tarjetas» no va aquí: es más
// pesado y contra la guía de Apple; queda en el configurador de tema, con su advertencia
const MENU_MODES = Object.freeze([GLASS_MODES.off, GLASS_MODES.floating, GLASS_MODES.minimal]);
// la barra: primero la de omisión
const BAR_OPTIONS = Object.freeze([TOP_BAR.capsules, TOP_BAR.band]);

export const GlassModeSetting = () => {
    const {t} = useToolkitTranslation('shell');
    const {glassMode, setGlassMode, themeChoices, setThemeChoices} = useAppThemeChoice();
    // la barra cambia con vidrio y con el minimalista; sin vidrio se queda la barra de siempre
    const hasBarChoice = glassMode !== GLASS_MODES.off;

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
            {hasBarChoice && (
                <>
                    <Divider sx={{my: 0.5}} />
                    {/* lo mismo que «Barra de arriba» del configurador de tema: los dos cambian el mismo ajuste */}
                    <SettingSection label={t('glass.bar.label')} value={themeChoices?.bar ?? TOP_BAR.capsules}
                                    onChange={(nextBar) => setThemeChoices((current) => ({...current, bar: nextBar}))}
                                    options={BAR_OPTIONS.map((bar) => ({value: bar, label: t(`glass.bar.${bar}`)}))} />
                </>
            )}
        </>
    );
};
