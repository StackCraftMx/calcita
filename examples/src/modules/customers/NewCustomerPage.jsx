// Ejemplo de formulario con formik: el alta de un cliente con los campos del paquete (@stackcraftmx/calcita/forms).
//
// Lo que se ve aquí:
//   - FormTextField, FormSelectField, FormNumberField (miles y decimales; al formulario llega '50000.00', listo para
//     Money), FormCatalogField (se busca por clave o nombre) y FormDateField (de /date-pickers; viaja 'AAAA-MM-DD');
//   - FormMaskedField: el teléfono se ve con espacios y viaja con sus 10 dígitos;
//   - FormFileField: la constancia fiscal del tamaño de un campo (PDF de hasta 2 MB; se puede soltar encima);
//   - varias opciones con `multiple`: los días en la lista (cada elegido con su palomita) y los estados en el catálogo (cada
//     uno con su etiqueta y su ×); al formulario y al servidor llegan como listas;
//   - el error de cada campo solo cuando ya se tocó y en el idioma activo; el correo se normaliza al salir del campo;
//   - SubmitButton se bloquea mientras se envía; FormProblemAlert pinta lo que el servidor dijo que no es de un campo;
//   - applyServerProblem: el 422 del servidor cae en su campo (el correo repetido, el límite de más para su tipo);
//   - el id del cliente nuevo lo genera la pantalla (UUID v7, newIdentifier).
// Formik, Form y Yup salen del paquete, no de 'formik' / 'yup' directo.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {FormSection, INPUT_MASK, PageHeading, newIdentifier, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {FormDateField} from '@stackcraftmx/calcita/date-pickers';
import {
    Form, Formik, FormCatalogField, FormFileField, FormMaskedField, FormNumberField, FormProblemAlert, FormSelectField, FormTextField,
    SubmitButton, applyServerProblem,
} from '@stackcraftmx/calcita/forms';

import {customerTypeOptionsOf, deliveryDayOptionsOf} from '@/modules/customers/customerDictionaries.js';
import {SIMULATED_RESPONSES, createCustomer} from '@/modules/customers/customersApi.js';
import {FormsNav} from '@/modules/customers/FormsNav.jsx';
import {
    NEW_CUSTOMER_INITIAL_VALUES, TAX_CERTIFICATE_MAX_SIZE, buildNewCustomerSchema, normalizedEmailOf,
} from '@/modules/customers/newCustomerSchema.js';
import {ServerResponseCard} from '@/modules/customers/ServerResponseCard.jsx';
import {useStatesCatalog} from '@/modules/customers/useStatesCatalog.js';

export const NewCustomerPage = () => {
    const {t} = useToolkitTranslation('customers');
    const [simulatedResponse, setSimulatedResponse] = useState(SIMULATED_RESPONSES.normal);
    const [lastCreated, setLastCreated] = useState(null);
    const {states, isLoading: isLoadingStates} = useStatesCatalog();
    // se arma una vez, cuando yup ya tiene sus mensajes en llaves (ver newCustomerSchema.js)
    const validationSchema = useMemo(() => buildNewCustomerSchema(), []);

    const submit = async (values, formikHelpers) => {
        formikHelpers.setStatus(null);
        try {
            const response = await createCustomer({id: newIdentifier(), ...values}, simulatedResponse);
            toastSuccess(response.message);
            setLastCreated({name: values.name.trim(), id: response.info.id});
            formikHelpers.resetForm();
        } catch (error) {
            // OJO: applyServerProblem necesita los valores para saber qué campos existen; formik no los trae en sus helpers
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <>
            <PageHeading title={t('page.title')} description={t('page.subtitle')} />
            <FormsNav />
            <Stack spacing={3} sx={{maxWidth: 640}}>
                <ServerResponseCard value={simulatedResponse} onChange={setSimulatedResponse} />
                    <Formik initialValues={NEW_CUSTOMER_INITIAL_VALUES} validationSchema={validationSchema} onSubmit={submit}>
                        <Form noValidate>
                            <Stack spacing={3}>
                                <FormProblemAlert />
                                <FormSection title={t('form.sections.contact')} footer={t('form.sections.contactFooter')}>
                                <FormTextField name="name" label={t('form.name')} placeholder={t('form.namePlaceholder')} autoComplete="off" />
                                <FormTextField name="email" label={t('form.email')} type="email" placeholder={t('form.emailPlaceholder')} helperText={t('form.emailHelp')}
                                               normalizeOnBlur={normalizedEmailOf} autoComplete="off" />
                                {/* con máscara: se ve «555 123 4567» y al servidor llegan los 10 dígitos */}
                                <FormMaskedField name="phone" mask={INPUT_MASK.phone} label={t('form.phone')} placeholder={t('form.phonePlaceholder')}
                                                 helperText={t('form.phoneHelp')} autoComplete="off" />
                                </FormSection>
                                <FormSection title={t('form.sections.credit')}>
                                <FormSelectField name="customer_type" label={t('form.customerType')} options={customerTypeOptionsOf(t)} />
                                <FormNumberField name="credit_limit" label={t('form.creditLimit')} prefix="$" helperText={t('form.creditLimitHelp')} />
                                <FormCatalogField name="state" label={t('form.state')} placeholder={t('form.statePlaceholder')} options={states} loading={isLoadingStates} />
                                <FormDateField name="customer_since" label={t('form.customerSince')} helperText={t('form.customerSinceHelp')}
                                               disableFuture />
                                </FormSection>
                                <FormSection title={t('form.sections.delivery')} footer={t('form.sections.deliveryFooter')}>
                                <FormSelectField name="delivery_days" label={t('form.deliveryDays')} options={deliveryDayOptionsOf(t)} multiple />
                                <FormCatalogField name="delivery_states" label={t('form.deliveryStates')} placeholder={t('form.deliveryStatesPlaceholder')}
                                                  options={states} loading={isLoadingStates} multiple />
                                </FormSection>
                                <FormSection title={t('form.sections.documents')} footer={t('form.sections.documentsFooter')}>
                                <FormFileField name="tax_certificate" label={t('form.taxCertificate')} helperText={t('form.taxCertificateHelp')}
                                               accept="pdf" maxSize={TAX_CERTIFICATE_MAX_SIZE} />
                                </FormSection>
                                <Stack direction="row" sx={{justifyContent: 'flex-end'}}>
                                    <SubmitButton>{t('form.submit')}</SubmitButton>
                                </Stack>
                            </Stack>
                        </Form>
                    </Formik>
                {lastCreated && <Alert severity="success">{t('form.lastCreated', lastCreated)}</Alert>}
            </Stack>
        </>
    );
};
