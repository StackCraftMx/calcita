// Regresar a la lista como estaba. Si la persona filtró los pedidos, abrió uno y luego pica «Regresar», vuelve a SU lista
// filtrada, no a la lista vacía. Son dos piezas, una en cada pantalla, unidas por la misma llave.
import {BackButton, useRememberListUrl} from '@stackcraftmx/calcita';

// la llave que une la lista con su detalle
const ORDERS_LIST_KEY = 'orders';

// 1. En la pantalla de la LISTA: anota su dirección (con sus filtros) cada vez que la persona se va
export const OrdersListMemory = () => {
    useRememberListUrl(ORDERS_LIST_KEY);
    return null;
};

// 2. En la pantalla del DETALLE: el botón que regresa a lo anotado. Si no hay nada anotado (llegó por una liga), va a
// fallbackTo, la lista sin filtros
export const OrderDetailBack = () => <BackButton listKey={ORDERS_LIST_KEY} fallbackTo="/orders" label="Regresar a los pedidos" />;
