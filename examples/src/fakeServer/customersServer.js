// Lo que respondería el API de clientes al dar de alta uno: valida como lo haría el backend y contesta 201, 422 con el
// error de cada campo, o una falla.
//
// La validación de aquí es la que protege (la del formulario es para no gastar un viaje al servidor en lo obvio): por eso
// repite las reglas y además revisa lo que el navegador no puede saber, como que el correo ya esté registrado.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {Money} from '@stackcraftmx/calcita/money';

import {ApiError} from '@/fakeServer/ApiError.js';
import {MEXICAN_STATES} from '@/fakeServer/catalogsServer.js';
import {STORE_CURRENCY, fakeOrders} from '@/fakeServer/fakeOrders.js';
import {storeDateOf} from '@/fakeServer/storeCalendar.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

/** Los tipos de cliente: los códigos que viajan en el API. */
export const CUSTOMER_TYPES = Object.freeze({
    retail: 'retail',
    wholesale: 'wholesale',
});

/**
 * Cómo contesta el servidor de mentira el alta, para ver en pantalla cada camino:
 *   normal       aplica sus reglas (el correo repetido es un 422 en su campo);
 *   offline      no hay respuesta, como con la red caída (status 0): el mensaje lo pone el paquete;
 *   serverError  un 500 con su problema traducido: va al aviso de arriba del formulario.
 */
export const SIMULATED_RESPONSES = Object.freeze({
    normal: 'normal',
    offline: 'offline',
    serverError: 'serverError',
});

const HTTP_STATUS = Object.freeze({offline: 0, unprocessable: 422, serverError: 500});
const PHONE_DIGITS = /^\d{10}$/;
const SIMPLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// el límite de crédito más alto según el tipo de cliente (regla del negocio que solo conoce el servidor)
const MAX_CREDIT_LIMIT_BY_TYPE = Object.freeze({retail: '50000.00', wholesale: '500000.00'});
const STATE_CODES = new Set(MEXICAN_STATES.map((state) => state.code));

// los correos ya registrados: los de los clientes de los pedidos y los que se dan de alta en esta pantalla
const registeredEmails = new Set(fakeOrders.map((order) => order.customer_email));

/**
 * El error del límite de crédito, o null si está bien: el monto se compara con Money, al centavo.
 *
 * @param {{credit_limit?: string, customer_type: string}} customer
 * @returns {string|null}
 */
function creditLimitErrorOf(customer) {
    let creditLimit;
    try {
        creditLimit = Money.fromString(customer.credit_limit ?? '', {currency: STORE_CURRENCY});
    } catch {
        return serverTextOf('customers.creditLimitInvalid');
    }
    const maxCreditLimit = MAX_CREDIT_LIMIT_BY_TYPE[customer.customer_type];
    if (maxCreditLimit && creditLimit.isGreaterThan(Money.fromString(maxCreditLimit, {currency: STORE_CURRENCY}))) {
        const max = Money.fromString(maxCreditLimit, {currency: STORE_CURRENCY}).format();
        return serverTextOf(`customers.creditLimitTooHigh.${customer.customer_type}`, {max});
    }
    return null;
}

// los días en que la tienda entrega (las llaves que manda la pantalla)
const DELIVERY_DAYS = Object.freeze(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']);

/**
 * Los errores de cada campo, como los manda Laravel en un 422: {campo: ['mensaje']}.
 *
 * @param {{name: string, email: string, phone: string, customer_type: string, delivery_days?: string[], delivery_states?: string[]}} customer
 * @returns {Record<string, string[]>}
 */
function fieldErrorsOf(customer) {
    const errors = {};
    if (!customer.name?.trim()) {
        errors.name = [serverTextOf('customers.nameRequired')];
    }
    if (!SIMPLE_EMAIL.test(customer.email ?? '')) {
        errors.email = [serverTextOf('customers.emailInvalid')];
    } else if (registeredEmails.has(customer.email)) {
        errors.email = [serverTextOf('customers.emailTaken')];
    }
    if (!PHONE_DIGITS.test(customer.phone ?? '')) {
        errors.phone = [serverTextOf('customers.phoneInvalid')];
    }
    if (!Object.values(CUSTOMER_TYPES).includes(customer.customer_type)) {
        errors.customer_type = [serverTextOf('customers.typeInvalid')];
    }
    const creditLimitError = creditLimitErrorOf(customer);
    if (creditLimitError) {
        errors.credit_limit = [creditLimitError];
    }
    if (!STATE_CODES.has(customer.state)) {
        errors.state = [serverTextOf('customers.stateInvalid')];
    }
    // los días de entrega: al menos uno y de la semana de la tienda (lunes a sábado)
    if (!Array.isArray(customer.delivery_days) || customer.delivery_days.length === 0
        || customer.delivery_days.some((day) => !DELIVERY_DAYS.includes(day))) {
        errors.delivery_days = [serverTextOf('customers.deliveryDaysInvalid')];
    }
    // los estados de entrega son opcionales, pero los que vengan tienen que existir
    if ((customer.delivery_states ?? []).some((code) => !STATE_CODES.has(code))) {
        errors.delivery_states = [serverTextOf('customers.stateInvalid')];
    }
    // «cliente desde» es una fecha de calendario: se compara como texto AAAA-MM-DD contra el día de hoy de la tienda
    if (customer.customer_since && customer.customer_since > storeDateOf(new Date().toISOString())) {
        errors.customer_since = [serverTextOf('customers.sinceInFuture')];
    }
    return errors;
}

/**
 * POST /customers: da de alta un cliente.
 *
 * @param {{id: string, name: string, email: string, phone: string, customer_type: string}} customer el id es un UUID v7
 *     que arma la pantalla
 * @param {string} simulatedResponse uno de SIMULATED_RESPONSES
 * @returns {Promise<{message: string, info: {id: string}}>}
 */
export async function createCustomer(customer, simulatedResponse) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS * 2);

    if (simulatedResponse === SIMULATED_RESPONSES.offline) {
        // sin respuesta no hay problema que leer: el mensaje genérico lo traduce el paquete
        throw new ApiError({status: HTTP_STATUS.offline});
    }
    if (simulatedResponse === SIMULATED_RESPONSES.serverError) {
        throw new ApiError({
            status: HTTP_STATUS.serverError,
            problem: {
                status: HTTP_STATUS.serverError, code: 'customer_not_saved',
                title: serverTextOf('customers.saveFailedTitle'), detail: serverTextOf('customers.saveFailedDetail'),
            },
        });
    }

    const errors = fieldErrorsOf(customer);
    if (Object.keys(errors).length > 0) {
        throw new ApiError({
            status: HTTP_STATUS.unprocessable,
            problem: {
                status: HTTP_STATUS.unprocessable, code: 'validation_failed',
                title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors,
            },
        });
    }

    registeredEmails.add(customer.email);
    return {message: serverTextOf('customers.created', {name: customer.name.trim()}), info: {id: customer.id}};
}
