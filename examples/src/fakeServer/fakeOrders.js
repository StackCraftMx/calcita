// La «base de datos» de la tienda de mentira: unos 1,400 pedidos del 5 de enero al 15 de octubre de 2026.
//
// Se arman SIEMPRE iguales (sin azar): el pedido 1001 es el mismo en cada recarga, así una explicación o una prueba
// que dice «el P-1001 ya se entregó» sigue siendo cierta. Nombres, correos y productos son inventados.
//
// Las reglas con que se arman, para que los números se entiendan:
//   - cuántos pedidos llegan al día depende del día de la semana (los domingos casi nada), cada quinto día hay más y
//     cada dos meses llega uno más al día (la tienda crece);
//   - el estado sale de la antigüedad: lo de los últimos días sigue pendiente o pagado, lo de la última semana y media
//     va en camino, lo de antes ya se entregó; uno de cada once pedidos se canceló;
//   - uno de cada cuatro entregados necesitó un segundo intento (la primera vez nadie recibió el paquete).
//
// Los cambios que hacen las pantallas (cancelar un pedido, dar de alta un cliente) viven en esta memoria: al recargar la
// página todo vuelve a como estaba.
//
// Funciones puras, sin React: function (regla de la casa).
import {Money} from '@stackcraftmx/calcita/money';

import {MILLISECONDS_PER_DAY, addHours, instantAtStoreTime, storeDateOf} from '@/fakeServer/storeCalendar.js';

/** La moneda de la tienda. Los importes viajan como texto con dos decimales ('2450.00'), como un NUMERIC de la base. */
export const STORE_CURRENCY = 'MXN';

/** Los estados de un pedido: los códigos que viajan en el API. */
export const ORDER_STATUSES = Object.freeze({
    pending: 'pending',
    paid: 'paid',
    shipped: 'shipped',
    delivered: 'delivered',
    canceled: 'canceled',
});

/** Cómo se pagó un pedido. */
export const PAYMENT_METHODS = Object.freeze({
    card: 'card',
    transfer: 'transfer',
    cash: 'cash',
});

/** Lo que le puede pasar a un pedido, en el orden en que suele pasar (su historial). */
export const ORDER_EVENTS = Object.freeze({
    created: 'created',
    paid: 'paid',
    packed: 'packed',
    outForDelivery: 'out_for_delivery',
    deliveryFailed: 'delivery_failed',
    delivered: 'delivered',
    canceled: 'canceled',
});

/** El primer y el último día con pedidos. */
export const FIRST_ORDER_DATE = '2026-01-05';
export const LAST_ORDER_DATE = '2026-10-15';

const FIRST_ORDER_NUMBER = 1001;

// cuántos pedidos llegan según el día de la semana (domingo primero, como getUTCDay)
const ORDERS_BY_WEEKDAY = [0, 3, 2, 3, 4, 5, 1];
// cada quinto día llegan estos de más (una promoción)
const PROMOTION_EVERY_DAYS = 5;
const PROMOTION_EXTRA_ORDERS = 2;
// la tienda crece: cada tantos días llega un pedido más al día (así la gráfica por mes no sale plana)
const GROWTH_EVERY_DAYS = 60;

// la antigüedad (en días) hasta la que un pedido sigue sin enviarse y hasta la que va en camino
const DAYS_UNTIL_SHIPPED = 4;
const DAYS_UNTIL_DELIVERED = 10;
const CANCELED_EVERY_ORDERS = 11;
const SECOND_ATTEMPT_EVERY_ORDERS = 4;
// las horas de la tienda en que llegan pedidos: de las 9 a las 18
const FIRST_ORDER_HOUR = 9;
const ORDER_HOURS = 10;
const MAXIMUM_QUANTITY = 4;

// cuántas horas después de creado pasa cada cosa (con pedidos de 9 a 18 h, la paquetería sale entre 7 y 16 h)
const HOURS_UNTIL = Object.freeze({
    paid: 1,
    canceled: 3,
    packed: 22,
    outForDelivery: 46,
    deliveryFailed: 52,
    secondOutForDelivery: 70,
    secondDelivered: 74,
    delivered: 52,
});

const WAREHOUSE = Object.freeze({id: 'warehouse-north', name: 'Almacén Norte'});
const CARRIER = Object.freeze({id: 'carrier-fast', name: 'Paquetería Rápida'});

const CUSTOMERS = [
    {name: 'Ana López', email: 'ana.lopez@ejemplo.com'},
    {name: 'Bruno Díaz', email: 'bruno.diaz@ejemplo.com'},
    {name: 'Carla Peña', email: 'carla.pena@ejemplo.com'},
    {name: 'Daniel Ortiz', email: 'daniel.ortiz@ejemplo.com'},
    {name: 'Elena Ruiz', email: 'elena.ruiz@ejemplo.com'},
    {name: 'Fernando Gil', email: 'fernando.gil@ejemplo.com'},
    {name: 'Gabriela Soto', email: 'gabriela.soto@ejemplo.com'},
    {name: 'Héctor Navarro', email: 'hector.navarro@ejemplo.com'},
    {name: 'Irene Campos', email: 'irene.campos@ejemplo.com'},
    {name: 'Jorge Méndez', email: 'jorge.mendez@ejemplo.com'},
    {name: 'Karla Ibáñez', email: 'karla.ibanez@ejemplo.com'},
    {name: 'Luis Herrera', email: 'luis.herrera@ejemplo.com'},
    {name: 'Mónica Vega', email: 'monica.vega@ejemplo.com'},
];

// popularity: de cada 20 pedidos, cuántos son de ese producto (así la gráfica por producto no sale pareja)
const PRODUCTS = [
    {name: 'Silla de oficina', price: '2450.00', popularity: 6},
    {name: 'Lámpara de escritorio', price: '689.90', popularity: 4},
    {name: 'Teclado inalámbrico', price: '899.45', popularity: 3},
    {name: 'Escritorio de madera', price: '5890.00', popularity: 2},
    {name: 'Monitor de 27 pulgadas', price: '6299.00', popularity: 2},
    {name: 'Pizarrón blanco', price: '1280.00', popularity: 2},
    {name: 'Archivero metálico', price: '3150.00', popularity: 1},
];
// cada producto aparece en la lista tantas veces como su popularidad; el de cada pedido se escoge de aquí
const PRODUCT_PICKS = PRODUCTS.flatMap((product) => Array.from({length: product.popularity}, () => product));

/**
 * El estado de un pedido según su antigüedad.
 *
 * @param {number} orderNumber
 * @param {number} daysOld días entre su creación y el último día con pedidos
 * @returns {string} uno de ORDER_STATUSES
 */
function statusOf(orderNumber, daysOld) {
    if (orderNumber % CANCELED_EVERY_ORDERS === 0) {
        return ORDER_STATUSES.canceled;
    }
    if (daysOld < DAYS_UNTIL_SHIPPED) {
        return orderNumber % 2 === 0 ? ORDER_STATUSES.pending : ORDER_STATUSES.paid;
    }
    if (daysOld < DAYS_UNTIL_DELIVERED) {
        return ORDER_STATUSES.shipped;
    }
    return ORDER_STATUSES.delivered;
}

/**
 * Un pedido, con los campos que regresa el API (snake_case, como un backend en Laravel).
 *
 * @param {number} orderNumber
 * @param {string} storeDate el día de la tienda en que se hizo
 * @param {number} daysOld
 * @returns {object}
 */
function orderOf(orderNumber, storeDate, daysOld) {
    const customer = CUSTOMERS[(orderNumber * 7) % CUSTOMERS.length];
    const product = PRODUCT_PICKS[(orderNumber * 3) % PRODUCT_PICKS.length];
    const quantity = 1 + (orderNumber % MAXIMUM_QUANTITY);
    const paymentMethods = Object.values(PAYMENT_METHODS);
    const status = statusOf(orderNumber, daysOld);
    const createdAt = instantAtStoreTime(storeDate, FIRST_ORDER_HOUR + ((orderNumber * 5) % ORDER_HOURS), (orderNumber * 17) % 60);

    return {
        id: orderNumber,
        number: `P-${orderNumber}`,
        customer_name: customer.name,
        customer_email: customer.email,
        product_name: product.name,
        quantity,
        // el importe se calcula con Money: precio por piezas, al centavo y sin pasar por decimales
        total: Money.fromString(product.price, {currency: STORE_CURRENCY}).times(quantity).amount(),
        payment_method: paymentMethods[orderNumber % paymentMethods.length],
        status,
        needs_second_attempt: status === ORDER_STATUSES.delivered && orderNumber % SECOND_ATTEMPT_EVERY_ORDERS === 0,
        created_at: createdAt,
        canceled_at: status === ORDER_STATUSES.canceled ? addHours(createdAt, HOURS_UNTIL.canceled) : null,
        // quién canceló y por qué: solo lo traen los que cancela una pantalla (los viejos los canceló el cliente)
        canceled_by: null,
        cancel_reason: null,
    };
}

/**
 * Todos los pedidos, del más viejo al más nuevo.
 *
 * @returns {object[]}
 */
function buildOrders() {
    const orders = [];
    const firstDay = new Date(`${FIRST_ORDER_DATE}T12:00:00Z`).getTime();
    const lastDay = new Date(`${LAST_ORDER_DATE}T12:00:00Z`).getTime();
    let orderNumber = FIRST_ORDER_NUMBER;

    for (let dayTime = firstDay, dayIndex = 0; dayTime <= lastDay; dayTime += MILLISECONDS_PER_DAY, dayIndex += 1) {
        const storeDate = storeDateOf(new Date(dayTime).toISOString());
        const weekday = new Date(dayTime).getUTCDay();
        const isPromotionDay = dayIndex % PROMOTION_EVERY_DAYS === 0;
        const growthOrders = Math.floor(dayIndex / GROWTH_EVERY_DAYS);
        const orderCount = ORDERS_BY_WEEKDAY[weekday] + (isPromotionDay ? PROMOTION_EXTRA_ORDERS : 0) + growthOrders;
        const daysOld = Math.round((lastDay - dayTime) / MILLISECONDS_PER_DAY);

        for (let position = 0; position < orderCount; position += 1) {
            orders.push(orderOf(orderNumber, storeDate, daysOld));
            orderNumber += 1;
        }
    }

    return orders;
}

/** La tabla de pedidos en memoria. OJO: las pantallas la cambian (cancelar); al recargar vuelve a armarse igual. */
export const fakeOrders = buildOrders();

/**
 * El historial de un pedido: qué le pasó, cuándo y quién lo hizo. Se arma de su estado; el número de intento de entrega
 * va en `attempt` (null en lo que no es de la entrega).
 *
 * @param {object} order un renglón de fakeOrders
 * @returns {Array<{id: string, event: string, occurred_at: string, actor: {id: string, name: string}|null, attempt: number|null, note_key: string|null}>}
 */
export function orderEventsOf(order) {
    const customerActor = {id: order.customer_email, name: order.customer_name};
    const eventAt = (hours) => addHours(order.created_at, hours);
    const events = [{event: ORDER_EVENTS.created, occurred_at: order.created_at, actor: customerActor, attempt: null}];

    if (order.status === ORDER_STATUSES.canceled) {
        events.push({
            event: ORDER_EVENTS.canceled,
            occurred_at: order.canceled_at,
            actor: order.canceled_by ?? customerActor,
            attempt: null,
            note_key: order.cancel_reason ? 'orders.notes.canceledByUser' : null,
        });
    }

    // a partir de aquí solo lo que sí siguió adelante; el pendiente se queda en «creado»
    const wasPaid = [ORDER_STATUSES.paid, ORDER_STATUSES.shipped, ORDER_STATUSES.delivered].includes(order.status);
    if (wasPaid) {
        // el pago lo confirma el banco: no hay una persona detrás (actor null = proceso automático)
        events.push({event: ORDER_EVENTS.paid, occurred_at: eventAt(HOURS_UNTIL.paid), actor: null, attempt: null});
    }

    const wasShipped = [ORDER_STATUSES.shipped, ORDER_STATUSES.delivered].includes(order.status);
    if (wasShipped) {
        events.push({event: ORDER_EVENTS.packed, occurred_at: eventAt(HOURS_UNTIL.packed), actor: WAREHOUSE, attempt: 1});
        events.push({event: ORDER_EVENTS.outForDelivery, occurred_at: eventAt(HOURS_UNTIL.outForDelivery), actor: CARRIER, attempt: 1});
    }

    if (order.status === ORDER_STATUSES.delivered && order.needs_second_attempt) {
        events.push({
            event: ORDER_EVENTS.deliveryFailed, occurred_at: eventAt(HOURS_UNTIL.deliveryFailed), actor: CARRIER, attempt: 1,
            note_key: 'orders.notes.nobodyHome',
        });
        events.push({event: ORDER_EVENTS.outForDelivery, occurred_at: eventAt(HOURS_UNTIL.secondOutForDelivery), actor: CARRIER, attempt: 2});
        events.push({event: ORDER_EVENTS.delivered, occurred_at: eventAt(HOURS_UNTIL.secondDelivered), actor: CARRIER, attempt: 2});
    } else if (order.status === ORDER_STATUSES.delivered) {
        events.push({event: ORDER_EVENTS.delivered, occurred_at: eventAt(HOURS_UNTIL.delivered), actor: CARRIER, attempt: 1});
    }

    // el id lo pone el servidor: el pedido y la posición del evento en su historial
    return events
        .sort((first, second) => first.occurred_at.localeCompare(second.occurred_at))
        .map((event, position) => ({note_key: null, ...event, id: `${order.id}-${position + 1}`}));
}
