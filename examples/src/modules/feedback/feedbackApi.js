// Las llamadas del ejemplo de avisos al API (aquí, al servidor de mentira; con backend, a axios):
//   - el recordatorio de pago, que sale bien;
//   - cancelar un pedido ya entregado, que el servidor rechaza (409);
//   - un alta de cliente vacía, que el servidor rechaza con un error por campo (422) para el aviso de toastProblem.
export {SIMULATED_RESPONSES, createCustomer} from '@/fakeServer/customersServer.js';
export {cancelOrder, getPendingReminders, sendPendingReminders} from '@/fakeServer/ordersServer.js';
