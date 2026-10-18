// Mi perfil, completo: quién está dentro (ProfileHeader con sus perfiles como chips) y tres pestañas:
//   - Sus datos: nombre y teléfono (el correo se ve pero no se cambia aquí); al guardar se vuelve a leer la sesión, así la
//     barra y el menú de la cuenta ya dicen el nombre nuevo;
//   - Seguridad: AccountSecuritySection (contraseña, dos pasos, sesiones y bitácora);
//   - Preferencias: AppearanceSettings (tamaño de letra, idioma y modo de color).
// La pestaña abierta va en la dirección (?tab=): se puede compartir o recargar sin perderla. Lo del servidor sale del
// conector de la cuenta.
//
//   <ProfileScreen />
//
// Genérico del paquete: function (regla de la casa).
import {useMemo} from 'react';
import {Form, Formik} from 'formik';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import AccountSecuritySection from '@/account/AccountSecuritySection.jsx';
import {useAccount} from '@/account/AccountProvider.jsx';
import AppearanceSettings from '@/appShell/AppearanceSettings.jsx';
import {toastSuccess} from '@/feedback/toast.jsx';
import FormProblemAlert from '@/forms/FormProblemAlert.jsx';
import FormTextField from '@/forms/FormTextField.jsx';
import SubmitButton from '@/forms/SubmitButton.jsx';
import {applyServerProblem} from '@/forms/applyServerProblem.js';
import {Yup} from '@/forms/validation.js';
import TextInput from '@/inputs/TextInput.jsx';
import {useToolkitNavigation} from '@/toolkit/toolkitContext.js';
import {useToolkitTranslation} from '@/toolkit/useToolkitTranslation.js';
import ProfileHeader from '@/ui/layout/ProfileHeader.jsx';
import SectionCard from '@/ui/layout/SectionCard.jsx';

/** Las pestañas, en el orden en que se pintan. */
export const PROFILE_TAB = Object.freeze({data: 'data', security: 'security', preferences: 'preferences'});
const TAB_PARAM = 'tab';
// el teléfono: dígitos, con + opcional al inicio (formato internacional); lo largo que permite el plan de numeración
const PHONE_PATTERN = /^\+?\d{7,15}$/;
// lo ancho de los formularios: un renglón cómodo, no toda la pantalla
const FORM_MAX_WIDTH = 520;

/** Sus datos: nombre y teléfono. */
function ProfileDataSection() {
    const {t} = useToolkitTranslation('account');
    const {connector, session, refreshSession} = useAccount();
    // el esquema se arma al pintar: yup toma sus mensajes al armarlo
    const schema = useMemo(() => Yup.object({
        name: Yup.string().trim().required(),
        phone: Yup.string().trim().matches(PHONE_PATTERN, {message: {key: 'account:profile.data.phoneInvalid'}, excludeEmptyString: true}),
    }), []);

    const save = async (values, formikHelpers) => {
        try {
            const response = await connector.updateProfile({name: values.name.trim(), phone: values.phone.trim()});
            await refreshSession();
            toastSuccess(response?.message ?? t('profile.data.saved'));
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <SectionCard title={t('profile.data.title')}>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('profile.data.text')}</Typography>
            <Formik initialValues={{name: session.user.name ?? '', phone: session.user.phone ?? ''}} validationSchema={schema} onSubmit={save}>
                <Form noValidate>
                    <Stack spacing={2} sx={{maxWidth: FORM_MAX_WIDTH}}>
                        <FormProblemAlert />
                        <FormTextField name="name" label={t('profile.data.name')} autoComplete="name" />
                        {/* el correo se ve con el mismo estilo de los demás campos, pero no se cambia aquí */}
                        <TextInput name="email" label={t('profile.data.email')} value={session.user.email} onChange={() => {}}
                                   helperText={t('profile.data.emailHelp')} disabled />
                        <FormTextField name="phone" label={t('profile.data.phone')} type="tel" autoComplete="tel" inputMode="tel" />
                        <SubmitButton sx={{alignSelf: 'flex-start'}}>{t('profile.data.save')}</SubmitButton>
                    </Stack>
                </Form>
            </Formik>
        </SectionCard>
    );
}

/**
 * @param {object} props
 * @param {boolean} [props.showColorScheme] el ajuste de claro u oscuro en Preferencias; sin modo oscuro, false
 */
export default function ProfileScreen({showColorScheme = true}) {
    const {t} = useToolkitTranslation('account');
    const {session} = useAccount();
    const {useNavigate, useLocation} = useToolkitNavigation();
    const navigate = useNavigate();
    const {pathname, search} = useLocation();
    const requestedTab = new URLSearchParams(search).get(TAB_PARAM);
    const activeTab = Object.values(PROFILE_TAB).includes(requestedTab) ? requestedTab : PROFILE_TAB.data;

    // guard clause: sin sesión no hay perfil que enseñar (el marco de la app ya lleva a entrar)
    if (!session) {
        return null;
    }

    return (
        <Stack spacing={2}>
            <ProfileHeader name={session.user.name} email={session.user.email} subtitle={session.user.subtitle} avatarUrl={session.user.avatarUrl}
                           chips={session.labels ?? []} />
            <Tabs value={activeTab} onChange={(event, tab) => navigate(`${pathname}?${TAB_PARAM}=${tab}`, {replace: true})}
                  aria-label={t('profile.tabs.label')}>
                {Object.values(PROFILE_TAB).map((tab) => <Tab key={tab} value={tab} label={t(`profile.tabs.${tab}`)} />)}
            </Tabs>
            {activeTab === PROFILE_TAB.data && <ProfileDataSection />}
            {activeTab === PROFILE_TAB.security && <AccountSecuritySection />}
            {activeTab === PROFILE_TAB.preferences && (
                <SectionCard title={t('profile.preferences.title')}>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>{t('profile.preferences.text')}</Typography>
                    <Stack sx={{maxWidth: FORM_MAX_WIDTH, mx: -1}}>
                        <AppearanceSettings showColorScheme={showColorScheme} />
                    </Stack>
                </SectionCard>
            )}
        </Stack>
    );
}
