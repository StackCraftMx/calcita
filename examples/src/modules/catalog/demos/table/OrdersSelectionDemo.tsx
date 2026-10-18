// Elegir renglones y actuar sobre ellos (selectionActions de ServerTable): cada renglón lleva su casilla y, al elegir, la barra
// de los elegidos ocupa el lugar del conteo con las acciones de la pantalla. En el teléfono con vidrio o minimalista va arriba,
// en la barra flotante: cuántos van con su ✕ y las acciones como íconos (selectionPhoneLayout="split": abajo, como iOS).
//   - Los elegidos se conservan al cambiar de página y se borran al cambiar un filtro (no se actúa sobre lo que ya no se ve).
//   - La casilla de arriba elige TODOS los que coinciden: la acción recibe los filtros (isAllMatching) y el servidor hace el
//     trabajo. El aviso deja quedarse «solo con esta página». allowSelectAllMatching={false}: la casilla elige la página.
//   - isRowSelectable dice cuáles se pueden elegir (aquí, los cancelados no).
//   - Los textos de la barra se cambian con `texts` (la forma de `table` en los textos del paquete).
import {useMemo, useState} from 'react';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import {ConfirmDialog, DictionaryText, StatusChip, dictionaryEntryOf, formatNumber, toastSuccess, useConfirmAction} from '@stackcraftmx/calcita';
import {FILTER_KINDS, ServerTable, facetColumn, textColumn} from '@stackcraftmx/calcita/table';
import type {RowSelection} from '@stackcraftmx/calcita/table';

// 1. El estado como llega del API → su texto y su color
const ORDER_STATUS = {
    pending: dictionaryEntryOf('pending', 'orderStatus.pending', 'warning', {hasShortLabel: true}),
    paid: dictionaryEntryOf('paid', 'orderStatus.paid', 'default'),
    delivered: dictionaryEntryOf('delivered', 'orderStatus.delivered', 'success'),
    canceled: dictionaryEntryOf('canceled', 'orderStatus.canceled', 'error'),
};
const FILTER_DEFAULTS = Object.freeze({contains: '', status: [] as string[]});
const FILTER_KINDS_OF_TABLE = Object.freeze({contains: FILTER_KINDS.text, status: FILTER_KINDS.multiSelect});

// ─── El servidor de mentira (en su proyecto NO va: son las llamadas de su *Api.js) ───
interface OrderRow {
    id: number;
    number: string;
    customer: string;
    status: string;
}
interface TableRequest {
    filters?: {contains?: string, status?: string[]};
    page: number;
    pageSize: number;
}
const CUSTOMERS = ['Luis Herrera', 'Mónica Vega', 'Bruno Díaz', 'Irene Campos', 'Ana López'];
const STATUSES = Object.keys(ORDER_STATUS);
let orders: OrderRow[] = Array.from({length: 57}, (_, index) => ({
    id: index + 1, number: `P-${2300 + index}`, customer: CUSTOMERS[index % CUSTOMERS.length], status: STATUSES[(index * 7) % STATUSES.length],
}));
const matchesFilters = (order: OrderRow, filters: TableRequest['filters'] = {}) => (
    `${order.number} ${order.customer}`.toLowerCase().includes((filters.contains ?? '').toLowerCase())
    && (!filters.status?.length || filters.status.includes(order.status))
);
const fetchOrdersPage = async ({filters = {}, page, pageSize}: TableRequest) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const byText = orders.filter((order) => matchesFilters(order, {contains: filters.contains}));
    const facets = {status: STATUSES.map((value) => ({value, total: byText.filter((order) => order.status === value).length}))};
    const rows = orders.filter((order) => matchesFilters(order, filters));
    return {rows: rows.slice(page * pageSize, (page + 1) * pageSize), total: rows.length, facets};
};
const ordersText = (count: number) => `${formatNumber(count)} ${count === 1 ? 'pedido' : 'pedidos'}`;
// con «todos los que coinciden» el servidor recibe los filtros; si no, los ids. Y aplica sus reglas: los cancelados no cambian
const targetsOf = (selection: RowSelection) => orders.filter((order) => order.status !== 'canceled'
    && (selection.isAllMatching ? matchesFilters(order, selection.filters) : selection.ids.includes(order.id)));
const markDelivered = async (selection: RowSelection) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const targets = targetsOf(selection);
    targets.forEach((order) => { order.status = 'delivered'; });
    return {message: `Se marcaron ${ordersText(targets.length)} como entregados.`};
};
const deleteOrders = async (selection: RowSelection) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const targets = new Set(targetsOf(selection));
    orders = orders.filter((order) => !targets.has(order));
    return {message: `Se borró: ${ordersText(targets.size)}.`};
};

// 2. Lo que necesita «Borrar» al confirmar: qué se eligió y cómo dejar la tabla al terminar
interface DeleteRequest {
    selection: RowSelection;
    helpers: {clearSelection: () => void, refresh: () => void};
}

const OrdersSelectionDemo = () => {
    const [deleteRequest, setDeleteRequest] = useState<DeleteRequest | null>(null);
    // 3. Borrar no se deshace: se confirma antes (useConfirmAction); al salir bien, se quita la selección y se vuelve a consultar
    const remove = useConfirmAction({
        run: ({subject}) => deleteOrders((subject as DeleteRequest).selection),
        onDone: (response, subject) => {
            toastSuccess((response as {message: string}).message);
            (subject as DeleteRequest).helpers.clearSelection();
            (subject as DeleteRequest).helpers.refresh();
        },
    });

    const columns = useMemo(() => [
        textColumn({field: 'number', label: 'Folio', width: 120}),
        textColumn({field: 'customer', label: 'Cliente', flex: 1, minWidth: 160}),
        facetColumn({
            field: 'status', label: 'Estado', width: 150,
            renderOption: (value: string) => <DictionaryText dictionary={ORDER_STATUS} value={value} />,
            renderCell: ({row}: {row: OrderRow}) => <StatusChip dictionary={ORDER_STATUS} value={row.status} short />,
        }),
    ], []);

    // 4. Las acciones de los elegidos: su texto, su ícono (en el teléfono se ve solo el ícono) y qué hacer
    const selectionActions = [{
        key: 'deliver', label: 'Marcar entregado', icon: <LocalShippingOutlinedIcon />,
        onClick: async (selection: RowSelection, {clearSelection, refresh}: DeleteRequest['helpers']) => {
            const response = await markDelivered(selection);
            toastSuccess(response.message);
            clearSelection();
            refresh();
        },
    }, {
        key: 'delete', label: 'Borrar', icon: <DeleteOutlineIcon />, color: 'error' as const,
        onClick: (selection: RowSelection, helpers: DeleteRequest['helpers']) => {
            const request = {selection, helpers};
            setDeleteRequest(request);
            remove.open(request);
        },
    }];

    const deleteText = deleteRequest ? ordersText(deleteRequest.selection.count) : '';

    return (
        <>
            {/* 5. La tabla: con selectionActions cada renglón lleva su casilla; isRowSelectable deja fuera a los cancelados */}
            <ServerTable fetchPage={fetchOrdersPage} queryKey="orders-selection" columns={columns} filterDefaults={FILTER_DEFAULTS}
                         filterKinds={FILTER_KINDS_OF_TABLE} countLabel={(total) => `${formatNumber(total)} pedidos`}
                         searchPlaceholder="Buscar por folio o cliente" ariaLabel="Pedidos para elegir" defaultPageSize={10}
                         fixedColumn="number" selectionActions={selectionActions}
                         isRowSelectable={(row: OrderRow) => row.status !== 'canceled'}
                         texts={{selection: {count_one: '{{total}} pedido elegido', count_other: '{{total}} pedidos elegidos'}}} />
            <ConfirmDialog {...remove.dialogProps} tone="error" title={`¿Borrar ${deleteText}?`}
                           description="Los pedidos borrados ya no se pueden recuperar." confirmLabel="Borrar" cancelLabel="Regresar" />
        </>
    );
};

export default OrdersSelectionDemo;
