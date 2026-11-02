// Lo que respondería el API de las condiciones de un cliente (GET y PUT /customers/{id}/terms): su límite de crédito, cómo
// se reparte entre sucursales, los descuentos por volumen y sus contactos. Son las listas de renglones del ejemplo de
// FormRepeatingFields.
//
// El servidor vuelve a revisar todo lo que revisa la pantalla (sin repetidos, en orden, que el reparto no pase del límite)
// y además lo que solo él sabe: un correo que ya usa otro cliente. Cada error va con la ruta del renglón
// ('contacts.2.email'), como Laravel, y la pantalla lo pinta en ese renglón.
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {Money} from '@stackcraftmx/calcita/money';

import {ApiError} from '@/fakeServer/ApiError.js';
import {STORE_CURRENCY} from '@/fakeServer/fakeOrders.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

const HTTP_STATUS = Object.freeze({unprocessable: 422});
// los correos que ya son de otros clientes (en el sistema de verdad, una consulta)
const EMAILS_OF_OTHER_CUSTOMERS = Object.freeze(['compras@otrocliente.mx', 'pagos@otrocliente.mx']);
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let nextRowNumber = 100;

// lo que está guardado, en la memoria de esta pestaña: cada renglón guardado lleva su id
let storedTerms = {
    credit_limit: '200000',
    branch_split: [
        {id: 'split-1', branch_id: 'cdmx-centro', amount: '120000'},
        {id: 'split-2', branch_id: 'gdl-chapultepec', amount: '50000'},
    ],
    volume_discounts: [
        {id: 'discount-1', min_amount: '10000', discount_percent: '2'},
        {id: 'discount-2', min_amount: '50000', discount_percent: '5'},
    ],
    contacts: [
        {id: 'contact-1', name: 'Ana Martínez Ruiz', email: 'ana.martinez@example.com', is_main: true},
        {id: 'contact-2', name: 'Luis Herrera', email: 'luis.herrera@example.com', is_main: false},
    ],
};

const moneyOrNull = (text) => {
    try {
        return Money.fromString(String(text ?? ''), {currency: STORE_CURRENCY});
    } catch {
        return null;
    }
};

/**
 * Los errores de cada campo, con la ruta del renglón como los manda Laravel.
 *
 * @param {object} terms
 * @returns {Record<string, string[]>}
 */
function fieldErrorsOf(terms) {
    const errors = {};
    const add = (path, message) => {
        errors[path] = [...(errors[path] ?? []), message];
    };
    const creditLimit = moneyOrNull(terms.credit_limit);
    if (!creditLimit || creditLimit.isZeroOrLess()) {
        add('credit_limit', serverTextOf('customerTerms.creditLimitRequired'));
    }

    // el reparto: cada sucursal una vez y entre todas no pasan del límite
    const seenBranches = new Set();
    let splitTotal = Money.zero({currency: STORE_CURRENCY});
    (terms.branch_split ?? []).forEach((row, index) => {
        if (seenBranches.has(row.branch_id)) {
            add(`branch_split.${index}.branch_id`, serverTextOf('customerTerms.branchRepeated'));
        }
        seenBranches.add(row.branch_id);
        const amount = moneyOrNull(row.amount);
        if (amount) {
            splitTotal = splitTotal.plus(amount);
        }
    });
    if (creditLimit && splitTotal.isGreaterThan(creditLimit)) {
        add('branch_split', serverTextOf('customerTerms.splitTooHigh', {total: splitTotal.format(), max: creditLimit.format()}));
    }

    // los descuentos: de menor a mayor compra, y más compra, más descuento
    (terms.volume_discounts ?? []).forEach((row, index, rows) => {
        const previous = rows[index - 1];
        if (previous && Number(row.min_amount) <= Number(previous.min_amount)) {
            add(`volume_discounts.${index}.min_amount`, serverTextOf('customerTerms.discountsOrder'));
        }
        if (previous && Number(row.discount_percent) <= Number(previous.discount_percent)) {
            add(`volume_discounts.${index}.discount_percent`, serverTextOf('customerTerms.discountsOrder'));
        }
    });

    // los contactos: uno principal, correos bien escritos y que no sean de otro cliente
    const contacts = terms.contacts ?? [];
    if (contacts.filter((contact) => contact.is_main).length !== 1) {
        add('contacts', serverTextOf('customerTerms.oneMainContact'));
    }
    contacts.forEach((contact, index) => {
        const email = String(contact.email ?? '').trim().toLowerCase();
        if (!EMAIL_SHAPE.test(email)) {
            add(`contacts.${index}.email`, serverTextOf('customerTerms.emailInvalid'));
        } else if (EMAILS_OF_OTHER_CUSTOMERS.includes(email)) {
            add(`contacts.${index}.email`, serverTextOf('customerTerms.emailTaken'));
        }
    });
    return errors;
}

/**
 * GET /customers/{id}/terms
 *
 * @returns {Promise<object>}
 */
export async function getCustomerTerms() {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    return structuredClone(storedTerms);
}

/**
 * PUT /customers/{id}/terms: guarda todo junto. Los renglones nuevos reciben su id; los que no vienen se borran.
 *
 * @param {object} terms
 * @returns {Promise<{message: string, info: object}>}
 */
export async function saveCustomerTerms(terms) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS * 2);
    const errors = fieldErrorsOf(terms);
    if (Object.keys(errors).length > 0) {
        throw new ApiError({
            status: HTTP_STATUS.unprocessable,
            problem: {
                status: HTTP_STATUS.unprocessable, code: 'validation_failed',
                title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors,
            },
        });
    }
    const withIds = (rows, prefix) => rows.map((row) => ({...row, id: row.id ?? `${prefix}-${nextRowNumber++}`}));
    storedTerms = {
        credit_limit: terms.credit_limit,
        branch_split: withIds(terms.branch_split ?? [], 'split'),
        volume_discounts: withIds(terms.volume_discounts ?? [], 'discount'),
        contacts: withIds(terms.contacts ?? [], 'contact'),
    };
    return {message: serverTextOf('customerTerms.saved'), info: structuredClone(storedTerms)};
}
