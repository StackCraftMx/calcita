import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {useToolkitTranslation} from '@stackcraftmx/calcita';

// las sombras que se comparan (MUI va de 0 a 24)
const ELEVATIONS = [0, 1, 4, 8];
const CARD_WIDTH = 160;
const CARD_HEIGHT = 96;

// con «vidrio también en las tarjetas», la de borde lleva material esmerilado; las de sombra se quedan sólidas
const PaperElevations = () => {
    const {t} = useToolkitTranslation('catalog');
    const cardSx = {width: CARD_WIDTH, height: CARD_HEIGHT, p: 1.5};
    return (
        <Stack direction="row" spacing={2} useFlexGap sx={{flexWrap: 'wrap'}}>
            {ELEVATIONS.map((elevation) => (
                <Paper key={elevation} elevation={elevation} sx={cardSx}>
                    <Typography variant="caption" color="text.secondary">{t('surfaces.paper.elevation', {elevation})}</Typography>
                </Paper>
            ))}
            <Paper variant="outlined" sx={cardSx}>
                <Typography variant="caption" color="text.secondary">{t('variants.outlined')}</Typography>
            </Paper>
        </Stack>
    );
};

export default PaperElevations;
