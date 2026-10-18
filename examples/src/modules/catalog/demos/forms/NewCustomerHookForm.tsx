// El MISMO alta con react-hook-form (@stackcraftmx/calcita/react-hook-form): los campos se llaman igual, se ven igual y
// aplican las mismas reglas de yup (yupResolver); cambia el import y cómo se arma el formulario (useForm + FormProvider).
// El error del servidor llega igual a su campo con applyServerProblem.
import {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import {ApiError, FormSection, toastSuccess} from '@stackcraftmx/calcita';
import {Yup} from '@stackcraftmx/calcita/forms';
import {
    FormNumberField, FormProblemAlert, FormProvider, FormTextField, SubmitButton, applyServerProblem, useForm, yupResolver,
} from '@stackcraftmx/calcita/react-hook-form';

const INITIAL_VALUES = {name: '', email: '', creditLimit: ''};
type CustomerValues = typeof INITIAL_VALUES;

// ─── El servidor de mentira (en su proyecto NO va) ───
const createCustomer = async (values: CustomerValues) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (values.email.trim().toLowerCase() === 'ana@ejemplo.com') {
        throw new ApiError({status: 422, problem: {title: 'Revise los datos', errors: {email: ['Ya hay un cliente con ese correo.']}}});
    }
    return {message: `Se dio de alta a ${values.name.trim()}.`};
};

const NewCustomerHookForm = () => {
    const resolver = useMemo(() => yupResolver(Yup.object({
        name: Yup.string().trim().required(),
        email: Yup.string().trim().required().email(),
        creditLimit: Yup.string().required(),
    })), []);
    const form = useForm<CustomerValues>({resolver, defaultValues: INITIAL_VALUES});

    const save = form.handleSubmit(async (values) => {
        try {
            toastSuccess((await createCustomer(values)).message);
            form.reset();
        } catch (error) {
            applyServerProblem(error, form);
        }
    });

    return (
        <FormProvider {...form}>
            <form onSubmit={save} noValidate>
                <Stack spacing={3} sx={{maxWidth: 560}}>
                    <FormProblemAlert />
                    <FormSection title="Contacto">
                        <FormTextField name="name" label="Nombre" />
                        <FormTextField name="email" label="Correo" type="email" />
                        <FormNumberField name="creditLimit" label="Límite de crédito" prefix="$" decimals={2} />
                    </FormSection>
                    <SubmitButton sx={{alignSelf: 'flex-start'}}>Dar de alta</SubmitButton>
                </Stack>
            </form>
        </FormProvider>
    );
};

export default NewCustomerHookForm;
