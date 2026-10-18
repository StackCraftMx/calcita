// Catálogo · superficies y texto: Paper (con sombra y con borde), Card, las tarjetas del framework (MetricCard, GlassPanel),
// el acordeón, la barra (AppBar), las listas, la tabla de MUI (Table), los divisores y la escala de texto (Typography).
//
// Con el vidrio del tema (HIG de Apple, «Materials»): el contenido NO lleva el vidrio de los controles; con «También en las
// tarjetas» (glass: {surfaces: true}) lleva material, esmerilado y sin brillo de borde: Paper con borde, Card y el acordeón.
// Las de sombra se quedan sólidas. La barra sí es vidrio: es navegación.
//
// Cada sección pinta su ejemplo de demos/surfaces y lo enseña con «Ver código» (DemoSection).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import AccordionPanels from '@/modules/catalog/demos/surfaces/AccordionPanels.tsx';
import CardKinds from '@/modules/catalog/demos/surfaces/CardKinds.tsx';
import DividerKinds from '@/modules/catalog/demos/surfaces/DividerKinds.tsx';
import ListKinds from '@/modules/catalog/demos/surfaces/ListKinds.tsx';
import OrderTable from '@/modules/catalog/demos/surfaces/OrderTable.tsx';
import PaperElevations from '@/modules/catalog/demos/surfaces/PaperElevations.tsx';
import TopAppBar from '@/modules/catalog/demos/surfaces/TopAppBar.tsx';
import TypographyScale from '@/modules/catalog/demos/surfaces/TypographyScale.tsx';

export const SurfacesPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('surfaces.title')} description={t('surfaces.description')} />

            <DemoSection title={t('surfaces.paper.title')} description={t('surfaces.paper.description')}
                         Demo={PaperElevations} loadSource={() => import('@/modules/catalog/demos/surfaces/PaperElevations.tsx?demo-source')} />
            <DemoSection title={t('surfaces.card.title')} description={t('surfaces.card.description')}
                         Demo={CardKinds} loadSource={() => import('@/modules/catalog/demos/surfaces/CardKinds.tsx?demo-source')} />
            <DemoSection title={t('surfaces.accordion.title')} description={t('surfaces.accordion.description')}
                         Demo={AccordionPanels} loadSource={() => import('@/modules/catalog/demos/surfaces/AccordionPanels.tsx?demo-source')} />
            <DemoSection title={t('surfaces.appBar.title')} description={t('surfaces.appBar.description')}
                         Demo={TopAppBar} loadSource={() => import('@/modules/catalog/demos/surfaces/TopAppBar.tsx?demo-source')} />
            <DemoSection title={t('surfaces.lists.title')} description={t('surfaces.lists.description')}
                         Demo={ListKinds} loadSource={() => import('@/modules/catalog/demos/surfaces/ListKinds.tsx?demo-source')} />
            <DemoSection title={t('surfaces.table.title')} description={t('surfaces.table.description')}
                         Demo={OrderTable} loadSource={() => import('@/modules/catalog/demos/surfaces/OrderTable.tsx?demo-source')} />
            <DemoSection title={t('surfaces.dividers.title')} description={t('surfaces.dividers.description')}
                         Demo={DividerKinds} loadSource={() => import('@/modules/catalog/demos/surfaces/DividerKinds.tsx?demo-source')} />
            <DemoSection title={t('surfaces.typography.title')} description={t('surfaces.typography.description')}
                         Demo={TypographyScale} loadSource={() => import('@/modules/catalog/demos/surfaces/TypographyScale.tsx?demo-source')} />
        </Stack>
    );
};
