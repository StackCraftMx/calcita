// Indicador de carga a pantalla completa, mientras se sabe si hay sesión.
// Sin él, el formulario de login parpadea medio segundo antes de que aparezca la pantalla de quien ya entró.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaFullPageLoader con defaultProps y
// styleOverrides de sus partes: root.
//
// Genérico del paquete: function (regla de la casa).
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import {piecePart, withPieceSlots} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaFullPageLoader)
const THEME_NAME = 'CalcitaFullPageLoader';
const LoaderRoot = piecePart(THEME_NAME, 'Root', Box);

/**
 * @param {object} [props]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 * @param {import('@mui/material').SxProps<import('@mui/material').Theme>} [props.sx] los estilos de esta pantalla, encima de los del tema (en su parte root)
 */
function FullPageLoaderContent({texts, sx, ...unknownProps} = {}) {
    warnUnknownProps('FullPageLoader', unknownProps);
    const {t} = useToolkitTranslation('common', texts);

    return (
        <LoaderRoot sx={sx} role="status" aria-live="polite" ownSx={{display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: 'background.default'}}>
            <CircularProgress aria-label={t('status.loading')} />
        </LoaderRoot>
    );
}

const FullPageLoader = withPieceSlots(FullPageLoaderContent, THEME_NAME);
export default FullPageLoader;
