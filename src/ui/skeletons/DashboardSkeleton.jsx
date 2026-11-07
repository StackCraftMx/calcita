// El esqueleto de un tablero (uno embebido de un tercero, como Tableau o Power BI, o uno propio): su barra de filtros
// arriba, la gráfica grande a la izquierda y dos chicas a la derecha. Ocupa el alto que se le dé, para que el hueco del
// tablero ya tenga su tamaño desde el principio.
//
// Si el tablero tiene que seguir montado mientras carga (un iframe que empieza de cero si se desmonta), va encima con
// SkeletonOverlay en lugar de en su lugar. Sin texto a la vista; para el lector de pantalla, «Cargando».
//
// Se cambia desde el tema del proyecto: components.CalcitaDashboardSkeleton con defaultProps y styleOverrides de su parte
// root.
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaDashboardSkeleton)
const THEME_NAME = 'CalcitaDashboardSkeleton';
const DashboardSkeletonRoot = piecePart(THEME_NAME, 'Root', Stack);

// el alto si nadie dice (px): el de un tablero mediano
const DEFAULT_HEIGHT = 420;
// el alto de la barra de filtros de arriba (px)
const TOOLBAR_HEIGHT = 36;

/**
 * @param {object} props
 * @param {number|string} [props.height] el alto del tablero (px o cualquier medida de CSS, p. ej. '100%'); por omisión 420
 * @param {import('@mui/material').SxProps} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function DashboardSkeletonContent(props) {
    const {height = DEFAULT_HEIGHT, sx, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);

    return (
        <DashboardSkeletonRoot role="status" aria-label={t('skeleton.loading')} sx={sx} ownSx={{gap: 1.5, height, p: 2, boxSizing: 'border-box'}}>
            <Skeleton variant="rounded" height={TOOLBAR_HEIGHT} sx={{flexShrink: 0}} />
            <Box sx={{display: 'flex', gap: 1.5, flex: 1, minHeight: 0}}>
                <Skeleton variant="rounded" sx={{flex: 2, height: '100%'}} />
                <Stack sx={{flex: 1, gap: 1.5}}>
                    <Skeleton variant="rounded" sx={{flex: 1, height: 'auto'}} />
                    <Skeleton variant="rounded" sx={{flex: 1, height: 'auto'}} />
                </Stack>
            </Box>
        </DashboardSkeletonRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const DashboardSkeleton = withPieceSlots(DashboardSkeletonContent, THEME_NAME);
export default DashboardSkeleton;
