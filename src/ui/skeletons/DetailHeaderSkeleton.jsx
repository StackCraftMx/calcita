// El esqueleto del encabezado de una ficha (DetailHeader) mientras llega el registro: el contexto chico arriba, el título
// con su insignia y, si la ficha los trae, el logotipo a la izquierda, los renglones de abajo del título y la tira de
// pestañas (RouteTabs). Con la misma forma, la página no brinca cuando llega lo de verdad.
//
// Para esperar información, no acciones (ver DefinitionListSkeleton). Sin texto a la vista; para el lector de pantalla,
// «Cargando».
//
// Se cambia desde el tema del proyecto: components.CalcitaDetailHeaderSkeleton con defaultProps y styleOverrides de su
// parte root.
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaDetailHeaderSkeleton)
const THEME_NAME = 'CalcitaDetailHeaderSkeleton';
const HeaderSkeletonRoot = piecePart(THEME_NAME, 'Root', Box);

// el logotipo de la ficha (px): el rectángulo de una marca, más ancho que alto
const MEDIA_SIZE = Object.freeze({width: 132, height: 64});
// los anchos de los renglones bajo el título y de las pestañas (px), que se van repitiendo para que no salgan iguales
const LINE_WIDTHS = Object.freeze(['30%', '38%', '26%']);
const TAB_WIDTHS = Object.freeze([128, 110, 136, 118, 104]);
// el alto de una pestaña (px): el de RouteTabs
const TAB_HEIGHT = 36;

/**
 * @param {object} props
 * @param {boolean} [props.eyebrow] el contexto chico arriba del título (como en DetailHeader); por omisión sí
 * @param {number} [props.badges] cuántas insignias al lado del título; por omisión 1
 * @param {boolean} [props.media] el logotipo a la izquierda; por omisión no
 * @param {number} [props.lines] cuántos renglones abajo del título; por omisión 0
 * @param {number} [props.tabs] cuántas pestañas abajo del encabezado; por omisión 0 (sin tira)
 * @param {import('@mui/material').SxProps} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function DetailHeaderSkeletonContent(props) {
    const {eyebrow = true, badges = 1, media = false, lines = 0, tabs = 0, sx, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);

    return (
        <HeaderSkeletonRoot role="status" aria-label={t('skeleton.loading')} sx={sx} ownSx={{mb: 2.5}}>
            <Box sx={{display: 'flex', gap: 2.5, alignItems: 'center'}}>
                {media && <Skeleton variant="rounded" width={MEDIA_SIZE.width} height={MEDIA_SIZE.height} sx={{flexShrink: 0}} />}
                <Box sx={{flex: 1, minWidth: 0}}>
                    {/* cada barra dentro de su Typography: mide lo mismo que el texto que va a llegar (subtitle1 y h5 de DetailHeader) */}
                    {eyebrow && <Typography component="div" variant="subtitle1"><Skeleton width="18%" /></Typography>}
                    <Stack direction="row" spacing={1.5} sx={{alignItems: 'center'}}>
                        <Typography component="div" variant="h5" sx={{flex: '0 1 45%'}}><Skeleton /></Typography>
                        {Array.from({length: badges}, (unused, position) => <Skeleton key={position} variant="rounded" width={88} height={24} />)}
                    </Stack>
                    {Array.from({length: lines}, (unused, position) => (
                        <Typography key={position} component="div" variant="body2"><Skeleton width={LINE_WIDTHS[position % LINE_WIDTHS.length]} /></Typography>
                    ))}
                </Box>
            </Box>
            {tabs > 0 && (
                <Stack direction="row" useFlexGap sx={{gap: 1, mt: 2, flexWrap: 'wrap'}}>
                    {Array.from({length: tabs}, (unused, position) => (
                        <Skeleton key={position} variant="rounded" width={TAB_WIDTHS[position % TAB_WIDTHS.length]} height={TAB_HEIGHT} />
                    ))}
                </Stack>
            )}
        </HeaderSkeletonRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const DetailHeaderSkeleton = withPieceSlots(DetailHeaderSkeletonContent, THEME_NAME);
export default DetailHeaderSkeleton;
