// El botón del tamaño de letra (normal, grande, muy grande), del tema de walk-ot: para quien lee con lentes o en una
// pantalla chica. Va en la barra de escritorio; en el teléfono vive en el menú de ajustes.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaFontSizeToggle con defaultProps y
// styleOverrides de sus partes: button.
//
// Genérico del paquete: function (regla de la casa).
import {useState} from 'react';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import FormatSizeIcon from '@mui/icons-material/FormatSize';

import {useFontSize} from '@/ui/navigation/useFontSize.js';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaFontSizeToggle)
const THEME_NAME = 'CalcitaFontSizeToggle';
const FontSizeButton = piecePart(THEME_NAME, 'Button', IconButton);

/**
 * @param {object} [props]
 * @param {'small'|'medium'} [props.size]
 * @param {(level: string) => void} [props.onChange] la persona eligió otro tamaño (FONT_SIZE_LEVELS; para guardarlo en su servidor)
 * @param {object} [props.texts] los textos que cambian, con la forma de `layout` en los textos del paquete
 */
export default function FontSizeToggle(props) {
    // lo que el proyecto puso en su tema (components.CalcitaFontSizeToggle.defaultProps) y encima lo que llega aquí
    const {size = 'small', onChange, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('layout', texts);
    const {level, setLevel, isMounted, levels} = useFontSize();
    const [anchorElement, setAnchorElement] = useState(null);

    // antes de montar no se sabe el nivel guardado: se reserva el lugar para que la barra no brinque
    if (!isMounted) {
        return <FontSizeButton size={size} disabled aria-hidden="true" ownSx={{width: 34, height: 34}} />;
    }

    const chooseLevel = (levelKey) => {
        setLevel(levelKey);
        setAnchorElement(null);
        onChange?.(levelKey);
    };

    return (
        <>
            <Tooltip title={t('fontSize.label')}>
                <IconButton size={size} aria-label={t('fontSize.label')} aria-haspopup="menu" onClick={(event) => setAnchorElement(event.currentTarget)}>
                    <FormatSizeIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorElement} open={Boolean(anchorElement)} onClose={() => setAnchorElement(null)}
                  slotProps={{paper: {sx: {minWidth: 200}}}}>
                {levels.map((option) => (
                    <MenuItem key={option.key} selected={option.key === level} onClick={() => chooseLevel(option.key)}>
                        <ListItemText primary={t(option.labelKey)} slotProps={{primary: {sx: {fontWeight: option.key === level ? 600 : 400}}}} />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
