// El MISMO alta de cliente, con react-hook-form (@stackcraftmx/calcita/react-hook-form): los campos se llaman igual, se
// ven igual y aplican las mismas reglas; lo que cambia es el import y cómo se arma el formulario (useForm + FormProvider).
//
// El esquema de yup es el mismo (yupResolver lo conecta) y el error del servidor llega igual con applyServerProblem.
// La fecha no tiene campo listo para react-hook-form (su puerta no pide react-hook-form): va DateInput en un Controller.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import {FormSection, PageHeading, newIdentifier, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {DateInput} from '@stackcraftmx/calcita/date-pickers';
import {
    Controller, FormCatalogField, FormNumberField, FormProblemAlert, FormProvider, FormSelectField, FormTextField, SubmitButton,
    applyServerProblem, useForm, yupResolver,
} from '@stackcraftmx/calcita/react-hook-form';

import {customerTypeOptionsOf, deliveryDayOptionsOf} from '@/modules/customers/customerDictionaries.js';
import {SIMULATED_RESPONSES, createCustomer} from '@/modules/customers/customersApi.js';
import {FormsNav} from '@/modules/customers/FormsNav.jsx';
import {NEW_CUSTOMER_INITIAL_VALUES, buildNewCustomerSchema, normalizedEmailOf} from '@/modules/customers/newCustomerSchema.js';
import {ServerResponseCard} from '@/modules/customers/ServerResponseCard.jsx';
import {useStatesCatalog} from '@/modules/customers/useStatesCatalog.js';

// Los campos de contacto en un componente propio, envueltos en su Stack, como se parte un formulario en piezas en un
// sistema que ya existe: FormSection no pide que vayan directo, cada renglón dibuja su línea donde quede
const ContactFields = () => {
    const {t} = useToolkitTranslation('customers');
    return (
        <Stack>
            <FormTextField name="name" label={t('form.name')} placeholder={t('form.namePlaceholder')} autoComplete="off" />
            <FormTextField name="email" label={t('form.email')} type="email" placeholder={t('form.emailPlaceholder')} helperText={t('form.emailHelp')}
                           normalizeOnBlur={normalizedEmailOf} autoComplete="off" />
            <FormTextField name="phone" label={t('form.phone')} placeholder={t('form.phonePlaceholder')} helperText={t('form.phoneHelp')} inputMode="numeric"
                           autoComplete="off" />
        </Stack>
    );
};

export const NewCustomerHookFormPage = () => {
    const {t} = useToolkitTranslation('customers');
    const [simulatedResponse, setSimulatedResponse] = useState(SIMULATED_RESPONSES.normal);
    const [lastCreated, setLastCreated] = useState(null);
    const {states, isLoading: isLoadingStates} = useStatesCatalog();
    const resolver = useMemo(() => yupResolver(buildNewCustomerSchema()), []);
    const form = useForm({resolver, defaultValues: NEW_CUSTOMER_INITIAL_VALUES});

    const submit = form.handleSubmit(async (values) => {
        try {
            const response = await createCustomer({id: newIdentifier(), ...values}, simulatedResponse);
            toastSuccess(response.message);
            setLastCreated({name: values.name.trim(), id: response.info.id});
            form.reset();
        } catch (error) {
            applyServerProblem(error, form);
        }
    });

    return (
        <>
            <PageHeading title={t('page.title')} description={t('page.hookFormSubtitle')} />
            <FormsNav />
            <Stack spacing={3} sx={{maxWidth: 640}}>
                <ServerResponseCard value={simulatedResponse} onChange={setSimulatedResponse} />
                    <FormProvider {...form}>
                        <form onSubmit={submit} noValidate>
                            <Stack spacing={3}>
                                <FormProblemAlert />
                                <FormSection title={t('form.sections.contact')} footer={t('form.sections.contactFooter')}>
                                    <ContactFields />
                                </FormSection>
                                <FormSection title={t('form.sections.credit')}>
                                <FormSelectField name="customer_type" label={t('form.customerType')} options={customerTypeOptionsOf(t)} />
                                <FormNumberField name="credit_limit" label={t('form.creditLimit')} prefix="$" helperText={t('form.creditLimitHelp')} />
                                <FormCatalogField name="state" label={t('form.state')} placeholder={t('form.statePlaceholder')} options={states} loading={isLoadingStates} />
                                <Controller name="customer_since" control={form.control} render={({field, fieldState}) => (
                                    <DateInput name={field.name} label={t('form.customerSince')} helperText={t('form.customerSinceHelp')} disableFuture
                                               value={field.value} onChange={field.onChange} onBlur={field.onBlur} inputRef={field.ref}
                                               error={fieldState.error?.message} />
                                )} />
                                </FormSection>
                                <FormSection title={t('form.sections.delivery')} footer={t('form.sections.deliveryFooter')}>
                                <FormSelectField name="delivery_days" label={t('form.deliveryDays')} options={deliveryDayOptionsOf(t)} multiple />
                                <FormCatalogField name="delivery_states" label={t('form.deliveryStates')} placeholder={t('form.deliveryStatesPlaceholder')}
                                                  options={states} loading={isLoadingStates} multiple />
                                </FormSection>
                                <Stack direction="row" sx={{justifyContent: 'flex-end'}}>
                                    <SubmitButton>{t('form.submit')}</SubmitButton>
                                </Stack>
                            </Stack>
                        </form>
                    </FormProvider>
                {lastCreated && <Alert severity="success">{t('form.lastCreated', lastCreated)}</Alert>}
            </Stack>
        </>
    );
};
