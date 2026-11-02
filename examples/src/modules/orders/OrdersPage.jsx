// Ejemplo de la tabla de servidor (ServerTable): la lista de pedidos.
//
// Lo que se ve aquí, y de dónde sale:
//   - filtros en el encabezado de cada columna: «contiene» en las de texto (textColumn) y de opciones en las de estado y
//     forma de pago (facetColumn), con las opciones y sus conteos que manda el servidor (facetas);
//   - la búsqueda de arriba (el filtro «contains»), los accesos rápidos por estado con el rango de fechas al final y los
//     chips de lo que está filtrado, que se quitan de a uno;
//   - el orden con clic en el encabezado y el icono de la última columna para abrir el detalle (no la fila entera);
//   - todo vive en la URL con el prefijo «orders»: se comparte por enlace y sobrevive a recargar;
//   - «Ir a la página N» (showGoToPage): la lista trae todas las páginas (con 10 por página, más de 100) y abre en la actual;
//   - elegir pedidos con su casilla y actuar sobre ellos (selectionActions): «Recordar pago» y, con el permiso
//     orders.cancel, «Cancelar» con motivo. Se conservan al cambiar de página; con toda la página elegida se ofrece «Elegir
//     los N que coinciden» y entonces al servidor le llegan los filtros. El servidor aplica sus reglas: cancela los que puede
//     y dice cuántos se quedaron como estaban. En el teléfono, dividido como iOS (selectionPhoneLayout split).
//
// Las piezas de la casa: useConfirmAction + ConfirmDialog (el motivo y el 409 del servidor salen dentro del diálogo),
// useCan (el permiso) y toastProblem (lo que contestó el servidor cuando algo no se pudo).
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router';
import TextField from '@mui/material/TextField';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import {
    ConfirmDialog, DateRangeFilter, DictionaryText, FILTER_FIELD_KIND, PageHeading, ROUTE_TABS_MODE, RouteTabs, useActiveRouteTab, StatusChip, filterDrawerChipsOf, formatDate, formatDateTime,
    formatNumber, labelOf, lookup, toastProblem, toastSuccess, useCan, useConfirmAction, usePageName, useRememberListUrl, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {
    FILTER_KINDS, SELECTION_PHONE_LAYOUT, ServerTable, ServerTableFilterDrawer, buildChipConfig, detailColumn, facetColumn, textColumn,
} from '@stackcraftmx/calcita/table';
import {Money} from '@stackcraftmx/calcita/money';

import {ORDERS_TABLE_PREFIX, ORDER_STATUS} from '@/core';
import {CANCELABLE_ORDER_STATUSES, CANCEL_REASON_MAX_LENGTH, PAYMENT_METHOD} from '@/modules/orders/orderDictionaries.js';
import {cancelOrders, getOrdersPage, sendPaymentRemindersTo} from '@/modules/orders/ordersApi.js';
import {OrdersCards} from '@/modules/orders/OrdersCards.jsx';
import {ORDERS_LIST_KEY, orderDetailPathOf} from '@/modules/orders/ordersPaths.js';

// las dos vistas de la lista, en la consulta (?view=cards): la liga se comparte y al recargar sigue en la misma
const ORDERS_VIEW = Object.freeze({table: 'table', cards: 'cards'});
const VIEW_PARAM = 'view';

// OJO: constantes de módulo. Un objeto nuevo en cada pintada reinicia el estado de la tabla (ServerTable arma con ellos
// cómo se lee la URL)
const ORDER_FILTER_DEFAULTS = Object.freeze({
    contains: '', number: '', customer_name: '', product_name: '', status: [], payment_method: [], created_from: '', created_to: '',
    // los del cajón de búsqueda que no están en otro lado: piezas desde y hasta, y el total con su operador
    quantity_min: '', quantity_max: '', total: '',
});
const ORDER_FILTER_KINDS = Object.freeze({
    contains: FILTER_KINDS.text,
    number: FILTER_KINDS.text,
    customer_name: FILTER_KINDS.text,
    product_name: FILTER_KINDS.text,
    status: FILTER_KINDS.multiSelect,
    payment_method: FILTER_KINDS.multiSelect,
    created_from: FILTER_KINDS.text,
    created_to: FILTER_KINDS.text,
    quantity_min: FILTER_KINDS.text,
    quantity_max: FILTER_KINDS.text,
    total: FILTER_KINDS.text,
});
// los chips de estado salen siempre en este orden, aunque alguno tenga cero pedidos
const STATUS_CHIP_ORDER = Object.keys(ORDER_STATUS);
// un pedido cancelado ya no se elige: no hay nada más que hacerle
const isOrderSelectable = (row) => row.status !== ORDER_STATUS.canceled.value;

export const OrdersPage = () => {
    const {t} = useToolkitTranslation('orders');
    const {t: commonT} = useToolkitTranslation('common');
    const viewTabs = [{value: ORDERS_VIEW.table, label: t('views.table')}, {value: ORDERS_VIEW.cards, label: t('views.cards')}];
    const view = useActiveRouteTab(viewTabs, {mode: ROUTE_TABS_MODE.query, paramName: VIEW_PARAM});
    const navigate = useNavigate();
    // al salir, la lista anota su URL (con filtros): el «Regresar» del detalle vuelve aquí tal como estaba
    useRememberListUrl(ORDERS_LIST_KEY);
    // el «Regresar» de la página que sigue dice «Regresar a los pedidos»
    usePageName('orders:list.backLabel');
    const canCancelOrders = useCan({ability: 'orders.cancel'});
    const [cancelReason, setCancelReason] = useState('');
    // lo que se va a cancelar, para el título del diálogo («¿Cancelar 5 pedidos?»)
    const [selectionToCancel, setSelectionToCancel] = useState(null);

    // cancelar en grupo se confirma con motivo; al salir bien, se quita la selección y se vuelve a pedir la página
    const bulkCancel = useConfirmAction({
        run: ({subject, details}) => cancelOrders(subject.selection, details.reason),
        onDone: (response, subject) => {
            toastSuccess(response.message);
            subject.helpers.clearSelection();
            subject.helpers.refresh();
        },
    });

    // las acciones de los pedidos elegidos. Cada una se apaga si ninguno de los elegidos le sirve (con «todos los que
    // coinciden» no se sabe: decide el servidor)
    const selectionActions = [
        {
            key: 'remind', label: t('selection.remind'), icon: <NotificationsActiveOutlinedIcon />,
            isDisabled: (selection) => !selection.isAllMatching && !selection.rows.some((row) => row.status === ORDER_STATUS.pending.value),
            onClick: async (selection, {clearSelection}) => {
                try {
                    const response = await sendPaymentRemindersTo(selection);
                    toastSuccess(response.message);
                    clearSelection();
                } catch (error) {
                    toastProblem(error);
                }
            },
        },
        // sin el permiso de cancelar, la acción ni aparece
        ...(canCancelOrders ? [{
            key: 'cancel', label: t('selection.cancel'), icon: <BlockOutlinedIcon />, color: 'error',
            isDisabled: (selection) => !selection.isAllMatching && !selection.rows.some((row) => CANCELABLE_ORDER_STATUSES.includes(row.status)),
            onClick: (selection, helpers) => {
                setCancelReason('');
                setSelectionToCancel(selection);
                bulkCancel.open({selection, helpers});
            },
        }] : []),
    ];
    // los textos de la barra de los elegidos dicen «pedidos» (texts de ServerTable, con la forma de `table`). t sin valores
    // deja el {{total}} para que lo llene la tabla
    const tableTexts = {selection: {count_one: t('selection.count_one'), count_other: t('selection.count_other')}};
    let bulkCancelTitle = '';
    if (selectionToCancel) {
        const total = formatNumber(selectionToCancel.count);
        bulkCancelTitle = selectionToCancel.isAllMatching
            ? t('bulkCancel.titleAllMatching', {total})
            : t('bulkCancel.title', {count: selectionToCancel.count, total});
    }

    // con memoria: columnas nuevas en cada pintada harían que el DataGrid recalcule todas sus columnas
    const columns = useMemo(() => [
        textColumn({field: 'number', label: t('columns.number'), width: 120}),
        textColumn({
            field: 'created_at', label: t('columns.createdAt'), filter: false, width: 175, valueFormatter: (value) => formatDateTime(value),
        }),
        textColumn({field: 'customer_name', label: t('columns.customer'), flex: 1, minWidth: 160}),
        textColumn({field: 'product_name', label: t('columns.product'), flex: 1, minWidth: 190}),
        facetColumn({
            field: 'status', label: t('columns.status'), width: 150,
            renderOption: (value) => <DictionaryText dictionary={ORDER_STATUS} value={value} />,
            renderCell: ({row}) => <StatusChip dictionary={ORDER_STATUS} value={row.status} short />,
        }),
        facetColumn({
            field: 'payment_method', label: t('columns.paymentMethod'), width: 160,
            renderOption: (value) => <DictionaryText dictionary={PAYMENT_METHOD} value={value} />,
            renderCell: ({row}) => <DictionaryText dictionary={PAYMENT_METHOD} value={row.payment_method} />,
        }),
        // el importe llega en texto ('4900.00') y se pinta con Money: sin pasar por decimales
        textColumn({
            field: 'total', label: t('columns.total'), filter: false, width: 140, align: 'right', headerAlign: 'right',
            valueFormatter: (value) => Money.fromString(value).format(),
        }),
        detailColumn({onOpen: (row) => navigate(orderDetailPathOf(row.id)), ariaLabelOf: (row) => t('columns.openDetail', {number: row.number})}),
    ], [t, navigate]);

    // el cajón de búsqueda (botón «Filtros»): edita los mismos filtros que las columnas, los chips y la tira de arriba, y
    // además piezas desde y hasta y el total con su operador. Se busca al picar «Buscar», no con cada tecla
    const drawerFields = [
        {name: 'status', label: t('drawer.status'), kind: FILTER_FIELD_KIND.multiSelect,
            options: STATUS_CHIP_ORDER.map((value) => ({value, label: labelOf(lookup(ORDER_STATUS, value), t)}))},
        {name: 'payment_method', label: t('drawer.paymentMethod'), kind: FILTER_FIELD_KIND.checkboxes,
            options: Object.keys(PAYMENT_METHOD).map((value) => ({value, label: labelOf(lookup(PAYMENT_METHOD, value), t)}))},
        {name: 'customer_name', label: t('drawer.customer'), kind: FILTER_FIELD_KIND.text, placeholder: t('drawer.customerPlaceholder')},
        {name: 'quantity', label: t('drawer.quantity'), kind: FILTER_FIELD_KIND.numberRange, suffix: t('drawer.piecesSuffix')},
        {name: 'created', label: t('drawer.created'), kind: FILTER_FIELD_KIND.dateRange, keys: {from: 'created_from', to: 'created_to'}},
        {name: 'total', label: t('drawer.total'), kind: FILTER_FIELD_KIND.comparison, prefix: '$', defaultOperator: 'gte'},
    ];
    // los chips de lo que solo pone el cajón (los demás ya tienen el suyo abajo)
    const drawerChips = filterDrawerChipsOf(drawerFields.filter((field) => ['quantity', 'total'].includes(field.name)), {t: commonT});

    // los chips llevan el texto ya traducido: por eso se arman aquí, con t
    const chipConfig = buildChipConfig({
        text: [
            {key: 'number', label: t('chips.number')},
            {key: 'customer_name', label: t('chips.customer')},
            {key: 'product_name', label: t('chips.product')},
            {key: 'created_from', label: t('chips.createdFrom'), format: formatDate},
            {key: 'created_to', label: t('chips.createdTo'), format: formatDate},
            ...drawerChips.text,
        ],
        multiSelect: [
            {key: 'status', label: t('chips.status'), itemLabel: (value) => labelOf(lookup(ORDER_STATUS, value), t)},
            {key: 'payment_method', label: t('chips.paymentMethod'), itemLabel: (value) => labelOf(lookup(PAYMENT_METHOD, value), t)},
        ],
    });

    const quickFilters = [{
        field: 'status',
        facetKey: 'status',
        caption: t('quickFilters.statusCaption'),
        allLabel: t('quickFilters.allStatuses'),
        order: STATUS_CHIP_ORDER,
        renderLabel: (value) => <DictionaryText dictionary={ORDER_STATUS} value={value} />,
        // el rango de fechas va al final de la misma tira: los dos deciden qué pedidos se ven
        renderExtra: ({filters, setFilters}) => (
            <DateRangeFilter from={filters.created_from} to={filters.created_to}
                             onChange={({from, to}) => setFilters({created_from: from, created_to: to})} />
        ),
    }];

    return (
        <>
            <PageHeading title={t('list.title')} description={t('list.subtitle')} />
            <RouteTabs ariaLabel={t('views.ariaLabel')} mode={ROUTE_TABS_MODE.query} paramName={VIEW_PARAM} tabs={viewTabs} sx={{mb: 2}} />
            {view === ORDERS_VIEW.cards ? <OrdersCards /> : (
            <ServerTable
                fetchPage={getOrdersPage}
                queryKey="orders"
                prefix={ORDERS_TABLE_PREFIX}
                columns={columns}
                filterDefaults={ORDER_FILTER_DEFAULTS}
                filterKinds={ORDER_FILTER_KINDS}
                chipConfig={chipConfig}
                quickFilters={quickFilters}
                // el botón «Filtros» con su cajón de búsqueda; sale de la derecha (anchor lo cambia)
                toolbarExtra={<ServerTableFilterDrawer fields={drawerFields} />}
                searchPlaceholder={t('search.placeholder')}
                // la búsqueda arriba, en la barra de la app (en el teléfono se queda aquí)
                searchInBar
                // «Ir a la página N»: con 10 por página son más de 100 páginas y la lista llega hasta la última
                showGoToPage
                countLabel={(total) => t('count', {count: total, total: formatNumber(total)})}
                emptyLabel={t('empty')}
                ariaLabel={t('list.ariaLabel')}
                fixedColumn="number"
                striped
                selectionActions={selectionActions}
                // en el teléfono, como iOS en modo de edición: el conteo arriba y las acciones abajo, donde llega el pulgar
                // (por omisión van todas arriba)
                selectionPhoneLayout={SELECTION_PHONE_LAYOUT.split}
                isRowSelectable={isOrderSelectable}
                texts={tableTexts}
            />
            )}
            <ConfirmDialog
                {...bulkCancel.dialogProps}
                title={bulkCancelTitle}
                description={t('bulkCancel.description')}
                confirmLabel={t('bulkCancel.confirm')}
                cancelLabel={t('bulkCancel.keep')}
                tone="error"
                // el motivo viaja como «details» hasta run, igual que en el detalle
                onConfirm={() => bulkCancel.confirm({reason: cancelReason.trim()})}
                isConfirmDisabled={!cancelReason.trim()}
            >
                <TextField
                    label={t('cancel.reasonLabel')}
                    helperText={t('cancel.reasonHelp')}
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    disabled={bulkCancel.isRunning}
                    slotProps={{htmlInput: {maxLength: CANCEL_REASON_MAX_LENGTH}}}
                    multiline
                    minRows={2}
                    fullWidth
                    autoFocus
                    sx={{mt: 2}}
                />
            </ConfirmDialog>
        </>
    );
};
