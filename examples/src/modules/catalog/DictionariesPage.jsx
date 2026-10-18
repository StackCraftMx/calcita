// Hecho en Calcita · diccionarios y etiquetas: un código del API → su texto, su explicación y su color, escrito una
// vez por catálogo (StatusChip, DictionaryText, labelOf) y las etiquetas (Tag).
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import OrderStatusDictionary from '@/modules/catalog/demos/dictionaries/OrderStatusDictionary.tsx';

const loadDemo = () => import('@/modules/catalog/demos/dictionaries/OrderStatusDictionary.tsx?demo-source');
const loadTexts = () => import('@/modules/catalog/demos/dictionaries/orderStatusTexts.ts?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (dictionaries.<sección>.extend.<id>)
const DEMO_EXTENSIONS = [
    {id: 'entry', option: 'dictionaryEntryOf(value, keyPrefix, color)', example: "paid: dictionaryEntryOf('paid', 'orderStatus.paid', 'success')"},
    {id: 'shortLabel', option: 'hasShortLabel', example: "dictionaryEntryOf('pending', 'orderStatus.pending', 'warning', {hasShortLabel: true})"},
    {id: 'variant', option: 'StatusChip variant', example: '<StatusChip dictionary={ORDER_STATUS} value={row.status} variant="chip" />'},
    {id: 'short', option: 'short', example: '<StatusChip … short />'},
    {id: 'suffix', option: 'suffix', example: '<StatusChip … suffix={formatNumber(13)} />'},
    {id: 'tooltip', option: 'tooltip', example: '<StatusChip … tooltip={`Venció el ${dueDate}`} />'},
    {id: 'chipSx', option: 'sx', example: "<StatusChip … variant=\"chip\" sx={{fontWeight: 600}} />"},
    {id: 'inline', option: '<DictionaryText>', example: '<DictionaryText dictionary={ORDER_STATUS} value="shipped" />'},
    {id: 'plainText', option: 'labelOf(lookup(dictionary, value), t)', example: "labelOf(lookup(ORDER_STATUS, 'delivered'), t)"},
    {id: 'tag', option: '<Tag label color tooltip variant>', example: '<Tag label="Mayoreo" color="info" tooltip="Compra por caja" />'},
];
const TEXTS_EXTENSIONS = [
    {id: 'label', option: 'label', example: "pending: {label: 'Pendiente de pago'}"},
    {id: 'shortLabelText', option: 'shortLabel', example: "shortLabel: 'Pendiente'"},
    {id: 'tooltipText', option: 'tooltip', example: "tooltip: 'El cliente todavía no paga.'"},
    {id: 'namespace', option: 'dictionaries', example: 'es: {dictionaries: {orderStatus: {…}}}'},
];

export const DictionariesPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `dictionaries.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('dictionaries.title')} description={t('dictionaries.description')} />
            <DemoSection title={t('dictionaries.demo.title')} description={t('dictionaries.demo.description')}
                         extensions={rowsOf('demo', DEMO_EXTENSIONS)} Demo={OrderStatusDictionary} loadSource={loadDemo} />
            <CodeSection title={t('dictionaries.texts.title')} description={t('dictionaries.texts.description')}
                         extensions={rowsOf('texts', TEXTS_EXTENSIONS)} loadSource={loadTexts} />
        </Stack>
    );
};
