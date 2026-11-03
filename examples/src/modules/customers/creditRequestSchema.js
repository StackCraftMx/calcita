// Las reglas de la solicitud de crédito por pasos (yup), un solo esquema para todo el formulario: FormWizard revisa en cada
// paso solo los campos de ese paso, y al enviar revisa todos.
//
// Los pasos opcionales tienen campos opcionales: omitir un paso los deja vacíos y vacíos son válidos.
//
// OJO: función y no constante, por lo mismo que newCustomerSchema.js (yup toma los mensajes al armar el esquema).
import {Yup, sameAsFieldRule} from '@stackcraftmx/calcita/forms';
import {clabeRule} from '@stackcraftmx/calcita/mexico';

const PHONE_DIGITS = /^\d{10}$/;
const HEX_COLOR = /^#[0-9A-F]{6}$/;

export const CREDIT_REQUEST_INITIAL_VALUES = Object.freeze({
    applicant_name: '', email: '', monthly_income: '', state: '',
    requested_amount: '', term_months: '', deposit_clabe: '', deposit_clabe_confirmation: '',
    identification_file_id: '', address_proof_file_id: '', bank_statement_file_id: '',
    guarantor_name: '', guarantor_phone: '',
    company_color: '',
});

/** Los campos de cada paso: los que revisa «Siguiente» y los que limpia «Omitir». */
export const CREDIT_REQUEST_STEP_FIELDS = Object.freeze({
    applicant: ['applicant_name', 'email', 'monthly_income', 'state'],
    loan: ['requested_amount', 'term_months', 'deposit_clabe', 'deposit_clabe_confirmation'],
    documents: ['identification_file_id', 'address_proof_file_id', 'bank_statement_file_id'],
    guarantor: ['guarantor_name', 'guarantor_phone'],
    brand: ['company_color'],
});

/**
 * @returns {object} el esquema de yup de la solicitud completa
 */
export function buildCreditRequestSchema() {
    return Yup.object({
        applicant_name: Yup.string().trim().required(),
        email: Yup.string().trim().required().email(),
        monthly_income: Yup.string().required(),
        state: Yup.string().required(),
        // cuánto se presta según el ingreso lo revisa el servidor: aquí solo que venga
        requested_amount: Yup.string().required(),
        term_months: Yup.string().required(),
        // la CLABE llega limpia (sin espacios) de su campo con máscara; clabeRule revisa sus 18 dígitos y el verificador
        deposit_clabe: Yup.string().required().test(clabeRule()),
        // se escribe dos veces (como pide Laravel con «confirmed»): un dígito cambiado manda el dinero a otra cuenta. El texto
        // propio del error lo pone la pantalla en el campo (messages), sin tocar esta regla
        deposit_clabe_confirmation: Yup.string().required().test(sameAsFieldRule('deposit_clabe')),
        // los documentos: el id que dio el servidor al subirlos ('' mientras no se suben); el estado de cuenta es opcional
        identification_file_id: Yup.string().required(),
        address_proof_file_id: Yup.string().required(),
        bank_statement_file_id: Yup.string(),
        guarantor_name: Yup.string().trim(),
        // el teléfono del aval solo si hay aval
        guarantor_phone: Yup.string().when('guarantor_name', {
            is: (guarantorName) => Boolean(guarantorName?.trim()),
            then: (schema) => schema.required().matches(PHONE_DIGITS, {message: {key: 'customers:form.phoneFormat'}}),
        }),
        company_color: Yup.string().matches(HEX_COLOR, {message: {key: 'validation:matches'}, excludeEmptyString: true}),
    });
}
