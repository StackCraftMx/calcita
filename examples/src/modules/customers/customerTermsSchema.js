// Las reglas de las condiciones del cliente (yup): el límite de crédito y sus tres listas de renglones, con las reglas de
// listas del paquete. El servidor revisa lo mismo y además los correos que ya son de otro cliente.
//
// OJO: función y no constante, por lo mismo que newCustomerSchema.js (yup toma los mensajes al armar el esquema).
import {formatCurrency} from '@stackcraftmx/calcita';
import {Yup, listTotalAtMostRule, orderedInListRule, percentRule, uniqueInListRule} from '@stackcraftmx/calcita/forms';

/** Hasta cuántos renglones de cada lista. */
export const CUSTOMER_TERMS_LIMITS = Object.freeze({branches: 8, discounts: 5, contacts: 5});

/** Cómo empieza un renglón nuevo de cada lista. */
export const EMPTY_ROWS = Object.freeze({
    branchSplit: Object.freeze({branch_id: '', amount: ''}),
    volumeDiscount: Object.freeze({min_amount: '', discount_percent: ''}),
    contact: Object.freeze({name: '', email: '', is_main: false}),
});

/**
 * @param {string} currency la moneda de la tienda (para sumar el reparto con Money)
 * @returns {object} el esquema de yup
 */
export function buildCustomerTermsSchema(currency) {
    return Yup.object({
        credit_limit: Yup.string().required(),
        notify_channels: Yup.array().min(1),
        allowed_branch_ids: Yup.array().min(1),
        // el reparto: cada sucursal una vez, y entre todas no pasan del límite que se escribió arriba
        branch_split: Yup.array().max(CUSTOMER_TERMS_LIMITS.branches).of(Yup.object({
            branch_id: Yup.string().required().test(uniqueInListRule('branch_split', 'branch_id')),
            amount: Yup.string().required(),
        })).test(listTotalAtMostRule('amount', (values) => values.credit_limit, {currency})),
        // los descuentos: más compra, más descuento
        volume_discounts: Yup.array().max(CUSTOMER_TERMS_LIMITS.discounts).of(Yup.object({
            min_amount: Yup.string().required().test(uniqueInListRule('volume_discounts', 'min_amount'))
                .test(orderedInListRule('volume_discounts', 'min_amount', {displayOf: (amount) => formatCurrency(Number(amount))})),
            discount_percent: Yup.string().required().test(percentRule())
                .test(orderedInListRule('volume_discounts', 'discount_percent', {displayOf: (percent) => `${percent} %`})),
        })),
        contacts: Yup.array().min(1).max(CUSTOMER_TERMS_LIMITS.contacts).of(Yup.object({
            name: Yup.string().trim().required(),
            email: Yup.string().trim().required().email().test(uniqueInListRule('contacts', 'email')),
        })),
    });
}
