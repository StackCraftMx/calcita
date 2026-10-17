// Los ajustes del teléfono (del marco de walk-ot): en la barra del teléfono no caben tres botones de configuración que
// casi no se usan, así que van juntos detrás de un engrane (AppearanceSettings: tamaño de letra, idioma y claro / oscuro).
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import AppearanceSettings from '@/appShell/AppearanceSettings.jsx';
import {barMenuPlacementOf} from '@/appShell/barMenuPlacement.js';

/**
 * @param {object} props
 * @param {boolean} [props.showFontSize]
 * @param {boolean} [props.showLanguage]
 * @param {boolean} [props.showColorScheme]
 * @param {import('react').ReactNode} [props.extraSettings] los ajustes del proyecto, debajo de los del paquete
 */
export default function SettingsMenu({showFontSize = true, showLanguage = true, showColorScheme = true, extraSettings}) {
    const {t} = useToolkitTranslation('layout');
    const [anchorElement, setAnchorElement] = useState(null);
    // hacia arriba si la barra está abajo (teléfono con vidrio)
    const placement = barMenuPlacementOf(anchorElement);

    return (
        <>
            <Tooltip title={t('settings.open')}>
                <IconButton size="small" aria-label={t('settings.open')} aria-haspopup="menu" onClick={(event) => setAnchorElement(event.currentTarget)}>
                    <SettingsOutlinedIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={() => setAnchorElement(null)}
                  anchorOrigin={placement.anchorOrigin} transformOrigin={placement.transformOrigin}
                  slotProps={{paper: {sx: {minWidth: 280, maxWidth: 360, py: 0.5, ...placement.gapSx}}}}>
                <AppearanceSettings showFontSize={showFontSize} showLanguage={showLanguage} showColorScheme={showColorScheme} />
                {extraSettings && <><Divider sx={{my: 0.5}} />{extraSettings}</>}
            </Menu>
        </>
    );
}
