// Las reglas del formulario de alta de cliente, del lado del navegador (yup). La que protege es la del servidor; esta
// es para no gastar un viaje en lo obvio. La usan los dos formularios de alta: el de formik y el de react-hook-form.
//
// Sin textos pegados: los mensajes por omisión de yup son llaves (buildYupLocale en main.jsx) y se traducen al pintarlos,
// en el idioma activo. Un mensaje propio va como {key: 'namespace:llave'}.
//
// OJO: es una función y no una constante. yup toma los mensajes en el momento de armar el esquema; armado al importar
// el archivo, se adelantaría a buildYupLocale y saldría con los mensajes en inglés de yup.
import {Yup} from '@stackcraftmx/calcita/forms';

import {CUSTOMER_TYPE, DELIVERY_DAY} from '@/modules/customers/customerDictionaries.js';

const NAME_MAX_LENGTH = 80;
const PHONE_DIGITS = /^\d{10}$/;

/**
 * Los valores con que arranca el formulario. Las llaves son las del API: así un 422 cae en su campo. El límite de crédito
 * es texto ('50000.00'), como lo deja el campo de número y como lo lee Money.
 */
export const NEW_CUSTOMER_INITIAL_VALUES = Object.freeze({
    name: '', email: '', phone: '', customer_type: '', credit_limit: '', state: '', customer_since: '',
    // varias opciones: listas (al menos un día; los estados, opcionales)
    delivery_days: [], delivery_states: [],
});

/**
 * El correo como lo guarda el servidor: sin espacios y en minúsculas (normalizeOnBlur del campo de correo).
 *
 * @param {string} email
 * @returns {string}
 */
export function normalizedEmailOf(email) {
    return email.trim().toLowerCase();
}

/**
 * @returns {object} el esquema de yup del alta
 */
export function buildNewCustomerSchema() {
    return Yup.object({
        name: Yup.string().trim().required().max(NAME_MAX_LENGTH),
        email: Yup.string().trim().required().email(),
        phone: Yup.string().required().matches(PHONE_DIGITS, {message: {key: 'customers:form.phoneFormat'}}),
        customer_type: Yup.string().required().oneOf(Object.keys(CUSTOMER_TYPE)),
        // el tope según el tipo lo revisa el servidor: aquí solo que venga
        credit_limit: Yup.string().required(),
        state: Yup.string().required(),
        customer_since: Yup.string(),
        delivery_days: Yup.array().of(Yup.string().oneOf(Object.keys(DELIVERY_DAY))).min(1),
        delivery_states: Yup.array().of(Yup.string()),
    });
}
