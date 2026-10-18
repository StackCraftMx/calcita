// Hecho en Calcita · encabezados y tarjetas: MetricCard, SectionCard, DefinitionList y CollapsibleSection vivos; los
// encabezados de página solo en código (uno vivo aquí cambiaría el título de esta misma página).
//
// Cada sección enseña su código en JS y TS para copiar (con «Ver código» las que tienen ejemplo vivo).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import CardsAndSections from '@/modules/catalog/demos/cards/CardsAndSections.tsx';

const loadCards = () => import('@/modules/catalog/demos/cards/CardsAndSections.tsx?demo-source');
const loadHeaders = () => import('@/modules/catalog/demos/cards/PageHeaders.tsx?demo-source');

export const HeadersAndCardsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('cards.title')} description={t('cards.description')} />
            <DemoSection title={t('cards.cards.title')} description={t('cards.cards.description')}
                         Demo={CardsAndSections} loadSource={loadCards} />
            <CodeSection title={t('cards.headers.title')} description={t('cards.headers.description')}
                         loadSource={loadHeaders} />
        </Stack>
    );
};
