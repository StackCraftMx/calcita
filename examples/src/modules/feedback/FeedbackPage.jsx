// Ejemplo de avisos, confirmación y espera.
//
// Lo que se ve aquí:
//   - useConfirmAction + ConfirmDialog: una acción que sale bien (el recordatorio de pago) y una que el servidor rechaza
//     (cancelar un pedido ya entregado): el motivo del 409 se queda en el mismo diálogo, ya traducido;
//   - cada aviso (toastSuccess, toastInfo, toastWarn, toastError), uno que sigue a una promesa (toastPromise) y uno a
//     partir del error de un 422 de verdad del servidor (toastProblem enumera los mensajes de cada campo);
//   - ModalWaiting: la espera que bloquea la pantalla mientras termina algo que no se debe cortar;
//   - NewBuildNotice (montado en AppShell): el botón simula que el servidor anunció otra compilación.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
    ConfirmDialog, ModalWaiting, PageHeading, SectionCard, newIdentifier, reportPublishedBuild, toastError, toastInfo, toastProblem,
    toastPromise, toastSuccess, toastWarn, useConfirmAction, useToolkitTranslation,
} from '@stackcraftmx/calcita';

import {
    SIMULATED_RESPONSES, cancelOrder, createCustomer, getPendingReminders, sendPendingReminders,
} from '@/modules/feedback/feedbackApi.js';

// un pedido que ya se entregó: en los datos de mentira siempre es el mismo, así el servidor siempre lo rechaza
const DELIVERED_ORDER = Object.freeze({id: 1004, number: 'P-1004'});
// lo que tardan las esperas inventadas de esta pantalla
const PROMISE_MILLISECONDS = 2000;
const MONTH_CLOSING_MILLISECONDS = 3000;

// la compilación que «anuncia el servidor» al simular: cualquiera distinta a APP_BUILD_ID prende el aviso
const SIMULATED_PUBLISHED_BUILD_ID = 'ejemplos-nueva';

/**
 * Una espera que se cumple sola, en lugar de una petición de verdad.
 *
 * @param {number} milliseconds
 * @returns {Promise<void>}
 */
const waitFor = (milliseconds) => new Promise((done) => setTimeout(done, milliseconds));

export const FeedbackPage = () => {
    const {t} = useToolkitTranslation('feedback');
    const [reminderCustomers, setReminderCustomers] = useState(null);
    const [isClosingMonth, setIsClosingMonth] = useState(false);

    // a cuántos clientes les llegaría el recordatorio: la confirmación lo dice con su número
    useEffect(() => {
        const abortController = new AbortController();
        getPendingReminders(abortController.signal)
            .then((reminders) => setReminderCustomers(reminders.customers))
            .catch((error) => {
                if (!abortController.signal.aborted) {
                    toastProblem(error);
                }
            });
        return () => abortController.abort();
    }, []);

    const reminders = useConfirmAction({
        run: () => sendPendingReminders(),
        onDone: (response) => toastSuccess(response.message),
    });
    const deliveredCancel = useConfirmAction({
        run: ({subject}) => cancelOrder(subject.id, t('confirm.cancelReason')),
        onDone: (response) => toastSuccess(response.message),
    });

    // un alta vacía: el servidor contesta 422 con un mensaje por campo y toastProblem los enumera
    const showServerProblem = () => {
        createCustomer({id: newIdentifier(), name: '', email: '', phone: '', customer_type: ''}, SIMULATED_RESPONSES.normal)
            .catch((error) => toastProblem(error));
    };

    const showPromise = () => toastPromise(waitFor(PROMISE_MILLISECONDS), {
        loading: t('toasts.promiseLoading'),
        success: t('toasts.promiseSuccess'),
        error: t('toasts.promiseError'),
    });

    // en un proyecto real esto lo hace el cliente HTTP con cada respuesta, con la compilación que anuncia el servidor:
    //   axiosClient.interceptors.response.use((response) => {
    //       reportPublishedBuild(response.headers['x-frontend-build']);
    //       return response;
    //   });
    const simulateNewBuild = () => reportPublishedBuild(SIMULATED_PUBLISHED_BUILD_ID);

    const closeMonth = async () => {
        setIsClosingMonth(true);
        await waitFor(MONTH_CLOSING_MILLISECONDS);
        setIsClosingMonth(false);
        toastSuccess(t('waiting.done'));
    };

    return (
        <>
            <PageHeading title={t('page.title')} description={t('page.subtitle')} />
            <Stack spacing={2}>
                <SectionCard title={t('confirm.title')}>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('confirm.text')}</Typography>
                    <Stack direction={{xs: 'column', sm: 'row'}} spacing={1.5}>
                        <Button variant="contained" disabled={reminderCustomers === null} onClick={() => reminders.open({})}>
                            {t('confirm.reminders')}
                        </Button>
                        <Button variant="outlined" color="error" onClick={() => deliveredCancel.open(DELIVERED_ORDER)}>
                            {t('confirm.cancelDelivered', {number: DELIVERED_ORDER.number})}
                        </Button>
                    </Stack>
                </SectionCard>

                <SectionCard title={t('toasts.title')}>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('toasts.text')}</Typography>
                    <Stack direction="row" spacing={1.5} useFlexGap sx={{flexWrap: 'wrap'}}>
                        <Button variant="outlined" color="success" onClick={() => toastSuccess(t('toasts.successMessage'))}>{t('toasts.success')}</Button>
                        <Button variant="outlined" color="info" onClick={() => toastInfo(t('toasts.infoMessage'))}>{t('toasts.info')}</Button>
                        <Button variant="outlined" color="warning" onClick={() => toastWarn(t('toasts.warningMessage'))}>{t('toasts.warning')}</Button>
                        <Button variant="outlined" color="error" onClick={() => toastError(t('toasts.errorMessage'))}>{t('toasts.error')}</Button>
                        <Button variant="outlined" onClick={showPromise}>{t('toasts.promise')}</Button>
                        <Button variant="outlined" color="error" onClick={showServerProblem}>{t('toasts.problem')}</Button>
                    </Stack>
                </SectionCard>

                <SectionCard title={t('waiting.title')}>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('waiting.text')}</Typography>
                    <Button variant="contained" onClick={closeMonth}>{t('waiting.start')}</Button>
                </SectionCard>

                <SectionCard title={t('newBuild.title')}>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('newBuild.text')}</Typography>
                    <Button variant="outlined" color="warning" onClick={simulateNewBuild}>{t('newBuild.simulate')}</Button>
                </SectionCard>
            </Stack>

            <ConfirmDialog
                {...reminders.dialogProps}
                title={t('confirm.remindersTitle')}
                description={t('confirm.remindersDescription', {count: reminderCustomers ?? 0})}
                confirmLabel={t('confirm.remindersConfirm')}
            />
            <ConfirmDialog
                {...deliveredCancel.dialogProps}
                title={t('confirm.cancelTitle', {number: DELIVERED_ORDER.number})}
                description={t('confirm.cancelDescription', {number: DELIVERED_ORDER.number})}
                confirmLabel={t('confirm.cancelConfirm')}
                tone="error"
            />
            <ModalWaiting open={isClosingMonth} title={t('waiting.modalTitle')} text={t('waiting.modalText')} />
        </>
    );
};
