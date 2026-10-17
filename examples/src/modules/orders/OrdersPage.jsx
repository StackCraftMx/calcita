// Ejemplo de la tabla de servidor (ServerTable): la lista de pedidos.
//
// Lo que se ve aquí, y de dónde sale:
//   - filtros en el encabezado de cada columna: «contiene» en las de texto (textColumn) y de opciones en las de estado y
//     forma de pago (facetColumn), con las opciones y sus conteos que manda el servidor (facetas);
//   - la búsqueda de arriba (el filtro «contains»), los accesos rápidos por estado con el rango de fechas al final y los
//     chips de lo que está filtrado, que se quitan de a uno;
//   - el orden con clic en el encabezado y el icono de la última columna para abrir el detalle (no la fila entera);
//   - todo vive en la URL con el prefijo «orders»: se comparte por enlace y sobrevive a recargar.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo} from 'react';
import {useNavigate} from 'react-router';
import {
    DateRangeFilter, DictionaryText, PageHeading, StatusChip, formatDate, formatDateTime, formatNumber, labelOf, lookup, usePageName,
    useRememberListUrl, useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {FILTER_KINDS, ServerTable, buildChipConfig, detailColumn, facetColumn, textColumn} from '@stackcraftmx/calcita/table';
import {Money} from '@stackcraftmx/calcita/money';

import {ORDERS_TABLE_PREFIX, ORDER_STATUS} from '@/core';
import {PAYMENT_METHOD} from '@/modules/orders/orderDictionaries.js';
import {getOrdersPage} from '@/modules/orders/ordersApi.js';
import {ORDERS_LIST_KEY, orderDetailPathOf} from '@/modules/orders/ordersPaths.js';

// OJO: constantes de módulo. Un objeto nuevo en cada pintada reinicia el estado de la tabla (ServerTable arma con ellos
// cómo se lee la URL)
const ORDER_FILTER_DEFAULTS = Object.freeze({
    contains: '', number: '', customer_name: '', product_name: '', status: [], payment_method: [], created_from: '', created_to: '',
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
});
// los chips de estado salen siempre en este orden, aunque alguno tenga cero pedidos
const STATUS_CHIP_ORDER = Object.keys(ORDER_STATUS);

export const OrdersPage = () => {
    const {t} = useToolkitTranslation('orders');
    const navigate = useNavigate();
    // al salir, la lista anota su URL (con filtros): el «Regresar» del detalle vuelve aquí tal como estaba
    useRememberListUrl(ORDERS_LIST_KEY);
    // el «Regresar» de la página que sigue dice «Regresar a los pedidos»
    usePageName('orders:list.backLabel');

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

    // los chips llevan el texto ya traducido: por eso se arman aquí, con t
    const chipConfig = buildChipConfig({
        text: [
            {key: 'number', label: t('chips.number')},
            {key: 'customer_name', label: t('chips.customer')},
            {key: 'product_name', label: t('chips.product')},
            {key: 'created_from', label: t('chips.createdFrom'), format: formatDate},
            {key: 'created_to', label: t('chips.createdTo'), format: formatDate},
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
            <ServerTable
                fetchPage={getOrdersPage}
                queryKey="orders"
                prefix={ORDERS_TABLE_PREFIX}
                columns={columns}
                filterDefaults={ORDER_FILTER_DEFAULTS}
                filterKinds={ORDER_FILTER_KINDS}
                chipConfig={chipConfig}
                quickFilters={quickFilters}
                searchPlaceholder={t('search.placeholder')}
                countLabel={(total) => t('count', {count: total, total: formatNumber(total)})}
                emptyLabel={t('empty')}
                ariaLabel={t('list.ariaLabel')}
                fixedColumn="number"
                striped
            />
        </>
    );
};
