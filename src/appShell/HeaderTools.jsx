// Lo de la derecha de la barra, igual en los dos estilos de barra (menú lateral o arriba):
//   - lo que el proyecto agregue (headerActions: un botón de «reporte urgente», un buscador…);
//   - la cuenta (AccountMenu), y DENTRO de su menú los ajustes de la app: tamaño de letra, idioma, claro u oscuro y los del
//     proyecto (accountSettings). Antes iban sueltos en la barra, cada uno con su botón: ocupaban lugar y en el menú lateral
//     encogido (que hace de barra) tapaban el menú (lo reportaron; el autor pidió «un solo menú como el de perfil»);
//   - sin sesión no hay cuenta: los ajustes van detrás del engrane (SettingsMenu).
// En columna (vertical) van abajo del menú lateral encogido con vidrio, que hace también de barra (AppLayout).
//
// Los botones toman el color de la barra (color: inherit): sobre la barra naranja de Stackcraft van claros, sobre una
// barra blanca van oscuros, sin que cada botón sepa de qué color es la barra.
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

import AccountMenu from '@/appShell/AccountMenu.jsx';
import SettingsMenu from '@/appShell/SettingsMenu.jsx';
import AppearanceSettings from '@/appShell/AppearanceSettings.jsx';

/**
 * @param {object} props
 * @param {import('react').ReactNode} [props.headerActions]
 * @param {boolean} props.showFontSizeToggle
 * @param {boolean} props.showLanguageToggle
 * @param {boolean} props.showColorSchemeToggle
 * @param {object|null} props.user
 * @param {string} [props.profilePath]
 * @param {object[]} [props.accountMenuItems]
 * @param {import('react').ReactNode} [props.accountSettings] los ajustes del proyecto, en el menú de la cuenta (SettingSection)
 * @param {boolean} [props.vertical] en columna, para el menú lateral encogido
 * @param {() => void} [props.onSignOut]
 * @param {boolean} [props.isSigningOut]
 */
export default function HeaderTools({
    headerActions, showFontSizeToggle, showLanguageToggle, showColorSchemeToggle, user, profilePath, accountMenuItems, onSignOut, isSigningOut,
    accountSettings, vertical = false,
}) {
    const hasAppearance = showFontSizeToggle || showLanguageToggle || showColorSchemeToggle;
    const settings = hasAppearance || accountSettings ? (
        <>
            <AppearanceSettings showFontSize={showFontSizeToggle} showLanguage={showLanguageToggle} showColorScheme={showColorSchemeToggle} />
            {hasAppearance && accountSettings && <Divider sx={{my: 0.5}} />}
            {accountSettings}
        </>
    ) : null;

    return (
        <Box sx={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: 0.5, flexShrink: 0, '& .MuiButtonBase-root': {color: 'inherit'}}}>
            {headerActions}
            {user ? (
                <AccountMenu user={user} profilePath={profilePath} accountMenuItems={accountMenuItems} onSignOut={onSignOut} isSigningOut={isSigningOut}
                             settings={settings} />
            ) : (settings || accountMenuItems?.length > 0) && (
                // sin sesión: el engrane con los ajustes y las ligas propias (en un sistema que ya existía, «Regresar» se perdía)
                <SettingsMenu showFontSize={showFontSizeToggle} showLanguage={showLanguageToggle} showColorScheme={showColorSchemeToggle}
                              extraSettings={accountSettings} menuLinks={accountMenuItems} />
            )}
        </Box>
    );
}
