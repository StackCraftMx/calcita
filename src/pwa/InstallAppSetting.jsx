// «Instalar la app» dentro del menú de la cuenta (accountSettings de AppLayout): para quien dijo «Ahora no» a la invitación
// y después sí la quiere. No respeta el «Ahora no» (aquí la persona la busca a propósito). Ya instalada o sin manera de
// instalar en ese equipo, no pinta nada.
//
// El diálogo de los pasos va aquí mismo: el menú de la cuenta se queda abierto mientras se ve, y al cerrarlo se regresa al
// menú.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaInstallAppSetting con defaultProps y
// styleOverrides de sus partes: root.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InstallMobileRoundedIcon from '@mui/icons-material/InstallMobileRounded';

import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {INSTALL_VARIANT} from '@/pwa/installInstructions.js';
import InstallInstructionsDialog from '@/pwa/InstallInstructionsDialog.jsx';
import {useInstallPrompt} from '@/pwa/useInstallPrompt.js';
import ComponentTexts from '@/toolkit/ComponentTexts.jsx';
import {piecePart} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaInstallAppSetting)
const THEME_NAME = 'CalcitaInstallAppSetting';
const InstallRoot = piecePart(THEME_NAME, 'Root', Box);

/**
 * @param {object} [props]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function InstallAppSetting({texts, ...unknownProps} = {}) {
    warnUnknownProps('InstallAppSetting', unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const {variant, promptInstall} = useInstallPrompt();
    const [stepsOpen, setStepsOpen] = useState(false);

    if (!variant) {
        return null;
    }

    const handleClick = () => {
        if (variant === INSTALL_VARIANT.native) {
            promptInstall();
        } else {
            setStepsOpen(true);
        }
    };

    return (
        <ComponentTexts namespace="common" texts={texts}>
            <InstallRoot ownSx={{px: 1, py: 0.5}}>
                <Button fullWidth variant="outlined" startIcon={<InstallMobileRoundedIcon />} onClick={handleClick}>
                    {t('install.menuLabel')}
                </Button>
                <InstallInstructionsDialog variant={variant} open={stepsOpen} onClose={() => setStepsOpen(false)} />
            </InstallRoot>
        </ComponentTexts>
    );
}
