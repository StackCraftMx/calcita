// Hecho en Calcita · listas que se ordenan (SortableTable y FormSortableField de /sortable): una tabla chica donde el orden de
// los renglones es el dato, guardando al soltar (con su regreso si el servidor dice que no) y en un formulario de formik.
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import FormikRouteDemo from '@/modules/catalog/demos/sortable/FormikRouteDemo.tsx';
import PackingPriorityDemo from '@/modules/catalog/demos/sortable/PackingPriorityDemo.tsx';

const loadSaveOnDrop = () => import('@/modules/catalog/demos/sortable/PackingPriorityDemo.tsx?demo-source');
const loadFormik = () => import('@/modules/catalog/demos/sortable/FormikRouteDemo.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogPageTexts
// (sortable.<sección>.extend.<id>)
const SAVE_ON_DROP_EXTENSIONS = [
    {id: 'columns', option: 'rows · columns', example: "columns={[{field: 'folio', headerName: 'Pedido', width: 120}, {field: 'customer', headerName: 'Cliente', flex: 1}]}"},
    {id: 'onReorder', option: 'onReorder', example: "onReorder={({rows}) => api.put('/packing', rows.map((order, index) => ({order_id: order.id, priority: index + 1})))}"},
    {id: 'rowIdentity', option: 'getRowId · getRowLabel', example: 'getRowId={(order) => order.folio} getRowLabel={(order) => order.customer}'},
    {id: 'renderCell', option: 'renderCell', example: "renderCell: (order, {position}) => <Tag label={order.status} />"},
    {id: 'position', option: 'showPosition · disabled', example: 'showPosition={false} disabled={!canEdit}'},
    {id: 'moveButtons', option: 'moveButtons', example: 'moveButtons={false}  // sin «Subir» ni «Bajar»'},
    {id: 'moveRow', option: 'moveRow', example: 'onClick={() => setRows(moveRow(rows, index, rows.length - 1))}  // «Mandar al final»'},
    {id: 'texts', option: 'texts', example: "texts={{position: 'Prioridad'}}"},
    {id: 'theme', option: 'theme.components.CalcitaSortableTable', example: "styleOverrides: {handle: {color: 'primary.main'}}"},
];
const FORMIK_EXTENSIONS = [
    {id: 'field', option: 'FormSortableField', example: '<FormSortableField name="stops" columns={columns} ariaLabel="Ruta de reparto" />'},
    {id: 'dirty', option: 'dirty · resetForm', example: '<Button onClick={() => resetForm()} disabled={!dirty}>Deshacer</Button>'},
    {id: 'rule', option: 'Yup.array().test', example: "Yup.array().test('firstStop', '…', (stops) => stops?.[0]?.city === 'Ciudad de México')"},
    {id: 'server', option: 'applyServerProblem', example: "errors: {stops: ['La primera parada tiene que estar en Ciudad de México.']}"},
    {id: 'payload', option: 'values.stops', example: 'values.stops.map((stop, index) => ({branch_id: stop.id, stop: index + 1}))'},
    {id: 'hookForm', option: 'Controller (react-hook-form)', example: '<Controller name="stops" render={({field}) => <SortableTable rows={field.value} onReorder={({rows}) => field.onChange(rows)} … />} />'},
];

export const SortablePage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `sortable.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('sortable.title')} description={t('sortable.description')} />
            <DemoSection title={t('sortable.saveOnDrop.title')} description={t('sortable.saveOnDrop.description')}
                         extensions={rowsOf('saveOnDrop', SAVE_ON_DROP_EXTENSIONS)} Demo={PackingPriorityDemo} loadSource={loadSaveOnDrop} />
            <DemoSection title={t('sortable.formik.title')} description={t('sortable.formik.description')}
                         extensions={rowsOf('formik', FORMIK_EXTENSIONS)} Demo={FormikRouteDemo} loadSource={loadFormik} />
        </Stack>
    );
};
