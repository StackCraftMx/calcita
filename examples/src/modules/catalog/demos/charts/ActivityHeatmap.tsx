import Box from '@mui/material/Box';
import {CalendarHeatmap, useToolkitTranslation} from '@stackcraftmx/calcita';

// seis meses de actividad; cada día con pedidos sale de una cuenta fija (sin azar) y los domingos van sin pedidos
const STARTS_ON = '2026-04-01';
const ENDS_ON = '2026-09-30';
const DAY_COUNT = 183;
const PATTERN_MODULO = 11;
const DAYS_PER_WEEK = 7;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const sampleActivityDays = () => {
    const firstDay = Date.parse(`${STARTS_ON}T00:00:00Z`);
    return Array.from({length: DAY_COUNT}, (unused, index) => ({
        date: new Date(firstDay + index * MILLISECONDS_PER_DAY).toISOString().slice(0, 10),
        value: index % DAYS_PER_WEEK === 4 ? 0 : (index * 7) % PATTERN_MODULO,
    })).filter((day) => day.value > 0);
};
const ACTIVITY_DAYS = sampleActivityDays();

// cada cuadro es un día y su tono dice cuánto; el resumen y la descripción lo dicen con palabras
const ActivityHeatmap = () => {
    const {t} = useToolkitTranslation('catalog');
    return (
        <Box sx={{overflowX: 'auto'}}>
            <CalendarHeatmap startsOn={STARTS_ON} endsOn={ENDS_ON} days={ACTIVITY_DAYS}
                             ariaLabel={t('charts.heatmap.ariaLabel')} valueLabel={t('charts.heatmap.value')}
                             describeValue={(value) => t('charts.heatmap.describe', {count: value})}
                             summary={t('charts.heatmap.summary', {days: ACTIVITY_DAYS.length})} />
        </Box>
    );
};

export default ActivityHeatmap;
