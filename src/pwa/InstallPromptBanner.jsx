// La invitación a instalar la app, abajo al centro. Según el equipo (useInstallPrompt): con el diálogo del navegador, el
// botón «Instalar»; en iPhone, iPad y Firefox de Android, «Cómo instalar» abre los pasos (InstallInstructionsDialog).
// Ya instalada, sin manera de instalar o después de «Ahora no», no pinta nada; quien se arrepienta la encuentra en el menú
// de la cuenta (InstallAppSetting).
//
// Color de información, no de advertencia: instalar es una sugerencia, no un problema. En el teléfono con vidrio va encima
// de la barra de pestañas; sin ella, respeta la zona del gesto de inicio del iPhone.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InstallMobileRoundedIcon from '@mui/icons-material/InstallMobileRounded';

import {aboveMobileTabBarOf} from '@/appShell/shellSizes.js';
import {usesMobileTabBar} from '@/appShell/tabBarRule.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {INSTALL_VARIANT} from '@/pwa/installInstructions.js';
import InstallInstructionsDialog from '@/pwa/InstallInstructionsDialog.jsx';
import {useInstallPrompt} from '@/pwa/useInstallPrompt.js';

// lo que se separa de la barra de pestañas (px)
const TAB_BAR_GAP_PIXELS = 8;

/**
 * @param {object} [props]
 * @param {string} [props.message] ya traducido; por omisión el del paquete con el nombre de la app (appName de ToolkitProvider)
 */
export default function InstallPromptBanner({message}) {
    const {t} = useToolkitTranslation('common');
    const {variant, dismissed, promptInstall, dismiss} = useInstallPrompt();
    const [stepsOpen, setStepsOpen] = useState(false);

    // nada que ofrecer o ya dijo «Ahora no»
    if (!variant || dismissed) {
        return null;
    }

    const isNative = variant === INSTALL_VARIANT.native;

    const handleAction = () => {
        if (isNative) {
            promptInstall();
        } else {
            setStepsOpen(true);
        }
    };

    // si ya vio los pasos, no se le vuelven a ofrecer en cada visita
    const handleStepsClose = () => {
        setStepsOpen(false);
        dismiss();
    };

    return (
        <>
            <Snackbar open anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                      sx={(theme) => (usesMobileTabBar(theme)
                          ? aboveMobileTabBarOf(TAB_BAR_GAP_PIXELS)
                          : {mb: 'env(safe-area-inset-bottom)'})}>
                <Alert severity="info" icon={<InstallMobileRoundedIcon />} sx={{width: '100%', alignItems: 'center'}}
                       action={(
                           <>
                               <Button color="inherit" size="small" onClick={handleAction}>
                                   {isNative ? t('install.action') : t('install.howTo')}
                               </Button>
                               <IconButton size="small" color="inherit" aria-label={t('install.dismiss')} onClick={dismiss}>
                                   <CloseRoundedIcon fontSize="small" />
                               </IconButton>
                           </>
                       )}>
                    {message ?? t('install.banner')}
                </Alert>
            </Snackbar>
            <InstallInstructionsDialog variant={variant} open={stepsOpen} onClose={handleStepsClose} />
        </>
    );
}
