import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {GlassPanel, MetricCard, STACKCRAFT, TREND_DIRECTION, fixedBackgroundLayerOf, initialsOf, useToolkitTranslation} from '@stackcraftmx/calcita';
import {Money} from '@stackcraftmx/calcita/money';

const SAMPLE_PERSON = 'Ana Martínez';
// lo vendido en el mes, en centavos como lo manda el API (dato de mentira)
const MONTH_SALES_CENTS = 87082270;
const CARD_WIDTH = 320;
const METRIC_WIDTH = 220;
// el fondo de color detrás del panel de vidrio: algo que desenfocar, fijo a la ventana (también en el iPhone)
const GLASS_SCENE_BACKGROUND = `linear-gradient(135deg, ${STACKCRAFT.forge}, ${STACKCRAFT.slateNavy})`;
const GLASS_SCENE_HEIGHT = 140;
const GLASS_SCENE_RADIUS = 24;

const CardKinds = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Stack direction="row" spacing={3} useFlexGap sx={{flexWrap: 'wrap', alignItems: 'flex-start'}}>
            <Card sx={{width: CARD_WIDTH}}>
                <CardHeader avatar={<Avatar>{initialsOf(SAMPLE_PERSON)}</Avatar>} title={SAMPLE_PERSON} subheader={t('surfaces.card.subheader')}
                            action={<IconButton aria-label={t('samples.more')}><MoreVertIcon /></IconButton>} />
                <CardContent>
                    <Typography variant="body2" color="text.secondary">{t('surfaces.card.body')}</Typography>
                </CardContent>
                <CardActions>
                    <Button size="small">{t('samples.reply')}</Button>
                    <Button size="small" variant="contained">{t('samples.view')}</Button>
                </CardActions>
            </Card>
            {/* la tarjeta de una cifra del framework; el dinero con Money, sin decimales de punto flotante */}
            <Box sx={{width: METRIC_WIDTH}}>
                <MetricCard label={t('surfaces.card.metricLabel')} value={Money.fromMinorUnits(MONTH_SALES_CENTS).format()}
                            trend={{label: '+4.4 %', direction: TREND_DIRECTION.up, isGood: true}} />
            </Box>
            {/* lo que flota encima de algo (botones sobre un mapa): GlassPanel, de vidrio si el tema lo trae */}
            <Box sx={{
                width: CARD_WIDTH, height: GLASS_SCENE_HEIGHT, borderRadius: `${GLASS_SCENE_RADIUS}px`, p: 2, display: 'flex', alignItems: 'flex-end',
                ...fixedBackgroundLayerOf({backgroundImage: GLASS_SCENE_BACKGROUND}, {clipPath: `inset(0 round ${GLASS_SCENE_RADIUS}px)`}),
            }}>
                <GlassPanel sx={{p: 1.5}}>
                    <Typography variant="subtitle2">{t('surfaces.card.glassPanel')}</Typography>
                </GlassPanel>
            </Box>
        </Stack>
    );
};

export default CardKinds;
