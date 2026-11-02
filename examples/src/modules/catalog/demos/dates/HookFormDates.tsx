// Con react-hook-form: la puerta de fechas no pide react-hook-form, así que cada campo va dentro de un Controller (igual para
// los cuatro). Las reglas son las mismas de yup con yupResolver.
import {useMemo} from 'react';
import Stack from '@mui/material/Stack';
import {toastSuccess} from '@stackcraftmx/calcita';
import {DateTimeInput, TimeInput} from '@stackcraftmx/calcita/date-pickers';
import {Yup} from '@stackcraftmx/calcita/forms';
import {Controller, FormProvider, SubmitButton, useForm, yupResolver} from '@stackcraftmx/calcita/react-hook-form';

const INITIAL_VALUES = {pickupAt: '', pickupWindowEnd: ''};

const HookFormDates = () => {
    // 1. Las reglas y el formulario
    const resolver = useMemo(() => yupResolver(Yup.object({
        pickupAt: Yup.string().required(),
        pickupWindowEnd: Yup.string().required(),
    })), []);
    const form = useForm({resolver, defaultValues: INITIAL_VALUES});

    return (
        <FormProvider {...form}>
            <form noValidate onSubmit={form.handleSubmit((values) => toastSuccess(`Viaja: ${JSON.stringify(values)}`))}>
                <Stack spacing={2} sx={{maxWidth: 360}}>
                    {/* 2. Cada campo dentro de su Controller: value, onChange, onBlur, inputRef y el error */}
                    <Controller name="pickupAt" control={form.control} render={({field, fieldState}) => (
                        <DateTimeInput label="Recoger el" value={field.value} onChange={field.onChange} onBlur={field.onBlur}
                                       inputRef={field.ref} error={fieldState.error?.message} disablePast minutesStep={30} />
                    )} />
                    <Controller name="pickupWindowEnd" control={form.control} render={({field, fieldState}) => (
                        <TimeInput label="A más tardar a las" value={field.value} onChange={field.onChange} onBlur={field.onBlur}
                                   inputRef={field.ref} error={fieldState.error?.message} minutesStep={30} />
                    )} />
                    <SubmitButton sx={{alignSelf: 'flex-start'}}>Pedir la recolección</SubmitButton>
                </Stack>
            </form>
        </FormProvider>
    );
};

export default HookFormDates;
