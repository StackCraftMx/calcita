// Ejemplo del formulario por pasos (FormWizard): una solicitud de crédito en cinco pasos, con el aval y la imagen de la
// empresa como pasos opcionales. Los documentos van con el cargador mini (FormFileUploadField): cada uno se sube en cuanto se
// elige y al formulario llega solo su id; el servidor revisa al recibir la solicitud que esos ids sean de documentos
// subidos. Mientras falte uno obligatorio, «Siguiente» se ve apagado y dice cuántos faltan (steps[].nextDisabledReason); los
// nombres de los documentos son largos y su sección va con labelWidth auto: el nombre se lleva lo que sobre y el cargador
// solo lo que ocupa. Al final, el folio con su botón de copiar y la clave que se enseña una sola vez (SecretField).
//
// La página solo declara sus pasos (qué campos lleva cada uno); revisar por paso, omitir, enviar y regresar al paso con el
// error del servidor lo hace FormWizard.
//
// Corregir una solicitud ya enviada: si la mesa pide algo (el servidor lo dice con la revisión), «Corregir la solicitud» la
// abre del servidor con lo que se mandó. El mismo formulario va en vertical, abre en el paso que dice la mesa y los títulos
// se pulsan para saltar directo: se entra a corregir un dato, no a recorrer los cinco pasos.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {
    CopyButton, FORM_LABEL_PLACEMENT, FORM_LABEL_WIDTH, FormSection, INPUT_MASK, PageHeading, SecretField, SectionCard, WIZARD_ORIENTATION, WIZARD_STEP_SELECTION, toastProblem,
    toastSuccess,
    useToolkitTranslation,
} from '@stackcraftmx/calcita';
import {
    Form, Formik, FormCatalogField, FormColorField, FormFileUploadField, FormMaskedField, FormNumberField, FormSelectField, FormTextField,
    FormWizard, applyServerProblem,
} from '@stackcraftmx/calcita/forms';

import {
    CREDIT_REQUEST_INITIAL_VALUES, CREDIT_REQUEST_STEP_FIELDS, buildCreditRequestSchema,
} from '@/modules/customers/creditRequestSchema.js';
import {
    LOAN_TERMS_IN_MONTHS, downloadUploadedDocument, openCreditRequest, submitCreditRequest, updateCreditRequest, uploadDocument,
} from '@/modules/customers/customersApi.js';
import {FormsNav} from '@/modules/customers/FormsNav.jsx';
import {normalizedEmailOf} from '@/modules/customers/newCustomerSchema.js';
import {useStatesCatalog} from '@/modules/customers/useStatesCatalog.js';

// los documentos que pide la solicitud: el campo del formulario, su texto y si es obligatorio (lo mismo que el esquema); lo
// que aceptan es lo mismo que revisa el servidor
const CREDIT_DOCUMENTS = Object.freeze([
    {field: 'identification_file_id', labelKey: 'credit.documents.identification', required: true},
    {field: 'address_proof_file_id', labelKey: 'credit.documents.addressProof', required: true},
    {field: 'bank_statement_file_id', labelKey: 'credit.documents.bankStatement', required: false},
]);
const DOCUMENT_ACCEPT = Object.freeze(['pdf', '.jpg', '.jpeg', '.png']);
const DOCUMENT_MAX_SIZE = '5 MB';

export const CreditRequestPage = () => {
    const {t} = useToolkitTranslation('customers');
    const {states, isLoading: isLoadingStates} = useStatesCatalog();
    const [receipt, setReceipt] = useState(null);
    // la solicitud que se corrige, como la abrió el servidor ({folio, values, documents, review}); null: una solicitud nueva
    const [correction, setCorrection] = useState(null);
    const [isOpeningCorrection, setIsOpeningCorrection] = useState(false);
    const validationSchema = useMemo(() => buildCreditRequestSchema(), []);
    const termOptions = LOAN_TERMS_IN_MONTHS.map((months) => ({value: String(months), label: t('credit.termOption', {months})}));

    const submit = async (values, formikHelpers) => {
        formikHelpers.setStatus(null);
        try {
            const response = correction ? await updateCreditRequest(correction.folio, values) : await submitCreditRequest(values);
            toastSuccess(response.message);
            setReceipt(response.info);
            setCorrection(null);
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    // abre del servidor la solicitud recibida, con lo que se mandó y lo que pide la mesa
    const openCorrection = async () => {
        setIsOpeningCorrection(true);
        try {
            const opened = await openCreditRequest(receipt.folio);
            setCorrection({folio: receipt.folio, ...opened});
            setReceipt(null);
        } catch (error) {
            toastProblem(error);
        } finally {
            setIsOpeningCorrection(false);
        }
    };
    // al corregir: en vertical, abierto en el paso que dice la mesa y con los títulos que se pulsan para saltar directo
    const correctionWizardProps = correction
        ? {orientation: WIZARD_ORIENTATION.vertical, stepSelection: WIZARD_STEP_SELECTION.free, initialStepKey: correction.review?.stepKey}
        : {};

    // los pasos con lo que va escrito en el formulario: el de documentos cuenta los obligatorios que faltan
    const stepsOf = (values) => {
        const uploadedCount = CREDIT_DOCUMENTS.filter(({field}) => Boolean(values[field])).length;
        const missingCount = CREDIT_DOCUMENTS.filter(({field, required}) => required && !values[field]).length;
        return [
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
                        <FormMaskedField name="deposit_clabe" mask={INPUT_MASK.clabe} label={t('credit.depositClabe')} helperText={t('credit.depositClabeHelp')}
                                         placeholder="032 180 00011835971 9" autoComplete="off" />
                        {/* el mensaje de «no coincide» es de esta pantalla: messages lo pone sin tocar la regla del esquema */}
                        <FormMaskedField name="deposit_clabe_confirmation" mask={INPUT_MASK.clabe} label={t('credit.depositClabeConfirmation')}
                                         messages={{sameAs: t('credit.depositClabeMismatch')}} autoComplete="off" />
                    </FormSection>
                ),
            },
            {
                key: 'documents', label: t('credit.steps.documents'), fields: CREDIT_REQUEST_STEP_FIELDS.documents,
                // mientras falte uno obligatorio no se deja el paso: «Siguiente» apagado con el motivo
                nextDisabledReason: missingCount > 0 ? t('credit.documents.missing', {count: missingCount}) : null,
                content: (
                    // en el teléfono lo que sobra es poco: ahí el nombre va arriba y el cargador abajo
                    <FormSection labelWidth={FORM_LABEL_WIDTH.auto} labelPlacement={FORM_LABEL_PLACEMENT.topOnPhone}
                                 footer={t('credit.documents.count', {uploaded: uploadedCount, total: CREDIT_DOCUMENTS.length})}>
                        {CREDIT_DOCUMENTS.map(({field, labelKey}) => (
                            <FormFileUploadField key={field} name={field} label={t(labelKey)} upload={uploadDocument}
                                                 uploadedFile={correction?.documents[field] ?? null}
                                                 download={downloadUploadedDocument} accept={DOCUMENT_ACCEPT} maxSize={DOCUMENT_MAX_SIZE}
                                                 limitsText={t('credit.documents.limits')} />
                        ))}
                    </FormSection>
                ),
            },
            {
                key: 'guarantor', label: t('credit.steps.guarantor'), fields: CREDIT_REQUEST_STEP_FIELDS.guarantor, optional: true,
                content: (
                    <FormSection footer={t('credit.guarantorHelp')}>
                        <FormTextField name="guarantor_name" label={t('credit.guarantorName')} autoComplete="off" />
                        <FormMaskedField name="guarantor_phone" mask={INPUT_MASK.phone} label={t('credit.guarantorPhone')} autoComplete="off" />
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
    };

    return (
        <>
            <PageHeading title={t('credit.title')} description={t('credit.subtitle')} />
            <FormsNav />
            {receipt ? (
                <SectionCard title={t(receipt.accessKey ? 'credit.doneTitle' : 'credit.savedTitle')}>
                    <Stack spacing={2} sx={{maxWidth: 520}}>
                        <Alert severity="success">
                            {t('credit.folio')}: <strong>{receipt.folio}</strong> <CopyButton value={receipt.folio} />
                        </Alert>
                        {/* la clave sale una sola vez: al recibir la solicitud, no al corregirla */}
                        {receipt.accessKey && <SecretField label={t('credit.accessKey')} value={receipt.accessKey} helperText={t('credit.accessKeyHelp')} />}
                        {receipt.review && (
                            <Alert severity="warning" action={(
                                <Button color="inherit" size="small" loading={isOpeningCorrection} onClick={openCorrection}>{t('credit.fix')}</Button>
                            )}>
                                {receipt.review.note}
                            </Alert>
                        )}
                        <Button sx={{alignSelf: 'flex-start'}} onClick={() => setReceipt(null)}>{t('credit.another')}</Button>
                    </Stack>
                </SectionCard>
            ) : (
                // key: la corrección es otro formulario (otros valores de inicio), no el de una solicitud nueva
                <Formik key={correction?.folio ?? 'new'} initialValues={correction?.values ?? CREDIT_REQUEST_INITIAL_VALUES}
                        validationSchema={validationSchema} onSubmit={submit}>
                    {({values}) => (
                        <Form noValidate>
                            <Stack spacing={2} sx={{maxWidth: 640}}>
                                {correction?.review && <Alert severity="warning">{t('credit.fixing', {folio: correction.folio, note: correction.review.note})}</Alert>}
                                <FormWizard steps={stepsOf(values)} submitLabel={t(correction ? 'credit.saveChanges' : 'credit.submit')} hideBackOnFirstStep
                                            {...correctionWizardProps} />
                            </Stack>
                        </Form>
                    )}
                </Formik>
            )}
        </>
    );
};
