// Catálogo · gráficas: las del framework (/charts: ColumnChart y BarList; CalendarHeatmap y MetricCard en la puerta
// principal) con las reglas de la guía de Apple para gráficas (HIG «Charts» y «Charting data»):
//   - los datos al frente: rejilla y ejes tenues, que den contexto «without competing with the data»;
//   - una serie, un color y sin leyenda: el título ya dice qué es; el color no va solo (cada valor tiene su número);
//   - un título que dice qué se aprende de la gráfica antes de ver el detalle, con la unidad en el título («move units into a
//     title»);
//   - accesible para todos: la gráfica lleva su descripción y una vista de tabla («Make every chart accessible»);
//   - lo de una misma serie se ve igual en todos lados («Prefer consistency across multiple charts»).
// Con el vidrio del tema, el tooltip de la gráfica flota de vidrio.
//
// Cada sección pinta su ejemplo de demos/charts y lo enseña con «Ver código» (DemoSection); las dos gráficas van lado a
// lado como en un tablero.
//
// Lo renderiza la app: arrow (regla de la casa).
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import ActivityHeatmap from '@/modules/catalog/demos/charts/ActivityHeatmap.tsx';
import MonthlyMetrics from '@/modules/catalog/demos/charts/MonthlyMetrics.tsx';
import MonthlyOrdersChart from '@/modules/catalog/demos/charts/MonthlyOrdersChart.tsx';
import TopProductsChart from '@/modules/catalog/demos/charts/TopProductsChart.tsx';

export const ChartsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('charts.title')} description={t('charts.description')} />

            <DemoSection title={t('charts.metrics.title')}
                         Demo={MonthlyMetrics} loadSource={() => import('@/modules/catalog/demos/charts/MonthlyMetrics.tsx?demo-source')} />
            <Grid container spacing={3}>
                <Grid size={{xs: 12, md: 7}}>
                    <DemoSection title={t('charts.columns.title')}
                                 Demo={MonthlyOrdersChart} loadSource={() => import('@/modules/catalog/demos/charts/MonthlyOrdersChart.tsx?demo-source')} />
                </Grid>
                <Grid size={{xs: 12, md: 5}}>
                    <DemoSection title={t('charts.bars.title')}
                                 Demo={TopProductsChart} loadSource={() => import('@/modules/catalog/demos/charts/TopProductsChart.tsx?demo-source')} />
                </Grid>
            </Grid>
            <DemoSection title={t('charts.heatmap.title')}
                         Demo={ActivityHeatmap} loadSource={() => import('@/modules/catalog/demos/charts/ActivityHeatmap.tsx?demo-source')} />
        </Stack>
    );
};
