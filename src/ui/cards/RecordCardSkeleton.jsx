// El esqueleto de RecordCard mientras llega la lista: la misma forma (avatar, títulos, grupos de datos y dato principal),
// así la página no brinca cuando aparecen las tarjetas de verdad. Para un lector de pantalla dice «Cargando».
//
// Genérico del paquete: function (regla de la casa).
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import {sxListOf} from '@/theme/themePieces.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

/**
 * @param {object} props
 * @param {number} [props.groups] cuántos grupos de datos (como los de la tarjeta)
 * @param {number} [props.factsPerGroup]
 * @param {boolean} [props.withAvatar]
 * @param {boolean} [props.withHighlight]
 * @param {object} [props.sx]
 * @param {object} [props.texts] los textos que cambian, con la forma de `common` en los textos del paquete
 */
export default function RecordCardSkeleton({groups = 2, factsPerGroup = 3, withAvatar = true, withHighlight = true, sx, texts, ...unknownProps}) {
    warnUnknownProps('RecordCardSkeleton', unknownProps);
    const {t} = useToolkitTranslation('common', texts);
    return (
        <Paper variant="outlined" role="status" aria-label={t('recordCard.loading')} sx={[{p: {xs: 2, sm: 2.5}}, ...sxListOf(sx)]}>
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
        </Paper>
    );
}
