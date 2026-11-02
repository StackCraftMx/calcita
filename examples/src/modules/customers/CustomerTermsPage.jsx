// Ejemplo de renglones que se repiten (FormRepeatingFields): las condiciones de un cliente en un solo formulario de formik.
//   - el reparto del límite de crédito entre sucursales: cada sucursal una vez y entre todas no pasan del límite; abajo,
//     cuánto va repartido y cuánto queda (listTotalOf, con Money);
//   - los descuentos por volumen: de menor a mayor compra y de menor a mayor descuento (orderedInListRule);
//   - los contactos: el principal no se puede quitar y los que ya estaban guardados piden confirmar;
//   - por dónde se le avisa la cobranza (grupo de casillas) y las sucursales donde puede comprar (lista de transferencia):
//     el servidor revisa que cada sucursal del reparto esté entre ellas.
// El servidor vuelve a revisar todo y lo que solo él sabe (un correo de otro cliente) llega al renglón que toca.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useMemo, useState} from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {FormSection, PageHeading, SectionCard, toastProblem, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {
    Form, Formik, FormCheckboxGroupField, FormNumberField, FormProblemAlert, FormRepeatingFields, FormSelectField, FormTextField,
    FormTransferListField, SubmitButton, applyServerProblem, listTotalOf,
} from '@stackcraftmx/calcita/forms';
import {Money} from '@stackcraftmx/calcita/money';

import {
    NOTIFY_CHANNEL, STORE_CURRENCY, getCustomerTerms, listBranches, saveCustomerTerms,
} from '@/modules/customers/customersApi.js';
import {CUSTOMER_TERMS_LIMITS, EMPTY_ROWS, buildCustomerTermsSchema} from '@/modules/customers/customerTermsSchema.js';
import {FormsNav} from '@/modules/customers/FormsNav.jsx';

// cuánto va repartido del límite y cuánto queda, en palabras (o cuánto se pasa)
const SplitSummary = ({rows, creditLimit, t}) => {
    const split = listTotalOf(rows, 'amount', {currency: STORE_CURRENCY});
    let limit = null;
    try {
        limit = creditLimit ? Money.fromString(creditLimit, {currency: STORE_CURRENCY}) : null;
    } catch {
        limit = null;
    }
    if (!limit) {
        return <Typography variant="body2" color="text.secondary">{t('terms.split.totalOnly', {total: split.format()})}</Typography>;
    }
    const isOver = split.isGreaterThan(limit);
    return (
        <Typography variant="body2" color={isOver ? 'error' : 'text.secondary'} role="status">
            {isOver
                ? t('terms.split.over', {total: split.format(), max: limit.format(), over: split.minus(limit).format()})
                : t('terms.split.left', {total: split.format(), max: limit.format(), left: limit.minus(split).format()})}
        </Typography>
    );
};

export const CustomerTermsPage = () => {
    const {t} = useToolkitTranslation('customers');
    const [terms, setTerms] = useState(null);
    const [branchOptions, setBranchOptions] = useState([]);
    const channelOptions = Object.values(NOTIFY_CHANNEL).map((channel) => ({
        value: channel, label: t(`terms.channels.${channel}.label`), description: t(`terms.channels.${channel}.description`),
    }));
    const validationSchema = useMemo(() => buildCustomerTermsSchema(STORE_CURRENCY), []);

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([getCustomerTerms(), listBranches({}, controller.signal)])
            .then(([savedTerms, branches]) => {
                setTerms(savedTerms);
                setBranchOptions(branches.map((branch) => ({value: branch.id, label: `${branch.name} · ${branch.city}`})));
            })
            .catch((error) => error.name !== 'AbortError' && toastProblem(error));
        return () => controller.abort();
    }, []);

    const submit = async (values, formikHelpers) => {
        formikHelpers.setStatus(null);
        try {
            const response = await saveCustomerTerms(values);
            toastSuccess(response.message);
            // lo guardado regresa con los ids de los renglones nuevos: el formulario empieza de ahí
            formikHelpers.resetForm({values: response.info});
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <>
            <PageHeading title={t('terms.title')} description={t('terms.subtitle')} />
            <FormsNav />
            {terms && (
                <Formik initialValues={terms} validationSchema={validationSchema} onSubmit={submit}>
                    {({values}) => (
                        <Form noValidate>
                            <Stack spacing={3} sx={{maxWidth: 880}}>
                                <FormProblemAlert />
                                <FormSection title={t('terms.credit.title')}>
                                    <FormNumberField name="credit_limit" label={t('terms.credit.limit')} prefix="$" />
                                    <FormCheckboxGroupField name="notify_channels" label={t('terms.channels.title')} options={channelOptions} selectAll />
                                </FormSection>

                                <SectionCard title={t('terms.allowed.title')}>
                                    <FormTransferListField name="allowed_branch_ids" options={branchOptions}
                                                           availableTitle={t('terms.allowed.available')} chosenTitle={t('terms.allowed.chosen')}
                                                           helperText={t('terms.allowed.help')} />
                                </SectionCard>

                                <SectionCard title={t('terms.split.title')}>
                                    <FormRepeatingFields
                                        name="branch_split"
                                        emptyRow={EMPTY_ROWS.branchSplit}
                                        minRows={0}
                                        maxRows={CUSTOMER_TERMS_LIMITS.branches}
                                        columns={{xs: 1, sm: 2}}
                                        rowLabelOf={(index) => t('terms.split.row', {number: index + 1})}
                                        addLabel={t('terms.split.add')}
                                        confirmRemove={(row) => Boolean(row?.id)}
                                        footer={<SplitSummary rows={values.branch_split} creditLimit={values.credit_limit} t={t} />}
                                        renderRow={({nameOf}) => (
                                            <>
                                                <FormSelectField name={nameOf('branch_id')} label={t('terms.split.branch')} options={branchOptions} />
                                                <FormNumberField name={nameOf('amount')} label={t('terms.split.amount')} prefix="$" />
                                            </>
                                        )}
                                    />
                                </SectionCard>

                                <SectionCard title={t('terms.discounts.title')}>
                                    <FormRepeatingFields
                                        name="volume_discounts"
                                        emptyRow={EMPTY_ROWS.volumeDiscount}
                                        minRows={0}
                                        maxRows={CUSTOMER_TERMS_LIMITS.discounts}
                                        columns={{xs: 1, sm: 2}}
                                        rowLabelOf={(index) => t('terms.discounts.row', {number: index + 1})}
                                        addLabel={t('terms.discounts.add')}
                                        helperText={t('terms.discounts.help')}
                                        renderRow={({nameOf}) => (
                                            <>
                                                <FormNumberField name={nameOf('min_amount')} label={t('terms.discounts.minAmount')} prefix="$" />
                                                <FormNumberField name={nameOf('discount_percent')} label={t('terms.discounts.percent')} suffix="%" decimals={1} />
                                            </>
                                        )}
                                    />
                                </SectionCard>

                                <SectionCard title={t('terms.contacts.title')}>
                                    <FormRepeatingFields
                                        name="contacts"
                                        emptyRow={EMPTY_ROWS.contact}
                                        maxRows={CUSTOMER_TERMS_LIMITS.contacts}
                                        columns={{xs: 1, sm: 2}}
                                        rowLabelOf={(index) => (values.contacts[index]?.is_main ? t('terms.contacts.main') : t('terms.contacts.row', {number: index + 1}))}
                                        addLabel={t('terms.contacts.add')}
                                        removeBlockedReason={(row) => (row?.is_main ? t('terms.contacts.mainBlocked') : null)}
                                        confirmRemove={(row) => Boolean(row?.id)}
                                        renderRow={({nameOf}) => (
                                            <>
                                                <FormTextField name={nameOf('name')} label={t('terms.contacts.name')} autoComplete="off" />
                                                <FormTextField name={nameOf('email')} label={t('terms.contacts.email')} type="email" autoComplete="off" />
                                            </>
                                        )}
                                    />
                                </SectionCard>
                                <SubmitButton sx={{alignSelf: 'flex-start'}}>{t('terms.save')}</SubmitButton>
                            </Stack>
                        </Form>
                    )}
                </Formik>
            )}
        </>
    );
};
