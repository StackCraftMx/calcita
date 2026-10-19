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
import {piecePart} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaFullPageLoader)
const THEME_NAME = 'CalcitaFullPageLoader';
const LoaderRoot = piecePart(THEME_NAME, 'Root', Box);

/**
 * @param {object} [props]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function FullPageLoader({texts} = {}) {
    const {t} = useToolkitTranslation('common', texts);

    return (
        <LoaderRoot role="status" aria-live="polite" ownSx={{display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: 'background.default'}}>
            <CircularProgress aria-label={t('status.loading')} />
        </LoaderRoot>
    );
}
