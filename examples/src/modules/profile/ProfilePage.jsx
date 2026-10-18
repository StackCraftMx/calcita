// «Mi perfil», como el de las plantillas de tablero de MUI: ProfileHeader (portada, avatar, nombre y perfil) y tres
// pestañas:
//   - Sus datos: el nombre y el teléfono (formik); al guardar, la barra y el menú de la cuenta ya dicen el nombre nuevo;
//   - Seguridad: la contraseña, la verificación en dos pasos, las sesiones abiertas y la bitácora (SecuritySection.jsx);
//   - Preferencias: AppearanceSettings del framework (los mismos ajustes del engrane del teléfono).
// La pestaña abierta va en la URL (?tab=): se puede compartir o recargar sin perderla.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useMemo} from 'react';
import {useSearchParams} from 'react-router';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import {AppearanceSettings, ProfileHeader, SectionCard, TextInput, toastSuccess, useToolkitTranslation} from '@stackcraftmx/calcita';
import {Form, FormProblemAlert, FormTextField, Formik, SubmitButton, Yup, applyServerProblem} from '@stackcraftmx/calcita/forms';

import {useSession} from '@/core';
import {updateMyAccount} from '@/modules/profile/profileApi.js';
import {SecuritySection} from '@/modules/profile/SecuritySection.jsx';

/** Las pestañas, en el orden en que se pintan. */
const PROFILE_TABS = Object.freeze({account: 'account', security: 'security', preferences: 'preferences'});
// el teléfono: 10 dígitos, como lo pide el servidor
const PHONE_PATTERN = /^\d{10}$/;
// lo ancho de los formularios: un renglón cómodo, no toda la pantalla
const FORM_MAX_WIDTH = 520;

/** Sus datos: nombre y teléfono; el correo se ve pero no se cambia aquí. */
const AccountSection = () => {
    const {t} = useToolkitTranslation('profile');
    const {session, refreshSession} = useSession();
    // el esquema se arma al pintar: yup toma sus mensajes al armarlo
    const schema = useMemo(() => Yup.object({
        name: Yup.string().trim().required(),
        phone: Yup.string().matches(PHONE_PATTERN, {message: {key: 'profile:account.phoneInvalid'}, excludeEmptyString: true}),
    }), []);

    const save = async (values, formikHelpers) => {
        try {
            const response = await updateMyAccount(values);
            await refreshSession();
            toastSuccess(response.message);
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <SectionCard title={t('account.title')}>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>{t('account.text')}</Typography>
            <Formik initialValues={{name: session.user.name, phone: session.user.phone ?? ''}} validationSchema={schema} onSubmit={save}>
                <Form noValidate>
                    <Stack spacing={2} sx={{maxWidth: FORM_MAX_WIDTH}}>
                        <FormProblemAlert />
                        <FormTextField name="name" label={t('account.name')} autoComplete="name" />
                        {/* el correo se ve con el mismo estilo de los demás campos, pero no se cambia aquí */}
                        <TextInput name="email" label={t('account.email')} value={session.user.email} onChange={() => {}} helperText={t('account.emailHelp')} disabled />
                        <FormTextField name="phone" label={t('account.phone')} type="tel" autoComplete="tel" inputMode="numeric" />
                        <SubmitButton sx={{alignSelf: 'flex-start'}}>{t('account.save')}</SubmitButton>
                    </Stack>
                </Form>
            </Formik>
        </SectionCard>
    );
};

/** Preferencias: cómo se ve la app. */
const PreferencesSection = () => {
    const {t} = useToolkitTranslation('profile');
    return (
        <SectionCard title={t('preferences.title')}>
            <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>{t('preferences.text')}</Typography>
            <Stack sx={{maxWidth: FORM_MAX_WIDTH, mx: -1}}>
                <AppearanceSettings />
            </Stack>
        </SectionCard>
    );
};

export const ProfilePage = () => {
    const {t} = useToolkitTranslation('profile');
    const {session} = useSession();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedTab = searchParams.get('tab');
    const activeTab = Object.values(PROFILE_TABS).includes(requestedTab) ? requestedTab : PROFILE_TABS.account;

    return (
        <>
            <ProfileHeader name={session.user.name} email={session.user.email} subtitle={session.user.subtitle} chips={[session.profile.name]} />
            <Tabs value={activeTab} onChange={(event, tab) => setSearchParams({tab}, {replace: true})} aria-label={t('tabs.label')} sx={{mb: 2}}>
                {Object.values(PROFILE_TABS).map((tab) => <Tab key={tab} value={tab} label={t(`tabs.${tab}`)} />)}
            </Tabs>
            {activeTab === PROFILE_TABS.account && <AccountSection />}
            {activeTab === PROFILE_TABS.security && <SecuritySection />}
            {activeTab === PROFILE_TABS.preferences && <PreferencesSection />}
        </>
    );
};
