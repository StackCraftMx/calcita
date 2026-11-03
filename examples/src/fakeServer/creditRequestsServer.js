// Lo que respondería el API de solicitudes de crédito (el ejemplo del formulario por pasos): revisa todo junto, como el
// backend, y regresa el folio y la clave para consultar la solicitud (que se enseña UNA vez). Guarda lo recibido para que la
// solicitud se pueda abrir y corregir: al abrirla dice qué paso hay que corregir y por qué (la revisión de la mesa).
//
// Funciones del servidor de mentira, sin React: function (regla de la casa).
import {Money} from '@stackcraftmx/calcita/money';
import {isValidClabe} from '@stackcraftmx/calcita/mexico';

import {ApiError} from '@/fakeServer/ApiError.js';
import {MEXICAN_STATES} from '@/fakeServer/catalogsServer.js';
import {isUploadedDocument, uploadedDocumentOf} from '@/fakeServer/documentsServer.js';
import {STORE_CURRENCY} from '@/fakeServer/fakeOrders.js';
import {NETWORK_DELAY_MILLISECONDS, waitLikeNetwork} from '@/fakeServer/networkDelay.js';
import {serverTextOf} from '@/fakeServer/serverMessages.js';

/** Los plazos que se ofrecen, en meses. */
export const LOAN_TERMS_IN_MONTHS = Object.freeze([6, 12, 24, 36]);

const HTTP_STATUS = Object.freeze({notFound: 404, unprocessable: 422});
// lo más que se presta: tantas veces el ingreso del mes (regla del negocio que solo conoce el servidor)
const MAX_INCOME_MULTIPLE = 10;
const PHONE_DIGITS = /^\d{10}$/;
const HEX_COLOR = /^#[0-9A-F]{6}$/;
const FOLIO_DIGITS = 6;
const STATE_CODES = new Set(MEXICAN_STATES.map((state) => state.code));
// los documentos que pide la solicitud (el id de cada uno, ya subido); el estado de cuenta es opcional
const REQUIRED_DOCUMENT_FIELDS = Object.freeze(['identification_file_id', 'address_proof_file_id']);
const OPTIONAL_DOCUMENT_FIELDS = Object.freeze(['bank_statement_file_id']);

// la llave del paso de Documentos en la pantalla: la mesa dice qué paso abrir (es el contrato con la pantalla)
const DOCUMENTS_STEP_KEY = 'documents';

// el consecutivo del folio y las solicitudes recibidas (folio → lo que se mandó), en la memoria de esta pestaña
let nextFolioNumber = 1;
const receivedRequests = new Map();

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
    // el servidor también revisa el dígito verificador: no confía en lo que ya revisó la pantalla
    if (!isValidClabe(request.deposit_clabe)) {
        errors.deposit_clabe = [serverTextOf('creditRequests.clabeInvalid')];
    }
    // la CLABE escrita dos veces tiene que ser la misma (el «confirmed» de Laravel)
    if (request.deposit_clabe_confirmation !== request.deposit_clabe) {
        errors.deposit_clabe_confirmation = [serverTextOf('creditRequests.clabeConfirmation')];
    }
    // cada documento, con el id de uno que de verdad se subió: no se confía en lo que manda la pantalla
    for (const field of REQUIRED_DOCUMENT_FIELDS) {
        if (!request[field]) {
            errors[field] = [serverTextOf('documents.missing')];
        } else if (!isUploadedDocument(request[field])) {
            errors[field] = [serverTextOf('documents.unknown')];
        }
    }
    for (const field of OPTIONAL_DOCUMENT_FIELDS) {
        if (request[field] && !isUploadedDocument(request[field])) {
            errors[field] = [serverTextOf('documents.unknown')];
        }
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
 * Lo que la mesa de crédito pide corregir, o null si nada. Regla del ejemplo: sin el estado de cuenta (es opcional) la mesa
 * lo pide, porque con él la revisión es más rápida.
 *
 * @param {object} request
 * @returns {{stepKey: string, note: string}|null}
 */
function reviewOf(request) {
    if (!request.bank_statement_file_id) {
        return {stepKey: DOCUMENTS_STEP_KEY, note: serverTextOf('creditRequests.reviewBankStatement')};
    }
    return null;
}

/** El 422 con los errores de cada campo, como Laravel. */
function validationProblemOf(errors) {
    return new ApiError({
        status: HTTP_STATUS.unprocessable,
        problem: {
            status: HTTP_STATUS.unprocessable, code: 'validation_failed',
            title: serverTextOf('validation.title'), detail: serverTextOf('validation.detail'), errors,
        },
    });
}

/** El 404 de un folio que no existe. */
function notFoundProblemOf(folio) {
    return new ApiError({
        status: HTTP_STATUS.notFound,
        problem: {status: HTTP_STATUS.notFound, title: serverTextOf('creditRequests.notFoundTitle'), detail: serverTextOf('creditRequests.notFound', {folio})},
    });
}

/**
 * POST /credit-requests: recibe la solicitud completa.
 *
 * @param {object} request los valores del formulario por pasos
 * @returns {Promise<{message: string, info: {folio: string, accessKey: string, review: {stepKey: string, note: string}|null}}>}
 */
export async function submitCreditRequest(request) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS * 3);

    const errors = fieldErrorsOf(request);
    if (Object.keys(errors).length > 0) {
        throw validationProblemOf(errors);
    }

    const folio = `SC-${String(nextFolioNumber).padStart(FOLIO_DIGITS, '0')}`;
    nextFolioNumber += 1;
    receivedRequests.set(folio, structuredClone(request));
    return {
        message: serverTextOf('creditRequests.received', {folio}),
        // la clave para consultar la solicitud: el servidor la enseña una vez y solo guarda su huella
        info: {folio, accessKey: crypto.randomUUID(), review: reviewOf(request)},
    };
}

/**
 * GET /credit-requests/{folio}: la solicitud para corregirla, con el nombre de sus documentos y lo que pide la mesa.
 *
 * @param {string} folio
 * @returns {Promise<{values: object, documents: Record<string, {name: string, size: number}>, review: {stepKey: string, note: string}|null}>}
 */
export async function openCreditRequest(folio) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS);
    const request = receivedRequests.get(folio);
    if (!request) {
        throw notFoundProblemOf(folio);
    }
    const documentFields = [...REQUIRED_DOCUMENT_FIELDS, ...OPTIONAL_DOCUMENT_FIELDS].filter((field) => request[field]);
    return {
        values: structuredClone(request),
        documents: Object.fromEntries(documentFields.map((field) => [field, uploadedDocumentOf(request[field])])),
        review: reviewOf(request),
    };
}

/**
 * PUT /credit-requests/{folio}: guarda la solicitud corregida (se revisa igual que al recibirla).
 *
 * @param {string} folio
 * @param {object} request
 * @returns {Promise<{message: string, info: {folio: string, review: {stepKey: string, note: string}|null}}>}
 */
export async function updateCreditRequest(folio, request) {
    await waitLikeNetwork(NETWORK_DELAY_MILLISECONDS * 3);
    if (!receivedRequests.has(folio)) {
        throw notFoundProblemOf(folio);
    }
    const errors = fieldErrorsOf(request);
    if (Object.keys(errors).length > 0) {
        throw validationProblemOf(errors);
    }
    receivedRequests.set(folio, structuredClone(request));
    return {message: serverTextOf('creditRequests.updated', {folio}), info: {folio, review: reviewOf(request)}};
}
