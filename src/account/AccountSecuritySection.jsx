// La seguridad de la cuenta, completa: cambiar la contraseña (ChangePasswordForm), la verificación en dos pasos
// (TwoStepVerificationCard: llaves de acceso, app autenticadora y códigos de recuperación), las sesiones abiertas
// (SessionsCard) y la bitácora (ActivityLog). Todo lo del servidor sale del conector de la cuenta.
//
// Las llaves de acceso se crean aquí con el navegador (createPasskey) y la respuesta va al servidor (savePasskey). La
// bitácora se vuelve a pedir después de cada cambio: así se ve aparecer lo que se acaba de hacer.
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaAccountSecurity con defaultProps y
// styleOverrides de sus partes: title, form.
//
// Genérico del paquete: function (regla de la casa).
import {useCallback, useEffect, useMemo, useState} from 'react';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {useAccount} from '@/account/AccountProvider.jsx';
import DemoTotpCodeButton from '@/account/DemoTotpCodeButton.jsx';
import ChangePasswordForm from '@/forms/auth/ChangePasswordForm.jsx';
import TwoStepVerificationCard from '@/forms/security/TwoStepVerificationCard.jsx';
import ActivityLog from '@/security/ActivityLog.jsx';
import {createPasskey, passkeysSupported} from '@/security/passkeys.js';
import SessionsCard from '@/security/SessionsCard.jsx';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import SectionCard from '@/ui/layout/SectionCard.jsx';
import {piecePart, usePieceProps} from '@/theme/themePieces.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaAccountSecurity)
const THEME_NAME = 'CalcitaAccountSecurity';
const SecurityTitle = piecePart(THEME_NAME, 'Title', Typography);
const SecurityForm = piecePart(THEME_NAME, 'Form', Stack);

// lo ancho del formulario de la contraseña: un renglón cómodo
const FORM_MAX_WIDTH = 520;
const LOADING_HEIGHT_PIXELS = 220;

/**
 * @param {object} props
 * @param {boolean} [props.showPasswordChange] por omisión sí
 * @param {object} [props.texts] los textos que cambian, con la forma de `account` en los textos del paquete
 */
export default function AccountSecuritySection(props) {
    // lo que el proyecto puso en su tema (components.CalcitaAccountSecurity.defaultProps) y encima lo que llega aquí
    const {showPasswordChange = true, texts} = usePieceProps(props, THEME_NAME);
    const {t} = useToolkitTranslation('account', texts);
    const {connector, session} = useAccount();
    const [security, setSecurity] = useState(null);
    const [sessions, setSessions] = useState(null);
    const [events, setEvents] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const isDemo = typeof connector.demoTotpCode === 'function';

    const refreshActivity = useCallback(() => connector.listActivity().then(setEvents).catch((error) => setLoadError(error.message)), [connector]);
    const refreshSessions = useCallback(() => connector.listSessions().then(setSessions).catch((error) => setLoadError(error.message)), [connector]);

    useEffect(() => {
        connector.loadSecurity().then(setSecurity).catch((error) => setLoadError(error.message));
        refreshSessions();
        refreshActivity();
    }, [connector, refreshActivity, refreshSessions]);

    // lo que hace la tarjeta de dos pasos en cada caso, con el conector
    const actions = useMemo(() => ({
        addPasskey: async (name) => connector.savePasskey({name, credential: await createPasskey(await connector.passkeyRegistrationOptions())}),
        removePasskey: (passkey, password) => connector.removePasskey({passkeyId: passkey.id, password}),
        startTotp: async () => ({
            ...await connector.startTotp(),
            // en la demostración, el atajo del código abajo del campo
            extra: isDemo ? <DemoTotpCodeButton loadCode={connector.demoTotpCode} /> : undefined,
        }),
        confirmTotp: (code) => connector.confirmTotp(code),
        disableTotp: (password) => connector.disableTotp(password),
        regenerateRecoveryCodes: (password) => connector.regenerateRecoveryCodes(password),
    }), [connector, isDemo]);

    const changeSecurity = (nextSecurity) => {
        setSecurity(nextSecurity);
        refreshActivity();
    };

    return (
        <Stack spacing={3}>
            {loadError && <Alert severity="error">{loadError}</Alert>}
            {showPasswordChange && (
                <SectionCard title={t('profile.password.title')}>
                    <SecurityTitle variant="body2" color="text.secondary" ownSx={{mb: 2}}>{t('profile.password.text')}</SecurityTitle>
                    <SecurityForm ownSx={{maxWidth: FORM_MAX_WIDTH}}>
                        <ChangePasswordForm onSubmit={async (values) => {
                            await connector.changePassword(values);
                            refreshActivity();
                        }} />
                    </SecurityForm>
                </SectionCard>
            )}
            {security
                ? <TwoStepVerificationCard security={security} onSecurityChange={changeSecurity} actions={actions}
                                           canUsePasskeys={passkeysSupported()} account={session?.user.email}
                                           // en la demostración la llave es de verdad pero el servidor se olvida al recargar:
                                           // se avisa antes de crearla para que nadie se quede con una llave huérfana
                                           passkeyNotice={isDemo ? t('demo.passkeyNote') : undefined} />
                : <Skeleton variant="rounded" height={LOADING_HEIGHT_PIXELS} />}
            {isDemo && <Alert severity="info">{t('demo.securityNote')}</Alert>}
            <SessionsCard sessions={sessions} onCloseOthers={connector.closeOtherSessions} onClosed={() => {
                refreshSessions();
                refreshActivity();
            }} />
            <ActivityLog events={events} />
        </Stack>
    );
}
