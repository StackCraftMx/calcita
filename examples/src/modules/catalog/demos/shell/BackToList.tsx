// Regresar a la lista como estaba: la lista anota su dirección con sus filtros al salir (useRememberListUrl) y el detalle
// regresa ahí con BackButton (si no hay nada anotado, a la lista sin filtros). usePageName pone el nombre del «Regresar a…».
import {BackButton, useRememberListUrl} from '@stackcraftmx/calcita';

const ORDERS_LIST_KEY = 'orders';

export const OrdersListMemory = () => {
    // en la pantalla de la lista
    useRememberListUrl(ORDERS_LIST_KEY);
    return null;
};

export const OrderDetailBack = () => <BackButton listKey={ORDERS_LIST_KEY} fallbackTo="/orders" label="Regresar a los pedidos" />;
