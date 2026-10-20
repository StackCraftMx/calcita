// Los pasos para instalar la app a mano, según el equipo (iOS 26 cambió el camino; Firefox usa su propio menú). Lo usan la
// invitación (InstallPromptBanner) y la entrada del menú de la cuenta (InstallAppSetting): los dos abren el mismo diálogo.
// Si la variante no lleva pasos (el navegador tiene su propio diálogo, o no hay nada que ofrecer) no pinta nada.
//
// OJO, para quien lo monte: NO dentro de un Menu de MUI que se cierra; el Menu quita a sus hijos al cerrarse y el diálogo
// nunca aparecería. Va junto al Menu o en un lugar que se quede pintado.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaInstallInstructions con defaultProps y
// styleOverrides de sus partes: steps.
//
// Genérico del paquete: function (regla de la casa).
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {INSTALL_VARIANT} from '@/pwa/installInstructions.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaInstallInstructions)
const THEME_NAME = 'CalcitaInstallInstructions';
const InstructionsSteps = piecePart(THEME_NAME, 'Steps', Typography);

// cada variante con pasos a mano → su título y sus pasos en los textos del paquete (common:install.<variante>)
const STEPS_BY_VARIANT = Object.freeze({
    [INSTALL_VARIANT.iosModern]: ['step1', 'step2', 'step3', 'step4'],
    [INSTALL_VARIANT.iosClassic]: ['step1', 'step2', 'step3'],
    [INSTALL_VARIANT.androidFirefox]: ['step1', 'step2', 'step3'],
});

/**
 * ¿Esta variante se instala con pasos a mano (y no con el diálogo del navegador)?
 *
 * @param {string|null} variant
 * @returns {boolean}
 */
export function variantHasInstructions(variant) {
    return Boolean(STEPS_BY_VARIANT[variant]);
}

/**
 * @param {object} props
 * @param {string|null} props.variant una de INSTALL_VARIANT (useInstallPrompt)
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function InstallInstructionsDialog(props) {
    // lo que el proyecto puso en su tema (components.CalcitaInstallInstructions.defaultProps) y encima lo que llega aquí
    const {variant, open, onClose, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const steps = STEPS_BY_VARIANT[variant];
    if (!steps) {
        return null;
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{t(`install.${variant}.title`)}</DialogTitle>
            <DialogContent>
                {/* pasos numerados con palabras, sin dibujar los íconos del sistema: cambian entre versiones */}
                <InstructionsSteps component="ol" ownSx={{m: 0, pl: 3, display: 'grid', gap: 1.25}}>
                    {steps.map((step) => (
                        <Typography key={step} component="li" variant="body1">{t(`install.${variant}.${step}`)}</Typography>
                    ))}
                </InstructionsSteps>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={onClose}>{t('install.gotIt')}</Button>
            </DialogActions>
        </Dialog>
    );
}
