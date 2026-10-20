// Los ajustes sin sesión (del marco de walk-ot): tres botones de configuración que casi no se usan van juntos detrás de un
// engrane (AppearanceSettings: tamaño de letra, idioma y claro / oscuro), con los del proyecto y sus ligas (las de la cuenta:
// sin sesión siguen a la mano, como «Regresar al sistema»).
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaSettingsMenu con defaultProps y
// styleOverrides de sus partes: divider.
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
import MenuLinks from '@/appShell/MenuLinks.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaSettingsMenu)
const THEME_NAME = 'CalcitaSettingsMenu';
const SettingsDivider = piecePart(THEME_NAME, 'Divider', Divider);

/**
 * @param {object} props
 * @param {boolean} [props.showFontSize]
 * @param {boolean} [props.showLanguage]
 * @param {boolean} [props.showColorScheme]
 * @param {import('react').ReactNode} [props.extraSettings] los ajustes del proyecto, debajo de los del paquete
 * @param {object[]} [props.menuLinks] las ligas propias (accountMenuItems), al final
 */
export default function SettingsMenu(props) {
    // lo que el proyecto puso en su tema (components.CalcitaSettingsMenu.defaultProps) y encima lo que llega aquí
    const {showFontSize = true, showLanguage = true, showColorScheme = true, extraSettings, menuLinks = [], ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('layout');
    const [anchorElement, setAnchorElement] = useState(null);
    // hacia arriba si la barra está abajo (teléfono con vidrio)
    const placement = barMenuPlacementOf(anchorElement);
    const hasAppearance = showFontSize || showLanguage || showColorScheme;
    const closeMenu = () => setAnchorElement(null);

    return (
        <>
            <Tooltip title={t('settings.open')}>
                <IconButton size="small" aria-label={t('settings.open')} aria-haspopup="menu" onClick={(event) => setAnchorElement(event.currentTarget)}>
                    <SettingsOutlinedIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={closeMenu}
                  anchorOrigin={placement.anchorOrigin} transformOrigin={placement.transformOrigin}
                  slotProps={{paper: {sx: {minWidth: 280, maxWidth: 360, py: 0.5, ...placement.gapSx}}}}>
                {hasAppearance && <AppearanceSettings showFontSize={showFontSize} showLanguage={showLanguage} showColorScheme={showColorScheme} />}
                {extraSettings && <>{hasAppearance && <SettingsDivider ownSx={{my: 0.5}} />}{extraSettings}</>}
                {menuLinks.length > 0 && (hasAppearance || extraSettings) && <SettingsDivider ownSx={{my: 0.5}} />}
                <MenuLinks links={menuLinks} onClose={closeMenu} />
            </Menu>
        </>
    );
}
