// Interruptor de modo claro / oscuro.
//
// Dos estados visibles, no tres: el primer clic fija una preferencia explícita que ya se recuerda; para volver a seguir
// al equipo está «Automático» en Apariencia (AppearanceSettings, en el menú de la cuenta). Recordar lo hace MUI:
// setMode escribe en localStorage (con las llaves que el proyecto puso en su ThemeProvider) y un script
// en el HTML la puede leer antes del primer pintado.
//
// Va en la cinta de escritorio, en el cajón del teléfono y en el inicio de sesión.
//
// El tooltip sale de i18n.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaColorSchemeToggle con defaultProps y
// styleOverrides de sus partes: button.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {useColorScheme} from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';

import {nextColorModeOf} from '@/ui/navigation/colorMode.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaColorSchemeToggle)
const THEME_NAME = 'CalcitaColorSchemeToggle';
const SchemeButton = piecePart(THEME_NAME, 'Button', IconButton);

/**
 * @param {object} [props]
 * @param {'small'|'medium'} [props.size]
 * @param {boolean} [props.inverted] ícono blanco para fondos oscuros
 * @param {(mode: 'light'|'dark'|'system') => void} [props.onChange] la persona cambió el modo (para guardarlo en su servidor)
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function ColorSchemeToggle(props) {
    // lo que el proyecto puso en su tema (components.CalcitaColorSchemeToggle.defaultProps) y encima lo que llega aquí
    const {size = 'small', inverted = false, onChange, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('common', texts);
    const {mode, systemMode, setMode} = useColorScheme();

    // antes de montar en el cliente mode viene undefined: reservamos el lugar para que la barra no brinque
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    if (!isMounted || !mode) {
        return <SchemeButton size={size} disabled aria-hidden="true" ownSx={{width: 34, height: 34}} />;
    }

    const nextMode = nextColorModeOf(mode, systemMode);
    const label = t(`colorScheme.switchTo.${nextMode}`);

    return (
        <Tooltip title={label}>
            <SchemeButton size={size} aria-label={label} onClick={() => {
                            setMode(nextMode);
                            onChange?.(nextMode);
                        }}
                        ownSx={{color: inverted ? 'common.white' : 'text.secondary'}}>
                {nextMode === 'light' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </SchemeButton>
        </Tooltip>
    );
}
