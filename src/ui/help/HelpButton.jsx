// El botón «?» que vuelve a abrir la ayuda de una pantalla (la del carrusel o la que sea): un ícono con su nombre para el
// lector de pantalla y su globo al pasar el cursor.
//
// Genérico del paquete: function (regla de la casa).
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {object} props
 * @param {() => void} props.onClick
 * @param {string} [props.label] ya traducido; por omisión «Ayuda de esta pantalla»
 * @param {'small'|'medium'|'large'} [props.size]
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function HelpButton({onClick, label, size = 'medium', sx, texts, ...unknownProps}) {
    warnUnknownProps('HelpButton', unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    const text = label ?? t('help.button');
    return (
        <Tooltip title={text}>
            <IconButton aria-label={text} onClick={onClick} size={size} sx={sx}>
                <HelpOutlineRoundedIcon fontSize={size === 'small' ? 'small' : 'medium'} />
            </IconButton>
        </Tooltip>
    );
}
