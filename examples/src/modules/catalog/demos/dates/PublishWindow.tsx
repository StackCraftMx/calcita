// Publicar algo con anticipación (una subasta, una oferta): el inicio, al menos 5 minutos después de ahora, y el fin, al
// menos 30 minutos después del inicio. El mínimo del inicio se recorre solo con el reloj mientras el formulario está
// abierto; si el inicio alcanza al fin, el fin se recorre con él. Yup revisa lo mismo al guardar y el servidor otra vez.
import {useEffect, useMemo} from 'react';
import Stack from '@mui/material/Stack';
import {FormSection, toastProblem, toastSuccess} from '@stackcraftmx/calcita';
import {
    FormDateTimeField, earliestInstantFromNow, instantPlusMinutes, minutesAfterRule, minutesFromNowRule,
} from '@stackcraftmx/calcita/date-pickers';
import {Form, Formik, SubmitButton, Yup, useFormikContext} from '@stackcraftmx/calcita/forms';

// las reglas del negocio, con nombre: en un proyecto salen de su configuración
const PUBLISH_LEAD_MINUTES = 5;
const MINIMUM_DURATION_MINUTES = 30;

type OfferValues = {startsAt: string, endsAt: string};

// ─── El servidor de mentira (en su proyecto NO va): vuelve a revisar, porque entre llenar y guardar pasa el tiempo ───
const publishOffer = async (values: OfferValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (Date.parse(values.startsAt) < Date.parse(earliestInstantFromNow(PUBLISH_LEAD_MINUTES))) {
        throw new Error(`La oferta debe empezar al menos ${PUBLISH_LEAD_MINUTES} minutos después de ahora.`);
    }
    return {message: `Publicada: ${JSON.stringify(values)}`};
};

// 1. El fin se recorre con el inicio: si el inicio lo alcanza, el fin queda en inicio + la duración mínima
const EndFollowsStart = () => {
    const {values, setFieldValue} = useFormikContext<OfferValues>();
    useEffect(() => {
        const earliestEnd = instantPlusMinutes(values.startsAt, MINIMUM_DURATION_MINUTES);
        if (earliestEnd && values.endsAt && Date.parse(values.endsAt) < Date.parse(earliestEnd)) {
            setFieldValue('endsAt', earliestEnd);
        }
        // solo cuando cambia el inicio: si la persona mueve el fin, yup le dice si no alcanza
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.startsAt]);
    return null;
};

const PublishWindow = () => {
    // 2. Las reglas en yup: la hora se toma al revisar, no al armar el esquema
    const schema = useMemo(() => Yup.object({
        startsAt: Yup.string().required().test(minutesFromNowRule(PUBLISH_LEAD_MINUTES)),
        endsAt: Yup.string().required().test(minutesAfterRule('startsAt', MINIMUM_DURATION_MINUTES)),
    }), []);
    const initialValues = useMemo<OfferValues>(() => {
        const startsAt = earliestInstantFromNow(PUBLISH_LEAD_MINUTES);
        return {startsAt, endsAt: instantPlusMinutes(startsAt, MINIMUM_DURATION_MINUTES)};
    }, []);

    return (
        <Formik initialValues={initialValues} validationSchema={schema}
                onSubmit={async (values) => {
                    try {
                        toastSuccess((await publishOffer(values)).message);
                    } catch (error) {
                        toastProblem(error as Error);
                    }
                }}>
            {({values}) => (
                <Form noValidate>
                    <EndFollowsStart />
                    <Stack spacing={2} sx={{maxWidth: 560}}>
                        {/* 3. Los campos: el inicio con su mínimo que se recorre; el fin, con el suyo desde el inicio */}
                        <FormSection title="Publicar la oferta">
                            <FormDateTimeField name="startsAt" label="Empieza" minimumMinutesFromNow={PUBLISH_LEAD_MINUTES}
                                               helperText={`Al menos ${PUBLISH_LEAD_MINUTES} minutos después de ahora`} />
                            <FormDateTimeField name="endsAt" label="Termina" minDateTime={instantPlusMinutes(values.startsAt, MINIMUM_DURATION_MINUTES)}
                                               helperText={`Dura al menos ${MINIMUM_DURATION_MINUTES} minutos`} />
                        </FormSection>
                        <SubmitButton sx={{alignSelf: 'flex-start'}}>Publicar</SubmitButton>
                    </Stack>
                </Form>
            )}
        </Formik>
    );
};

export default PublishWindow;
