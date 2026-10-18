// La tabla de servidor (ServerTable de /table): pagina, filtra y ordena en el SERVIDOR, con el total real y las opciones
// de cada filtro con su conteo (facetas). Filtros en el encabezado de cada columna, búsqueda arriba, accesos rápidos por
// estado, rango de fechas y chips de lo filtrado. Se copia cambiando las columnas y fetchPage (abajo, «Conectarla a su API»).
//
// Lo de abajo son tres pasos: 1) qué estados existen, 2) los filtros que existen y 3) la tabla con sus columnas. La tabla
// «Cómo se extiende» de la página trae todo lo demás que acepta. Resumen:
//   - la búsqueda arriba, en la barra de la app: `searchInBar` (sin usar se encoge a la lupa y se estira al picarla;
//     `collapseSearchInBar={false}` la deja siempre abierta). En el teléfono con cápsulas flota arriba con las demás.
//     Así la usa Tabla;
//   - su propio renglón de arriba con `header` (título, conteo y controles en uno), algo junto al conteo con `toolbarExtra`,
//     algo arriba de los accesos rápidos con `beforeQuickFilters`, y el pie con `footer`;
//   - cómo se pinta cada celda con las columnas (renderCell, valueFormatter) y cada renglón con getRowClassName;
//   - qué renglones se ven sin volver a consultar con isRowVisible, y la columna pegada con fixedColumn.
//   - «Ir a página N» junto al paginador con `showGoToPage` (por omisión escondido).
//   - fechas ya puestas como accesos rápidos («Hoy», «Últimos 7 días»…) y, al final de esa tira, el chip «Personalizado»
//     (DateRangeFilter). Son el MISMO filtro («cuándo»): elegir un periodo quita el rango y elegir un rango quita el
//     periodo (clears e isOverridden). El rango son dos filtros de texto, created_from y created_to, que viajan como
//     AAAA-MM-DD (día, no instante: el inicio y el fin del día los pone el servidor con la zona del negocio).
import {useMemo} from 'react';
import {DateRangeFilter, DictionaryText, StatusChip, dictionaryEntryOf, formatDate, formatNumber} from '@stackcraftmx/calcita';
import {FILTER_KINDS, ServerTable, buildChipConfig, facetColumn, textColumn} from '@stackcraftmx/calcita/table';

// 1. El estado como llega del API → su texto (dictionaries:orderStatus.<valor>) y su color
const ORDER_STATUS = {
    pending: dictionaryEntryOf('pending', 'orderStatus.pending', 'warning', {hasShortLabel: true}),
    paid: dictionaryEntryOf('paid', 'orderStatus.paid', 'default'),
    delivered: dictionaryEntryOf('delivered', 'orderStatus.delivered', 'success'),
    canceled: dictionaryEntryOf('canceled', 'orderStatus.canceled', 'error'),
};

// 2. Los periodos ya puestos. Los días los cuenta el SERVIDOR en la zona del negocio: «hoy» a las 8 de la noche en México
//    ya es mañana en UTC. Se traslapan (lo de hoy también es de los últimos 7 días): por eso «Todas» trae su propio total
const PERIOD: Record<string, string> = {today: 'Hoy', last_7_days: 'Últimos 7 días', last_30_days: 'Últimos 30 días', last_90_days: 'Últimos 90 días'};
const PERIOD_DAYS: Record<string, number> = {today: 0, last_7_days: 6, last_30_days: 29, last_90_days: 89};

// 3. Los filtros que existen, con qué valor empiezan y de qué tipo es cada uno. El periodo y el rango son de texto.
//    OJO: constantes de módulo. Un objeto nuevo en cada pintada reinicia el estado de la tabla
const FILTER_DEFAULTS = Object.freeze({contains: '', customer: '', status: [] as string[], period: '', created_from: '', created_to: ''});
const FILTER_KINDS_OF_TABLE = Object.freeze({
    contains: FILTER_KINDS.text, customer: FILTER_KINDS.text, status: FILTER_KINDS.multiSelect,
    period: FILTER_KINDS.text, created_from: FILTER_KINDS.text, created_to: FILTER_KINDS.text,
});

// ─── El servidor de mentira (en su proyecto NO va: fetchPage llama a su API) ───
interface OrderRow {
    id: number;
    number: string;
    customer: string;
    status: string;
    created: string;
    total: number;
}
interface TableRequest {
    filters?: {contains?: string, customer?: string, status?: string[], period?: string, created_from?: string, created_to?: string};
    sortOrders?: Array<{column: string, direction: 'asc' | 'desc'}>;
    page: number;
    pageSize: number;
}
const CUSTOMERS = ['Luis Herrera', 'Mónica Vega', 'Bruno Díaz', 'Irene Campos', 'Ana López'];
// el día de hace N días como AAAA-MM-DD, en la zona de este navegador (en su proyecto lo calcula el servidor)
const isoDateDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const STATUSES = Object.keys(ORDER_STATUS);
const ORDERS: OrderRow[] = Array.from({length: 57}, (_, index) => ({
    id: index + 1, number: `P-${2300 + index}`, customer: CUSTOMERS[index % CUSTOMERS.length], status: STATUSES[(index * 7) % STATUSES.length],
    // un pedido cada 3 días hacia atrás desde hoy
    created: isoDateDaysAgo(index * 3),
    total: 300 + ((index * 937) % 9000),
}));
const fetchOrdersPage = async ({filters = {}, sortOrders = [], page, pageSize}: TableRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const words = (filters.contains ?? '').toLowerCase();
    const byText = ORDERS.filter((order) => `${order.number} ${order.customer}`.toLowerCase().includes(words)
        && order.customer.toLowerCase().includes((filters.customer ?? '').toLowerCase()));
    // «cuándo»: el periodo o el rango (son el mismo filtro). AAAA-MM-DD se compara bien como texto; un lado vacío no limita
    const isInPeriod = (order: OrderRow, period: string) => order.created >= isoDateDaysAgo(PERIOD_DAYS[period]);
    const isWhen = (order: OrderRow) => (!filters.period || isInPeriod(order, filters.period))
        && (!filters.created_from || order.created >= filters.created_from)
        && (!filters.created_to || order.created <= filters.created_to);
    const isStatus = (order: OrderRow) => !filters.status?.length || filters.status.includes(order.status);
    // las opciones de un filtro se cuentan SIN ese filtro: así se ve cuántos habría al elegir otra
    const byStatus = byText.filter(isStatus);
    const facets = {
        status: STATUSES.map((value) => ({value, total: byText.filter((order) => isWhen(order) && order.status === value).length})),
        period: Object.keys(PERIOD).map((value) => ({value, total: byStatus.filter((order) => isInPeriod(order, value)).length})),
        // los periodos se traslapan: sumarlos mentiría, el servidor manda el total de «Todas»
        period_total: byStatus.length,
    };
    const rows = byStatus.filter(isWhen);
    const [sort] = sortOrders;
    if (sort) {
        const key = sort.column as keyof OrderRow;
        rows.sort((first, second) => String(first[key]).localeCompare(String(second[key]), 'es', {numeric: true}) * (sort.direction === 'asc' ? 1 : -1));
    }
    return {rows: rows.slice(page * pageSize, (page + 1) * pageSize), total: rows.length, facets};
};

// 4. La tabla: sus columnas, cómo pedir una página (fetchPage) y lo demás que se quiera (accesos rápidos, etiquetas…)
const OrdersTableDemo = () => {
    // con memoria: columnas nuevas en cada pintada harían que la tabla recalcule todas
    const columns = useMemo(() => [
        textColumn({field: 'number', label: 'Folio', width: 120}),
        textColumn({field: 'customer', label: 'Cliente', flex: 1, minWidth: 160}),
        textColumn({field: 'created', label: 'Fecha', filter: false, width: 130, valueFormatter: (value: string) => formatDate(value)}),
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

    // la fecha viaja como 2026-05-01 y el chip la dice como «1 may 2026» (format)
    const chipConfig = buildChipConfig({
        text: [
            {key: 'customer', label: 'Cliente'},
            {key: 'period', label: 'Cuándo', format: (value: string) => PERIOD[value] ?? value},
            {key: 'created_from', label: 'Desde', format: formatDate},
            {key: 'created_to', label: 'Hasta', format: formatDate},
        ],
        multiSelect: [{key: 'status', label: 'Estado'}],
    });
    const quickFilters = [{
        field: 'status', facetKey: 'status', caption: 'Por estado', allLabel: 'Todos', order: STATUSES,
        renderLabel: (value: string) => <DictionaryText dictionary={ORDER_STATUS} value={value} />,
    }, {
        field: 'period', caption: 'Cuándo', allLabel: 'Todas', order: Object.keys(PERIOD), allCountKey: 'period_total',
        renderLabel: (value: string) => PERIOD[value] ?? value,
        // un rango personalizado es el MISMO filtro: elegir un periodo lo quita, elegir un rango quita el periodo y, con rango
        // puesto, ningún periodo se enciende
        clears: {created_from: '', created_to: ''},
        isOverridden: (filters: Record<string, string>) => Boolean(filters.created_from || filters.created_to),
        renderExtra: ({filters, setFilters}: {filters: Record<string, string>, setFilters: (next: Record<string, string>) => void}) => (
            <DateRangeFilter from={filters.created_from} to={filters.created_to}
                             onChange={({from, to}) => setFilters({created_from: from, created_to: to, period: ''})} />
        ),
    }];

    return (
        <ServerTable fetchPage={fetchOrdersPage} queryKey="orders" columns={columns} filterDefaults={FILTER_DEFAULTS}
                     filterKinds={FILTER_KINDS_OF_TABLE} chipConfig={chipConfig} quickFilters={quickFilters}
                     searchPlaceholder="Buscar por folio o cliente" countLabel={(total) => `${formatNumber(total)} pedidos`}
                     emptyLabel="No hay pedidos con esos filtros" ariaLabel="Pedidos" fixedColumn="number" defaultPageSize={10} striped />
    );
};

export default OrdersTableDemo;
