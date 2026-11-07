// SortableTable (@stackcraftmx/calcita/sortable) guardando al soltar: el orden en que se surten los pedidos de hoy. Arrastre
// un renglón por su asa, o enfóquela con Tab y use espacio, flechas y espacio. La función que guarda regresa una promesa: la
// tabla enseña el orden nuevo al instante y, si el servidor dice que no (aquí, el pedido que ya va en camino), el renglón
// regresa solo a su lugar.
import {useState} from 'react';
import {Tag, toastWarn} from '@stackcraftmx/calcita';
import {SortableTable} from '@stackcraftmx/calcita/sortable';

// 1. Los renglones: el orden del arreglo es el orden de surtido
interface PackingOrder {
    id: string;
    folio: string;
    customer: string;
    pieces: number;
    onTheWay: boolean;
}

const TODAY_ORDERS: PackingOrder[] = [
    {id: 'order-1043', folio: 'PED-1043', customer: 'Luis Herrera', pieces: 3, onTheWay: true},
    {id: 'order-1051', folio: 'PED-1051', customer: 'Ana Martínez', pieces: 12, onTheWay: false},
    {id: 'order-1052', folio: 'PED-1052', customer: 'Papelería del Centro', pieces: 40, onTheWay: false},
    {id: 'order-1058', folio: 'PED-1058', customer: 'Sofía Ramírez', pieces: 1, onTheWay: false},
];

// 2. Lo que haría su backend: guarda el orden nuevo y dice que no si el pedido que se movió ya salió
const savePackingOrder = (moved: PackingOrder, priorities: Array<{order_id: string, priority: number}>) => new Promise<typeof priorities>((resolve, reject) => {
    setTimeout(() => (moved.onTheWay ? reject(new Error('El pedido ya salió')) : resolve(priorities)), 400);
});

const PackingPriorityDemo = () => {
    const [orders, setOrders] = useState(TODAY_ORDERS);

    // 3. Al soltar: se guarda; si truena, el renglón regresa a donde estaba (la tabla lo hace sola)
    const reorder = async ({rows, rowId}: {rows: PackingOrder[], rowId: string | number}) => {
        const moved = orders.find((order) => order.id === rowId);
        if (!moved) {
            return;
        }
        try {
            await savePackingOrder(moved, rows.map((order, index) => ({order_id: order.id, priority: index + 1})));
        } catch (error) {
            toastWarn(`${moved.folio} ya va en camino: su lugar no cambia.`);
            throw error;
        }
        setOrders(rows);
    };

    return (
        <SortableTable<PackingOrder> rows={orders} onReorder={reorder} ariaLabel="Orden de surtido de hoy" getRowLabel={(order) => order.folio}
                                     sx={{maxWidth: 720}}
                                     columns={[
                                         {field: 'folio', headerName: 'Pedido', width: 120},
                                         {field: 'customer', headerName: 'Cliente', flex: 1, minWidth: 160},
                                         {field: 'pieces', headerName: 'Piezas', width: 90, align: 'right'},
                                         {field: 'onTheWay', headerName: 'Estado', width: 130,
                                             renderCell: (order) => <Tag label={order.onTheWay ? 'En camino' : 'Por surtir'} color={order.onTheWay ? 'info' : 'default'} />},
                                     ]} />
    );
};

export default PackingPriorityDemo;
