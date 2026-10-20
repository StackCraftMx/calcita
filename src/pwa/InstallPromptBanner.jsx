// La invitación a instalar la app, abajo al centro. Según el equipo (useInstallPrompt): con el diálogo del navegador, el
// botón «Instalar»; en iPhone, iPad y Firefox de Android, «Cómo instalar» abre los pasos (InstallInstructionsDialog).
// Ya instalada, sin manera de instalar o después de «Ahora no», no pinta nada; quien se arrepienta la encuentra en el menú
// de la cuenta (InstallAppSetting).
//
// Color de información, no de advertencia: instalar es una sugerencia, no un problema. En el teléfono con vidrio va encima
// de la barra de pestañas; sin ella, respeta la zona del gesto de inicio del iPhone.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaInstallPromptBanner con defaultProps y
// styleOverrides de sus partes: root, alert.
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
import ComponentTexts from '@/toolkit/ComponentTexts.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaInstallPromptBanner)
const THEME_NAME = 'CalcitaInstallPromptBanner';
const PromptRoot = piecePart(THEME_NAME, 'Root', Snackbar);
const PromptAlert = piecePart(THEME_NAME, 'Alert', Alert);

// lo que se separa de la barra de pestañas (px)
const TAB_BAR_GAP_PIXELS = 8;

/**
 * @param {object} [props]
 * @param {string} [props.message] ya traducido; por omisión el del paquete con el nombre de la app (appName de ToolkitProvider)
 * @param {(outcome: 'accepted'|'dismissed'|null) => void} [props.onInstallChoice] lo que contestó la persona al diálogo de
 *     instalar del navegador (Chrome, Edge, Android)
 * @param {() => void} [props.onShowSteps] abrió los pasos para instalar (iPhone, iPad, Firefox de Android)
 * @param {() => void} [props.onDismiss] dijo «Ahora no» (o cerró los pasos): no se le vuelve a ofrecer en este navegador
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function InstallPromptBanner(props) {
    // lo que el proyecto puso en su tema (components.CalcitaInstallPromptBanner.defaultProps) y encima lo que llega aquí
    const {message, onInstallChoice, onShowSteps, onDismiss, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const {variant, dismissed, promptInstall, dismiss} = useInstallPrompt();
    const [stepsOpen, setStepsOpen] = useState(false);

    // nada que ofrecer o ya dijo «Ahora no»
    if (!variant || dismissed) {
        return null;
    }

    const isNative = variant === INSTALL_VARIANT.native;

    const handleAction = async () => {
        if (isNative) {
            onInstallChoice?.(await promptInstall());
        } else {
            setStepsOpen(true);
            onShowSteps?.();
        }
    };
    const handleDismiss = () => {
        dismiss();
        onDismiss?.();
    };

    // si ya vio los pasos, no se le vuelven a ofrecer en cada visita
    const handleStepsClose = () => {
        setStepsOpen(false);
        handleDismiss();
    };

    return (
        <ComponentTexts namespace="common" texts={texts}>
            <>
                <PromptRoot open anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                          ownSx={(theme) => (usesMobileTabBar(theme)
                              ? aboveMobileTabBarOf(TAB_BAR_GAP_PIXELS)
                              : {mb: 'env(safe-area-inset-bottom)'})}>
                    <PromptAlert severity="info" icon={<InstallMobileRoundedIcon />} ownSx={{width: '100%', alignItems: 'center'}}
                           action={(
                               <>
                                   <Button color="inherit" size="small" onClick={handleAction}>
                                       {isNative ? t('install.action') : t('install.howTo')}
                                   </Button>
                                   <IconButton size="small" color="inherit" aria-label={t('install.dismiss')} onClick={handleDismiss}>
                                       <CloseRoundedIcon fontSize="small" />
                                   </IconButton>
                               </>
                           )}>
                        {message ?? t('install.banner')}
                    </PromptAlert>
                </PromptRoot>
                <InstallInstructionsDialog variant={variant} open={stepsOpen} onClose={handleStepsClose} />
            </>
        </ComponentTexts>
    );
}
