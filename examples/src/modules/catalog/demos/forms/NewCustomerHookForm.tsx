// El MISMO alta con react-hook-form (@stackcraftmx/calcita/react-hook-form): los campos se llaman igual, se ven igual y
// aplican las mismas reglas de yup (yupResolver); cambia el import y cómo se arma el formulario (useForm + FormProvider).
// El error del servidor llega igual a su campo con applyServerProblem. Varias opciones: `multiple` en el catálogo (cada una con
// su etiqueta y su ×; al formulario llega la lista de claves).
import {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import {ApiError, FormSection, toastSuccess} from '@stackcraftmx/calcita';
import {Yup} from '@stackcraftmx/calcita/forms';
import {
    FormCatalogField, FormNumberField, FormProblemAlert, FormProvider, FormTextField, SubmitButton, applyServerProblem, useForm, yupResolver,
} from '@stackcraftmx/calcita/react-hook-form';

const INITIAL_VALUES = {name: '', email: '', creditLimit: '', zones: [] as string[]};
const STATES = [{code: 'JAL', label: 'Jalisco'}, {code: 'NLE', label: 'Nuevo León'}, {code: 'YUC', label: 'Yucatán'}, {code: 'SON', label: 'Sonora'}];
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
        zones: Yup.array().of(Yup.string().required()).min(1).required(),
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
                    <FormSection title="Entrega">
                        <FormCatalogField name="zones" label="Estados a los que entrega" options={STATES} placeholder="Busque y elija varios" multiple />
                    </FormSection>
                    <SubmitButton sx={{alignSelf: 'flex-start'}}>Dar de alta</SubmitButton>
                </Stack>
            </form>
        </FormProvider>
    );
};

export default NewCustomerHookForm;
