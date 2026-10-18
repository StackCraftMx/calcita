// Entrar, completo: la contraseña (SignInForm) y, si la cuenta tiene verificación en dos pasos, el segundo paso
// (SecondStepForm: la llave de acceso, el código de la app o uno de recuperación). Al terminar se vuelve a leer la sesión y
// se va a la pantalla que se quería abrir (readRedirectParam: solo si es de esta app) o al inicio.
//
// Lo del servidor sale del conector de la cuenta (useAccount): en el proyecto la pantalla solo se pone en su ruta.
//
//   <SignInScreen forgotPasswordPath="/forgot-password" logo={<AppLogo />} />
//
// footer va abajo de la tarjeta. Si es una función, recibe signIn para entrar desde un botón propio (p. ej. «Entrar con la
// cuenta de ejemplo»), con el mismo segundo paso; si falla, el motivo sale arriba del formulario.
//
// Genérico del paquete: function (regla de la casa).
import {useEffect, useState} from 'react';
import Alert from '@mui/material/Alert';

import {useAccount} from '@/account/AccountProvider.jsx';
import DemoTotpCodeButton from '@/account/DemoTotpCodeButton.jsx';
import {AuthLayout} from '@/appShell/AuthLayout.jsx';
import SignInForm from '@/forms/auth/SignInForm.jsx';
import SecondStepForm, {SECOND_STEP_METHOD} from '@/forms/security/SecondStepForm.jsx';
import {readRedirectParam} from '@/navigation.js';
import {passkeysSupported, signWithPasskey} from '@/security/passkeys.js';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';

/**
 * @param {object} props
 * @param {string} [props.homePath] a dónde ir si no se quería abrir otra pantalla; por omisión '/'
 * @param {string} [props.forgotPasswordPath] sin ella no sale «¿Olvidó su contraseña?»
 * @param {import('react').ReactNode} [props.logo]
 * @param {string} [props.brandName] por omisión el appName de ToolkitProvider
 * @param {import('react').ReactNode | ((helpers: {signIn: (credentials: {email: string, password: string, remember?: boolean}) => Promise<void>}) => import('react').ReactNode)} [props.footer]
 * @param {boolean} [props.showLanguageToggle] por omisión sí
 * @param {boolean} [props.showColorSchemeToggle] por omisión sí
 */
export default function SignInScreen({homePath = '/', forgotPasswordPath, logo, brandName, footer, showLanguageToggle = true, showColorSchemeToggle = true}) {
    const {t} = useToolkitTranslation('auth');
    const {connector, session, refreshSession} = useAccount();
    const {useNavigate, useLocation} = useToolkitNavigation();
    const navigate = useNavigate();
    const {search} = useLocation();
    // con verificación en dos pasos: los métodos del segundo paso (la contraseña ya fue correcta)
    const [secondStep, setSecondStep] = useState(null);
    const [notice, setNotice] = useState(null);
    const destination = readRedirectParam(search) ?? homePath;

    // ya hay sesión (acaba de entrar, o abrió esta pantalla estando dentro): a donde iba
    useEffect(() => {
        if (session) {
            navigate(destination, {replace: true});
        }
    }, [session, destination, navigate]);

    // después de la contraseña: el segundo paso si lo pide el servidor; si no, ya está dentro
    const signIn = async (credentials) => {
        setNotice(null);
        const result = await connector.signIn({remember: false, ...credentials});
        if (result?.secondStep) {
            setSecondStep(result.secondStep);
            return;
        }
        await refreshSession();
    };
    // desde un botón propio del footer: el error no tiene formulario donde salir, sale arriba
    const signInFromFooter = async (credentials) => {
        try {
            await signIn(credentials);
        } catch (error) {
            setNotice(error?.message ?? null);
        }
    };
    // se acabaron los intentos o se venció el tiempo: de regreso a la contraseña, con el motivo
    const backToPassword = (message) => {
        setSecondStep(null);
        setNotice(message);
    };

    if (session) {
        return null;
    }

    if (secondStep) {
        const showsDemoCode = typeof connector.demoTotpCode === 'function' && secondStep.methods.includes(SECOND_STEP_METHOD.totp);
        return (
            <AuthLayout logo={logo} brandName={brandName} title={t('security:twoStep.title')}
                        showLanguageToggle={showLanguageToggle} showColorSchemeToggle={showColorSchemeToggle}>
                <SecondStepForm methods={secondStep.methods} canUsePasskeys={passkeysSupported()}
                                onUsePasskey={async () => {
                                    await connector.signInWithPasskey(await signWithPasskey(await connector.secondStepPasskeyOptions()));
                                    await refreshSession();
                                }}
                                onSubmitCode={async ({method, code}) => {
                                    await connector.signInSecondStep({method, code});
                                    await refreshSession();
                                }}
                                onCancel={backToPassword}
                                footer={showsDemoCode && <DemoTotpCodeButton loadCode={connector.demoTotpCode} />} />
            </AuthLayout>
        );
    }

    return (
        <AuthLayout logo={logo} brandName={brandName} title={t('signIn.title')} description={t('signIn.subtitle')}
                    showLanguageToggle={showLanguageToggle} showColorSchemeToggle={showColorSchemeToggle}
                    footer={typeof footer === 'function' ? footer({signIn: signInFromFooter}) : footer}>
            {notice && <Alert severity="warning" sx={{mb: 2}}>{notice}</Alert>}
            <SignInForm onSubmit={signIn} forgotPasswordPath={forgotPasswordPath} />
        </AuthLayout>
    );
}
