// La tabla de servidor (ServerTable de /table): pagina, filtra y ordena en el SERVIDOR, con el total real y las opciones
// de cada filtro con su conteo (facetas). Filtros en el encabezado de cada columna, búsqueda arriba, accesos rápidos por
// estado y chips de lo filtrado. Se copia cambiando las columnas y fetchPage (abajo, «Conectarla a su API»).
//
// Cómo se extiende, sin tocar el framework:
//   - la búsqueda arriba, en la barra de la app: `searchInBar` (sin usar se encoge a la lupa y se estira al picarla;
//     `collapseSearchInBar={false}` la deja siempre abierta). En el teléfono con cápsulas flota arriba con las demás.
//     Así la usa Tabla;
//   - su propio renglón de arriba con `header` (título, conteo y controles en uno), algo junto al conteo con `toolbarExtra`,
//     algo arriba de los accesos rápidos con `beforeQuickFilters`, y el pie con `footer`;
//   - cómo se pinta cada celda con las columnas (renderCell, valueFormatter) y cada renglón con getRowClassName;
//   - qué renglones se ven sin volver a consultar con isRowVisible, y la columna pegada con fixedColumn.
//   - «Ir a página N» junto al paginador con `showGoToPage` (por omisión escondido).
import {useMemo} from 'react';
import {DictionaryText, StatusChip, dictionaryEntryOf, formatNumber} from '@stackcraftmx/calcita';
import {FILTER_KINDS, ServerTable, buildChipConfig, facetColumn, textColumn} from '@stackcraftmx/calcita/table';

// el estado como llega del API → su texto (dictionaries:orderStatus.<valor>) y su color
const ORDER_STATUS = {
    pending: dictionaryEntryOf('pending', 'orderStatus.pending', 'warning', {hasShortLabel: true}),
    paid: dictionaryEntryOf('paid', 'orderStatus.paid', 'default'),
    delivered: dictionaryEntryOf('delivered', 'orderStatus.delivered', 'success'),
    canceled: dictionaryEntryOf('canceled', 'orderStatus.canceled', 'error'),
};

// OJO: constantes de módulo. Un objeto nuevo en cada pintada reinicia el estado de la tabla
const FILTER_DEFAULTS = Object.freeze({contains: '', customer: '', status: [] as string[]});
const FILTER_KINDS_OF_TABLE = Object.freeze({contains: FILTER_KINDS.text, customer: FILTER_KINDS.text, status: FILTER_KINDS.multiSelect});

// ─── El servidor de mentira (en su proyecto NO va: fetchPage llama a su API) ───
interface OrderRow {
    id: number;
    number: string;
    customer: string;
    status: string;
    total: number;
}
interface TableRequest {
    filters?: {contains?: string, customer?: string, status?: string[]};
    sortOrders?: Array<{column: string, direction: 'asc' | 'desc'}>;
    page: number;
    pageSize: number;
}
const CUSTOMERS = ['Luis Herrera', 'Mónica Vega', 'Bruno Díaz', 'Irene Campos', 'Ana López'];
const STATUSES = Object.keys(ORDER_STATUS);
const ORDERS: OrderRow[] = Array.from({length: 57}, (_, index) => ({
    id: index + 1, number: `P-${2300 + index}`, customer: CUSTOMERS[index % CUSTOMERS.length], status: STATUSES[(index * 7) % STATUSES.length],
    total: 300 + ((index * 937) % 9000),
}));
const fetchOrdersPage = async ({filters = {}, sortOrders = [], page, pageSize}: TableRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const words = (filters.contains ?? '').toLowerCase();
    const byText = ORDERS.filter((order) => `${order.number} ${order.customer}`.toLowerCase().includes(words)
        && order.customer.toLowerCase().includes((filters.customer ?? '').toLowerCase()));
    // las opciones de un filtro se cuentan SIN ese filtro: así se ve cuántos habría al elegir otra
    const facets = {status: STATUSES.map((value) => ({value, total: byText.filter((order) => order.status === value).length}))};
    const rows = byText.filter((order) => !filters.status?.length || filters.status.includes(order.status));
    const [sort] = sortOrders;
    if (sort) {
        const key = sort.column as keyof OrderRow;
        rows.sort((first, second) => String(first[key]).localeCompare(String(second[key]), 'es', {numeric: true}) * (sort.direction === 'asc' ? 1 : -1));
    }
    return {rows: rows.slice(page * pageSize, (page + 1) * pageSize), total: rows.length, facets};
};

const OrdersTableDemo = () => {
    // con memoria: columnas nuevas en cada pintada harían que la tabla recalcule todas
    const columns = useMemo(() => [
        textColumn({field: 'number', label: 'Folio', width: 120}),
        textColumn({field: 'customer', label: 'Cliente', flex: 1, minWidth: 160}),
        facetColumn({
            field: 'status', label: 'Estado', width: 150,
            renderOption: (value: string) => <DictionaryText dictionary={ORDER_STATUS} value={value} />,
            renderCell: ({row}: {row: OrderRow}) => <StatusChip dictionary={ORDER_STATUS} value={row.status} short />,
        }),
        textColumn({
            field: 'total', label: 'Total', filter: false, width: 130, align: 'right', headerAlign: 'right',
            valueFormatter: (value: number) => `$${formatNumber(value)}`,
        }),
    ], []);

    const chipConfig = buildChipConfig({
        text: [{key: 'customer', label: 'Cliente'}],
        multiSelect: [{key: 'status', label: 'Estado'}],
    });
    const quickFilters = [{
        field: 'status', facetKey: 'status', caption: 'Por estado', allLabel: 'Todos', order: STATUSES,
        renderLabel: (value: string) => <DictionaryText dictionary={ORDER_STATUS} value={value} />,
    }];

    return (
        <ServerTable fetchPage={fetchOrdersPage} queryKey="orders" columns={columns} filterDefaults={FILTER_DEFAULTS}
                     filterKinds={FILTER_KINDS_OF_TABLE} chipConfig={chipConfig} quickFilters={quickFilters}
                     searchPlaceholder="Buscar por folio o cliente" countLabel={(total) => `${formatNumber(total)} pedidos`}
                     emptyLabel="No hay pedidos con esos filtros" ariaLabel="Pedidos" fixedColumn="number" defaultPageSize={10} striped />
    );
};

export default OrdersTableDemo;
