// Iniciar sesión: AuthLayout y SignInForm del framework. La pantalla solo dice qué hacer con los datos (signIn) y a dónde
// ir después: a la pantalla que se quería abrir (?next=) o al inicio.
//
// Abajo, solo en los ejemplos, «Entrar como…» con las tres personas: así se ve cómo cambia el menú según el perfil, sin
// escribir contraseñas.
//
// Si la cuenta tiene verificación en dos pasos (se activa en Mi perfil → Seguridad), después de la contraseña sale el
// segundo paso del framework (SecondStepForm): la llave de acceso, el código de la app o un código de recuperación. A
// dónde ir después sale de ?next= con safeInternalPath: una dirección de afuera no se sigue.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo, useState} from 'react';
import {Navigate, useNavigate, useSearchParams} from 'react-router';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {AuthLayout, safeInternalPath, useToolkitTranslation} from '@stackcraftmx/calcita';
import {SECOND_STEP_METHOD, SecondStepForm, SignInForm} from '@stackcraftmx/calcita/forms';
import {passkeysSupported, signWithPasskey} from '@stackcraftmx/calcita/passkeys';

import {APP_PATHS, DemoTotpCodeButton, useSession} from '@/core';
import {
    demoPeopleOf, demoTotpCode, secondStepPasskey, secondStepPasskeyOptions, secondStepRecoveryCode, secondStepTotp, signIn, signInAs,
} from '@/modules/auth/authApi.js';
import {AuthLogo} from '@/modules/auth/AuthLogo.jsx';

// cómo se manda el código de cada método al servidor
const SEND_CODE_BY_METHOD = Object.freeze({
    [SECOND_STEP_METHOD.totp]: secondStepTotp,
    [SECOND_STEP_METHOD.recoveryCode]: secondStepRecoveryCode,
});

/** Los botones de «Entrar como…» de los ejemplos. */
const DemoPeople = ({onChoose, busyUserId}) => {
    // el idioma en que se piden: el nombre del perfil llega en el idioma activo
    const {t, language} = useToolkitTranslation('authExamples');
    const demoPeople = useMemo(() => demoPeopleOf(), [language]);
    return (
        <Paper variant="outlined" sx={{p: 2}}>
            <Typography variant="subtitle2">{t('demoTitle')}</Typography>
            <Typography variant="caption" color="text.secondary" component="p" sx={{mb: 1.5}}>{t('demoText')}</Typography>
            <Stack spacing={1}>
                {demoPeople.map((person) => (
                    <Button key={person.userId} variant="outlined" onClick={() => onChoose(person.userId)} disabled={Boolean(busyUserId)}
                            sx={{justifyContent: 'space-between'}}>
                        <span>{person.name}</span>
                        <Typography component="span" variant="caption" color="text.secondary">{person.profileName}</Typography>
                    </Button>
                ))}
            </Stack>
        </Paper>
    );
};

export const SignInPage = () => {
    const {t} = useToolkitTranslation('auth');
    const {session, refreshSession} = useSession();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [busyUserId, setBusyUserId] = useState(null);
    // con verificación en dos pasos: los métodos del segundo paso (la contraseña ya fue correcta)
    const [secondStep, setSecondStep] = useState(null);
    const [signInNotice, setSignInNotice] = useState(null);
    // a la pantalla de ?next= solo si es de esta app: una dirección de afuera sería una liga para robar sesiones
    const destination = safeInternalPath(searchParams.get('next')) ?? APP_PATHS.home;

    const enter = async () => {
        await refreshSession();
        navigate(destination, {replace: true});
    };

    // después de la contraseña (o de «Entrar como…»): el segundo paso si lo pide el servidor, o adentro
    const continueAfterPassword = async (result) => {
        if (result?.secondStep) {
            setSecondStep(result.secondStep);
            return;
        }
        await enter();
    };

    const signInWithForm = async (credentials) => {
        setSignInNotice(null);
        await continueAfterPassword(await signIn(credentials));
    };

    const signInAsPerson = async (userId) => {
        setSignInNotice(null);
        setBusyUserId(userId);
        try {
            await continueAfterPassword(await signInAs(userId));
        } finally {
            setBusyUserId(null);
        }
    };

    // se acabaron los intentos o se venció el tiempo: de regreso a la contraseña, con el motivo
    const backToPassword = (message) => {
        setSecondStep(null);
        setSignInNotice(message);
    };

    // guard clause: ya hay sesión (alguien abrió esta pantalla estando dentro)
    if (session && !busyUserId && !secondStep) {
        return <Navigate to={destination} replace />;
    }

    if (secondStep) {
        return (
            <AuthLayout logo={<AuthLogo />} brandName={t('shell:title')} title={t('security:twoStep.title')}>
                <SecondStepForm methods={secondStep.methods} canUsePasskeys={passkeysSupported()}
                                onUsePasskey={async () => {
                                    await secondStepPasskey(await signWithPasskey(await secondStepPasskeyOptions()));
                                    await enter();
                                }}
                                onSubmitCode={async ({method, code}) => {
                                    await SEND_CODE_BY_METHOD[method](code);
                                    await enter();
                                }}
                                onCancel={backToPassword}
                                footer={secondStep.methods.includes(SECOND_STEP_METHOD.totp) && <DemoTotpCodeButton loadCode={demoTotpCode} />} />
            </AuthLayout>
        );
    }

    return (
        <AuthLayout logo={<AuthLogo />} brandName={t('shell:title')} title={t('signIn.title')} description={t('signIn.subtitle')}
                    footer={<DemoPeople onChoose={signInAsPerson} busyUserId={busyUserId} />}>
            {signInNotice && <Alert severity="warning" sx={{mb: 2}}>{signInNotice}</Alert>}
            <SignInForm onSubmit={signInWithForm} forgotPasswordPath={APP_PATHS.forgotPassword} />
        </AuthLayout>
    );
};
