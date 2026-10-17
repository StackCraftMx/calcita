// Las llamadas del módulo de pedidos al API. Aquí iría axios; en los ejemplos van al servidor de mentira, con la misma
// forma: cada función recibe lo de la pantalla y regresa lo que regresaría el endpoint (o un ApiError).
//
// Las pantallas importan de aquí y no del servidor: el día que haya backend, solo cambia este archivo.
export {cancelOrder, getOrder, getOrderEvents, getOrderHistoryPage, getOrdersPage} from '@/fakeServer/ordersServer.js';
