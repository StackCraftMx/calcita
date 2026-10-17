// Ejemplo del formulario por pasos (FormWizard): una solicitud de crédito en cuatro pasos, con el aval y la imagen de la
// empresa como pasos opcionales. Al final, el folio con su botón de copiar y la clave que se enseña una sola vez
// (SecretField).
//
// La página solo declara sus pasos (qué campos lleva cada uno); revisar por paso, omitir, enviar y regresar al paso con el
// error del servidor lo hace FormWizard.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {CopyButton, FormSection, PageHeading, SecretField, SectionCard, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {
    Form, Formik, FormCatalogField, FormColorField, FormNumberField, FormSelectField, FormTextField, FormWizard, applyServerProblem,
} from '@stackcraftmx/calcita/forms';

import {
    CREDIT_REQUEST_INITIAL_VALUES, CREDIT_REQUEST_STEP_FIELDS, buildCreditRequestSchema,
} from '@/modules/customers/creditRequestSchema.js';
import {LOAN_TERMS_IN_MONTHS, submitCreditRequest} from '@/modules/customers/customersApi.js';
import {FormsNav} from '@/modules/customers/FormsNav.jsx';
import {normalizedEmailOf} from '@/modules/customers/newCustomerSchema.js';
import {useStatesCatalog} from '@/modules/customers/useStatesCatalog.js';

export const CreditRequestPage = () => {
    const {t} = useToolkitTranslation('customers');
    const {states, isLoading: isLoadingStates} = useStatesCatalog();
    const [receipt, setReceipt] = useState(null);
    const validationSchema = useMemo(() => buildCreditRequestSchema(), []);
    const termOptions = LOAN_TERMS_IN_MONTHS.map((months) => ({value: String(months), label: t('credit.termOption', {months})}));

    const submit = async (values, formikHelpers) => {
        formikHelpers.setStatus(null);
        try {
            const response = await submitCreditRequest(values);
            toastSuccess(response.message);
            setReceipt(response.info);
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    const steps = [
        {
            key: 'applicant', label: t('credit.steps.applicant'), fields: CREDIT_REQUEST_STEP_FIELDS.applicant,
            content: (
                <FormSection>
                    <FormTextField name="applicant_name" label={t('credit.applicantName')} autoComplete="off" />
                    <FormTextField name="email" label={t('credit.email')} type="email" normalizeOnBlur={normalizedEmailOf} autoComplete="off" />
                    <FormNumberField name="monthly_income" label={t('credit.monthlyIncome')} prefix="$" />
                    <FormCatalogField name="state" label={t('credit.state')} placeholder={t('form.statePlaceholder')} options={states} loading={isLoadingStates} />
                </FormSection>
            ),
        },
        {
            key: 'loan', label: t('credit.steps.loan'), fields: CREDIT_REQUEST_STEP_FIELDS.loan,
            content: (
                <FormSection>
                    <FormNumberField name="requested_amount" label={t('credit.requestedAmount')} prefix="$" helperText={t('credit.requestedAmountHelp')} />
                    <FormSelectField name="term_months" label={t('credit.term')} options={termOptions} />
                </FormSection>
            ),
        },
        {
            key: 'guarantor', label: t('credit.steps.guarantor'), fields: CREDIT_REQUEST_STEP_FIELDS.guarantor, optional: true,
            content: (
                <FormSection footer={t('credit.guarantorHelp')}>
                    <FormTextField name="guarantor_name" label={t('credit.guarantorName')} autoComplete="off" />
                    <FormTextField name="guarantor_phone" label={t('credit.guarantorPhone')} inputMode="numeric" autoComplete="off" />
                </FormSection>
            ),
        },
        {
            key: 'brand', label: t('credit.steps.brand'), fields: CREDIT_REQUEST_STEP_FIELDS.brand, optional: true,
            content: (
                <FormSection>
                    <FormColorField name="company_color" label={t('credit.companyColor')} helperText={t('credit.companyColorHelp')} />
                </FormSection>
            ),
        },
    ];

    return (
        <>
            <PageHeading title={t('credit.title')} description={t('credit.subtitle')} />
            <FormsNav />
            {receipt ? (
                <SectionCard title={t('credit.doneTitle')}>
                    <Stack spacing={2} sx={{maxWidth: 520}}>
                        <Alert severity="success">
                            {t('credit.folio')}: <strong>{receipt.folio}</strong> <CopyButton value={receipt.folio} />
                        </Alert>
                        <SecretField label={t('credit.accessKey')} value={receipt.accessKey} helperText={t('credit.accessKeyHelp')} />
                        <Button sx={{alignSelf: 'flex-start'}} onClick={() => setReceipt(null)}>{t('credit.another')}</Button>
                    </Stack>
                </SectionCard>
            ) : (
                <Formik initialValues={CREDIT_REQUEST_INITIAL_VALUES} validationSchema={validationSchema} onSubmit={submit}>
                    <Form noValidate>
                        <Stack sx={{maxWidth: 640}}>
                            <FormWizard steps={steps} submitLabel={t('credit.submit')} />
                        </Stack>
                    </Form>
                </Formik>
            )}
        </>
    );
};
