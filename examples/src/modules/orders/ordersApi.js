// Las llamadas del módulo de pedidos al API. Aquí iría axios; en los ejemplos van al servidor de mentira, con la misma
// forma: cada función recibe lo de la pantalla y regresa lo que regresaría el endpoint (o un ApiError).
//
// Las pantallas importan de aquí y no del servidor: el día que haya backend, solo cambia este archivo.
// Las acciones en grupo reciben la selección de la tabla: con un backend de verdad, aquí se manda {ids} o, con «todos los que
// coinciden», {filters} (toServerTableParams los deja como la query de la tabla):
//   api.post('/orders/cancel', selection.isAllMatching ? {filters: selection.filters, reason} : {ids: selection.ids, reason})
export {
    cancelOrder, cancelOrders, getOrder, getOrderEvents, getOrderHistoryPage, getOrdersPage, sendPaymentRemindersTo,
} from '@/fakeServer/ordersServer.js';
