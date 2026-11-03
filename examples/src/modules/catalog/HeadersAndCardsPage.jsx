// Hecho en Calcita · encabezados y tarjetas: MetricCard, SectionCard, DefinitionList y CollapsibleSection vivos; los
// encabezados de página solo en código (uno vivo aquí cambiaría el título de esta misma página).
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import CardsAndSections from '@/modules/catalog/demos/cards/CardsAndSections.tsx';
import RecordCards from '@/modules/catalog/demos/cards/RecordCards.tsx';

const loadCards = () => import('@/modules/catalog/demos/cards/CardsAndSections.tsx?demo-source');
const loadHeaders = () => import('@/modules/catalog/demos/cards/PageHeaders.tsx?demo-source');
const loadRecordCards = () => import('@/modules/catalog/demos/cards/RecordCards.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (cards.<sección>.extend.<id>)
const CARDS_EXTENSIONS = [
    {id: 'metric', option: '<MetricCard label value caption>', example: '<MetricCard label="Pedidos del mes" value={formatNumber(1382)} caption="contra septiembre" />'},
    {id: 'trend', option: 'trend', example: "trend={{label: '+12 %', direction: TREND_DIRECTION.up, isGood: true}}"},
    {id: 'tone', option: 'tone · valueColor', example: 'tone="warning"'},
    {id: 'metricLink', option: 'to', example: 'to="/orders?status=pending"'},
    {id: 'metricLoading', option: 'isLoading', example: 'isLoading={!summary}'},
    {id: 'section', option: '<SectionCard title action>', example: '<SectionCard title="Datos del pedido" action={<Button>Editar</Button>}>'},
    {id: 'definitions', option: '<DefinitionList entries layout labelWidth>', example: "<DefinitionList layout=\"stacked\" entries={[{label: 'Cliente', value: name}]} />"},
    {id: 'collapsible', option: '<CollapsibleSection collapsedTitle expandedTitle hint defaultExpanded>', example: '<CollapsibleSection collapsedTitle="Ver el detalle" expandedTitle="Ocultar el detalle">'},
];
const RECORD_CARD_EXTENSIONS = [
    {id: 'identity', option: 'eyebrow · title · subtitle · avatar', example: 'eyebrow={order.number} title={order.customer_name} avatar={order.customer_name}'},
    {id: 'status', option: 'status · actions · onOpen', example: 'status={<StatusChip … />} actions={[{key, label, onClick}]} onOpen={() => navigate(…)}'},
    {id: 'groups', option: 'groups[].facts · highlight', example: "groups={[{title: 'Importe', facts: [{label: 'IVA', value: iva}]}]} highlight={{label: 'Total', value: total}}"},
    {id: 'order', option: 'trailing · columns', example: "trailing={<StatusChip … />} columns=\"1fr 1fr 0.8fr 1fr auto\"  // el orden obligatorio, tal cual"},
    {id: 'menu', option: 'actions[].to · children · href · section · onClick(event)', example: "{key: 'open', label: 'Ver el pedido', to: `/orders/${order.id}`}  // Cmd+clic: otra pestaña"},
    {id: 'bottom', option: 'footer · details · onDetailsToggle', example: 'details={<Historial id={order.id} />}  // se monta al abrirlo'},
    {id: 'skeleton', option: '<RecordCardSkeleton>', example: '{isLoading && <RecordCardSkeleton groups={2} />}'},
    {id: 'theme', option: 'theme.components.CalcitaRecordCard', example: 'components: {CalcitaRecordCard: {styleOverrides: {highlight: {color: \'#0B5\'}}}}'},
];
const HEADERS_EXTENSIONS = [
    {id: 'heading', option: '<PageHeading title description>', example: '<PageHeading title="Pedidos" description="Todos los pedidos de la tienda." />'},
    {id: 'breadcrumbs', option: 'breadcrumbs', example: "breadcrumbs={[{label: 'Inicio', to: '/'}, {label: 'Pedidos'}]}"},
    {id: 'actions', option: 'actions', example: 'actions={<BarActionButton label="Agregar" icon={<AddIcon />} onClick={open} />}'},
    {id: 'documentTitle', option: 'documentTitle', example: 'documentTitle="Pedido P-2375"'},
    {id: 'cover', option: '<PageHeader eyebrow title subtitle action>', example: '<PageHeader eyebrow="Octubre" title="Buenos días, Ana" action={<Button>Nuevo</Button>} />'},
    {id: 'detail', option: '<DetailHeader eyebrow title badges actions>', example: '<DetailHeader title="P-2375" badges={<StatusChip … />} actions={…} />'},
];

export const HeadersAndCardsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `cards.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('cards.title')} description={t('cards.description')} />
            <DemoSection title={t('cards.cards.title')} description={t('cards.cards.description')}
                         extensions={rowsOf('cards', CARDS_EXTENSIONS)} Demo={CardsAndSections} loadSource={loadCards} />
            <CodeSection title={t('cards.headers.title')} description={t('cards.headers.description')}
                         extensions={rowsOf('headers', HEADERS_EXTENSIONS)} loadSource={loadHeaders} />
            <DemoSection title={t('cards.recordCards.title')} description={t('cards.recordCards.description')}
                         extensions={rowsOf('recordCards', RECORD_CARD_EXTENSIONS)} Demo={RecordCards} loadSource={loadRecordCards} />
        </Stack>
    );
};
