// Lo que respondería el API de solicitudes de crédito (el ejemplo del formulario por pasos): revisa todo junto, como el
// backend, y regresa el folio y la clave para consultar la solicitud (que se enseña UNA vez).
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {Money} from '@stackcraftmx/calcita/money';

import {ApiError} from '@/fakeServer/ApiError.js';
import {MEXICAN_STATES} from '@/fakeServer/catalogsServer.js';
import {STORE_CURRENCY} from '@/fakeServer/fakeOrders.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

/** Los plazos que se ofrecen, en meses. */
export const LOAN_TERMS_IN_MONTHS = Object.freeze([6, 12, 24, 36]);

const HTTP_STATUS = Object.freeze({unprocessable: 422});
// lo más que se presta: tantas veces el ingreso del mes (regla del negocio que solo conoce el servidor)
const MAX_INCOME_MULTIPLE = 10;
const PHONE_DIGITS = /^\d{10}$/;
const HEX_COLOR = /^#[0-9A-F]{6}$/;
const FOLIO_DIGITS = 6;
const STATE_CODES = new Set(MEXICAN_STATES.map((state) => state.code));

// el consecutivo del folio, en la memoria de esta pestaña
let nextFolioNumber = 1;

/**
 * Un monto escrito, como Money; null si no es un número.
 *
 * @param {string} amount
 * @returns {Money|null}
 */
function moneyOrNull(amount) {
    try {
        return Money.fromString(amount ?? '', {currency: STORE_CURRENCY});
    } catch {
        return null;
    }
}

/**
 * Los errores de cada campo, como los manda Laravel en un 422.
 *
 * @param {object} request
 * @returns {Record<string, string[]>}
 */
function fieldErrorsOf(request) {
    const errors = {};
    const monthlyIncome = moneyOrNull(request.monthly_income);
    const requestedAmount = moneyOrNull(request.requested_amount);

    if (!monthlyIncome || monthlyIncome.isZeroOrLess()) {
        errors.monthly_income = [serverTextOf('creditRequests.incomeRequired')];
    }
    if (!requestedAmount || requestedAmount.isZeroOrLess()) {
        errors.requested_amount = [serverTextOf('creditRequests.amountRequired')];
    } else if (monthlyIncome && requestedAmount.isGreaterThan(monthlyIncome.times(MAX_INCOME_MULTIPLE))) {
        errors.requested_amount = [serverTextOf('creditRequests.amountTooHigh', {
            multiple: MAX_INCOME_MULTIPLE, max: monthlyIncome.times(MAX_INCOME_MULTIPLE).format(),
        })];
    }
    if (!LOAN_TERMS_IN_MONTHS.includes(Number(request.term_months))) {
        errors.term_months = [serverTextOf('creditRequests.termInvalid')];
    }
    if (!STATE_CODES.has(request.state)) {
        errors.state = [serverTextOf('customers.stateInvalid')];
    }
    // el aval es opcional, pero si se da, va completo
    if (request.guarantor_name?.trim() && !PHONE_DIGITS.test(request.guarantor_phone ?? '')) {
        errors.guarantor_phone = [serverTextOf('customers.phoneInvalid')];
    }
    if (request.company_color && !HEX_COLOR.test(request.company_color)) {
        errors.company_color = [serverTextOf('creditRequests.colorInvalid')];
    }
    return errors;
}

/**
 * POST /credit-requests: recibe la solicitud completa.
 *
 * @param {object} request los valores del formulario por pasos
 * @returns {Promise<{message: string, info: {folio: string, accessKey: string}}>}
 */
export async function submitCreditRequest(request) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS * 3);

    const errors = fieldErrorsOf(request);
    if (Object.keys(errors).length > 0) {
        throw new ApiError({
            status: HTTP_STATUS.unprocessable,
            problem: {
                status: HTTP_STATUS.unprocessable, code: 'validation_failed',
                title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors,
            },
        });
    }

    const folio = `SC-${String(nextFolioNumber).padStart(FOLIO_DIGITS, '0')}`;
    nextFolioNumber += 1;
    return {
        message: serverTextOf('creditRequests.received', {folio}),
        // la clave para consultar la solicitud: el servidor la enseña una vez y solo guarda su huella
        info: {folio, accessKey: crypto.randomUUID()},
    };
}
