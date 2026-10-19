import Grid from '@mui/material/Grid';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import {MetricCard, TREND_DIRECTION, formatCurrency, formatNumber, useToolkitTranslation} from '@stackcraftmx/calcita';

// Las cifras del mes contra el anterior (de mentira). isGood dice si el cambio es bueno: que bajen los cancelados es bueno
// aunque la flecha vaya para abajo; el color va con eso, no con la dirección. Cada una con su ícono (icon), del color del tono.
const MonthlyMetrics = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Grid container spacing={3}>
            <Grid size={{xs: 12, sm: 4}}>
                <MetricCard label={t('charts.metrics.orders')} value={formatNumber(174)} icon={<ShoppingBagOutlinedIcon />}
                            trend={{label: '+10.1 %', direction: TREND_DIRECTION.up, isGood: true}} caption={t('charts.metrics.vsLastMonth')} />
            </Grid>
            <Grid size={{xs: 12, sm: 4}}>
                <MetricCard label={t('charts.metrics.canceled')} value={formatNumber(13)} tone="error" icon={<BlockOutlinedIcon />}
                            trend={{label: '−7.1 %', direction: TREND_DIRECTION.down, isGood: true}} caption={t('charts.metrics.vsLastMonth')} />
            </Grid>
            <Grid size={{xs: 12, sm: 4}}>
                <MetricCard label={t('charts.metrics.average')} value={formatCurrency(6403.11)} tone="success" icon={<PaymentsOutlinedIcon />}
                            trend={{label: '0.0 %', direction: TREND_DIRECTION.flat}} caption={t('charts.metrics.vsLastMonth')} />
            </Grid>
        </Grid>
    );
};

export default MonthlyMetrics;
