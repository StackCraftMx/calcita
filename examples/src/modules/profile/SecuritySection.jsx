// La pestaña «Seguridad» de «Mi perfil»: cambiar la contraseña (ChangePasswordForm), la verificación en dos pasos
// (TwoStepVerificationCard), las sesiones abiertas (SessionsCard) y la bitácora de la cuenta (ActivityLog). Todo es del
// framework; aquí solo se trae cada dato y se conectan las acciones (securityApi.js).
//
// La bitácora se vuelve a pedir después de cada cambio: así se ve aparecer lo que se acaba de hacer.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useCallback, useEffect, useState} from 'react';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {ActivityLog, SectionCard, SessionsCard, useToolkitTranslation} from '@stackcraftmx/calcita';
import {ChangePasswordForm, TwoStepVerificationCard} from '@stackcraftmx/calcita/forms';
import {passkeysSupported} from '@stackcraftmx/calcita/passkeys';

import {DemoTotpCodeButton, useSession} from '@/core';
import {changePassword} from '@/modules/profile/profileApi.js';
import {
    closeOtherSessions, demoTotpCode, loadActivity, loadSecurity, loadSessions, securityActions,
} from '@/modules/profile/securityApi.js';

// lo ancho del formulario de la contraseña: un renglón cómodo
const FORM_MAX_WIDTH = 520;
const LOADING_HEIGHT_PIXELS = 220;

// la app autenticadora con el atajo de los ejemplos abajo del campo del código
const actionsWithDemoCode = {
    ...securityActions,
    startTotp: async () => ({...await securityActions.startTotp(), extra: <DemoTotpCodeButton loadCode={demoTotpCode} />}),
};

export const SecuritySection = () => {
    const {t} = useToolkitTranslation('profile');
    const {session} = useSession();
    const [security, setSecurity] = useState(null);
    const [sessions, setSessions] = useState(null);
    const [events, setEvents] = useState(null);
    const [loadError, setLoadError] = useState(null);

    const refreshActivity = useCallback(() => loadActivity().then(setEvents).catch((error) => setLoadError(error.message)), []);
    const refreshSessions = useCallback(() => loadSessions().then(setSessions).catch((error) => setLoadError(error.message)), []);

    useEffect(() => {
        loadSecurity().then(setSecurity).catch((error) => setLoadError(error.message));
        refreshSessions();
        refreshActivity();
    }, [refreshActivity, refreshSessions]);

    const changeSecurity = (nextSecurity) => {
        setSecurity(nextSecurity);
        refreshActivity();
    };

    return (
        <Stack spacing={3}>
            {loadError && <Alert severity="error">{loadError}</Alert>}
            <SectionCard title={t('security.title')}>
                <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('security.text')}</Typography>
                <Stack sx={{maxWidth: FORM_MAX_WIDTH}}>
                    <ChangePasswordForm onSubmit={async (values) => {
                        await changePassword(values);
                        refreshActivity();
                    }} />
                </Stack>
            </SectionCard>
            {security ? (
                <TwoStepVerificationCard security={security} onSecurityChange={changeSecurity} actions={actionsWithDemoCode}
                                         canUsePasskeys={passkeysSupported()} account={session.user.email} />
            ) : <Skeleton variant="rounded" height={LOADING_HEIGHT_PIXELS} />}
            <Alert severity="info">{t('security.demoNote')}</Alert>
            <SessionsCard sessions={sessions} onCloseOthers={closeOtherSessions} onClosed={() => {
                refreshSessions();
                refreshActivity();
            }} />
            <ActivityLog events={events} />
        </Stack>
    );
};
