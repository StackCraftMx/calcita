// El esqueleto de RecordCard mientras llega la lista: la misma forma (avatar, títulos, grupos de datos y dato principal),
// así la página no brinca cuando aparecen las tarjetas de verdad. Para un lector de pantalla dice «Cargando».
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaRecordCardSkeleton con defaultProps (p. ej.
// {groups: 3}), styleOverrides de su parte root y slots/slotProps.
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import {piecePart, usePieceProps, withPieceSlots} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y su parte (theme.components.CalcitaRecordCardSkeleton)
const THEME_NAME = 'CalcitaRecordCardSkeleton';
const RecordCardSkeletonRoot = piecePart(THEME_NAME, 'Root', Paper);

/**
 * @param {object} props
 * @param {number} [props.groups] cuántos grupos de datos (como los de la tarjeta)
 * @param {number} [props.factsPerGroup]
 * @param {boolean} [props.withAvatar]
 * @param {boolean} [props.withHighlight]
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
function RecordCardSkeletonContent(props) {
    const {groups = 2, factsPerGroup = 3, withAvatar = true, withHighlight = true, sx, texts, ...unknownProps} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    return (
        <RecordCardSkeletonRoot variant="outlined" role="status" aria-label={t('recordCard.loading')} ownSx={{p: {xs: 2, sm: 2.5}}} sx={sx}>
            <Stack direction="row" sx={{gap: 1.5, alignItems: 'center'}}>
                {withAvatar && <Skeleton variant="circular" width={44} height={44} />}
                <Box sx={{flex: 1}}>
                    <Skeleton width="20%" />
                    <Skeleton width="45%" height={28} />
                </Box>
                <Skeleton variant="rounded" width={88} height={24} />
            </Stack>
            <Box sx={{mt: 2, display: 'grid', gap: 3, gridTemplateColumns: {xs: '1fr', md: `repeat(${groups}, 1fr)${withHighlight ? ' 140px' : ''}`}}}>
                {Array.from({length: groups}, (unused, groupIndex) => (
                    <Box key={groupIndex}>
                        {Array.from({length: factsPerGroup}, (unusedFact, factIndex) => <Skeleton key={factIndex} />)}
                    </Box>
                ))}
                {withHighlight && <Box><Skeleton width="60%" /><Skeleton height={36} /></Box>}
            </Box>
        </RecordCardSkeletonRoot>
    );
}

// lo que se exporta: la pieza con slots y slotProps para cambiar sus partes (themePieces.js)
const RecordCardSkeleton = withPieceSlots(RecordCardSkeletonContent, THEME_NAME);
export default RecordCardSkeleton;
