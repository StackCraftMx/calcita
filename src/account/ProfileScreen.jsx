// Mi perfil, completo: quién está dentro (ProfileHeader con sus perfiles como chips) y tres pestañas:
//   - Sus datos: nombre y teléfono (el correo se ve pero no se cambia aquí); al guardar se vuelve a leer la sesión, así la
//     barra y el menú de la cuenta ya dicen el nombre nuevo;
//   - Seguridad: AccountSecuritySection (contraseña, dos pasos, sesiones y bitácora);
//   - Preferencias: AppearanceSettings (tamaño de letra, idioma y modo de color).
// La pestaña abierta va en la dirección (?tab=): se puede compartir o recargar sin perderla. Lo del servidor sale del
// conector de la cuenta.
//
// Se extiende sin tocar el framework (cada proyecto tiene su perfil «especial»):
//   - extraFields: campos propios en «Sus datos» (el área, el número de empleado…), con su valor de inicio sacado del usuario
//     de la sesión, sus reglas de yup y sus campos. Al guardar viajan a connector.updateProfile junto con name y phone: un
//     backend que ya existe recibe lo suyo con sus nombres;
//   - extraTabs: pestañas propias después de las de la casa (facturación, notificaciones…); hiddenTabs esconde las de la casa;
//   - eventos: onTabChange y onProfileSaved (lo guardado y lo que contestó el servidor);
//   - texts: cualquier texto, con la forma de `account` en los textos del paquete.
//
//   <ProfileScreen />
//
// Se cambia desde el tema del proyecto, como las piezas de MUI: components.CalcitaProfileScreen con defaultProps y
// styleOverrides de sus partes: sectionTitle, form, preferences.
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
import {piecePart, usePieceProps} from '@/theme/themePieces.js';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

// el nombre de la pieza en el tema y sus partes (theme.components.CalcitaProfileScreen)
const THEME_NAME = 'CalcitaProfileScreen';
const ProfileScreenSectionTitle = piecePart(THEME_NAME, 'SectionTitle', Typography);
const ProfileScreenForm = piecePart(THEME_NAME, 'Form', Stack);
const ProfileScreenPreferences = piecePart(THEME_NAME, 'Preferences', Stack);

/** Las pestañas, en el orden en que se pintan. */
export const PROFILE_TAB = Object.freeze({data: 'data', security: 'security', preferences: 'preferences'});
const TAB_PARAM = 'tab';
// el teléfono: dígitos, con + opcional al inicio (formato internacional); lo largo que permite el plan de numeración
const PHONE_PATTERN = /^\+?\d{7,15}$/;
// lo ancho de los formularios: un renglón cómodo, no toda la pantalla
const FORM_MAX_WIDTH = 520;

/**
 * Sus datos: nombre, teléfono y los campos propios del proyecto (extraFields).
 *
 * @param {object} props
 * @param {object} [props.extraFields]
 * @param {Function} [props.onProfileSaved]
 * @param {object} [props.texts]
 */
function ProfileDataSection({extraFields, onProfileSaved, texts}) {
    const {t} = useToolkitTranslation('account', texts);
    const {connector, session, refreshSession} = useAccount();
    const extraRules = extraFields?.rules;
    // el esquema se arma al pintar: yup toma sus mensajes al armarlo. Las reglas propias se suman a las de la casa
    const schema = useMemo(() => Yup.object({
        name: Yup.string().trim().required(),
        phone: Yup.string().trim().matches(PHONE_PATTERN, {message: {key: 'account:profile.data.phoneInvalid'}, excludeEmptyString: true}),
        ...extraRules,
    }), [extraRules]);
    const initialValues = {name: session.user.name ?? '', phone: session.user.phone ?? '', ...extraFields?.initialValues?.(session.user)};

    const save = async (values, formikHelpers) => {
        // lo de la casa limpio de espacios; lo propio, tal como lo dejaron sus campos
        const profile = {...values, name: values.name.trim(), phone: values.phone.trim()};
        try {
            const response = await connector.updateProfile(profile);
            await refreshSession();
            toastSuccess(response?.message ?? t('profile.data.saved'));
            onProfileSaved?.({values: profile, response});
        } catch (error) {
            applyServerProblem(error, {...formikHelpers, values});
        }
    };

    return (
        <SectionCard title={t('profile.data.title')}>
            <ProfileScreenSectionTitle variant="body2" color="text.secondary" ownSx={{mb: 2}}>{t('profile.data.text')}</ProfileScreenSectionTitle>
            <Formik initialValues={initialValues} validationSchema={schema} onSubmit={save}>
                <Form noValidate>
                    <ProfileScreenForm spacing={2} ownSx={{maxWidth: FORM_MAX_WIDTH}}>
                        <FormProblemAlert />
                        <FormTextField name="name" label={t('profile.data.name')} autoComplete="name" />
                        {/* el correo se ve con el mismo estilo de los demás campos, pero no se cambia aquí */}
                        <TextInput name="email" label={t('profile.data.email')} value={session.user.email} onChange={() => {}}
                                   helperText={t('profile.data.emailHelp')} disabled />
                        <FormTextField name="phone" label={t('profile.data.phone')} type="tel" autoComplete="tel" inputMode="tel" />
                        {extraFields?.fields}
                        <SubmitButton sx={{alignSelf: 'flex-start'}}>{t('profile.data.save')}</SubmitButton>
                    </ProfileScreenForm>
                </Form>
            </Formik>
        </SectionCard>
    );
}

/** @typedef {import('@/account/accountConnector.js').AccountUser} AccountUser */

/**
 * @param {object} props
 * @param {boolean} [props.showColorScheme] el ajuste de claro u oscuro en Preferencias; sin modo oscuro, false
 * @param {{initialValues?: (user: AccountUser & Record<string, any>) => Record<string, any>, rules?: Record<string, any>, fields: import('react').ReactNode}} [props.extraFields]
 *     campos propios en «Sus datos», debajo del teléfono: sus valores de inicio salen del usuario de la sesión (lo que su
 *     conector ponga en session.user), sus reglas de yup y sus campos (FormTextField, FormSelectField… de /forms). Al guardar
 *     viajan a connector.updateProfile junto con name y phone
 * @param {Array<{key: string, label: string, content: import('react').ReactNode}>} [props.extraTabs] pestañas propias,
 *     después de las de la casa; label ya traducido
 * @param {Array<'data'|'security'|'preferences'>} [props.hiddenTabs] pestañas de la casa que no se ven (PROFILE_TAB)
 * @param {(tab: string) => void} [props.onTabChange] cada que se cambia de pestaña
 * @param {(saved: {values: Record<string, any>, response: unknown}) => void} [props.onProfileSaved] después de guardar «Sus datos»
 * @param {object} [props.texts] los textos que cambian, con la forma de `account` en los textos del paquete:
 *     {profile: {tabs: {data: 'Mis datos'}}}
 */
export default function ProfileScreen(props) {
    // lo que el proyecto puso en su tema (components.CalcitaProfileScreen.defaultProps) y encima lo que llega aquí
    const {
    showColorScheme = true, extraFields, extraTabs = [], hiddenTabs = [], onTabChange, onProfileSaved, texts,
    ...unknownProps
} = usePieceProps(props, THEME_NAME);
    warnUnknownProps(THEME_NAME, unknownProps);
    const {t} = useToolkitTranslation('account', texts);
    const {session} = useAccount();
    const {useNavigate, useLocation} = useToolkitNavigation();
    const navigate = useNavigate();
    const {pathname, search} = useLocation();
    // las pestañas que se ven: las de la casa que no se escondieron y luego las del proyecto
    const tabs = [
        ...Object.values(PROFILE_TAB).filter((tab) => !hiddenTabs.includes(tab)).map((tab) => ({key: tab, label: t(`profile.tabs.${tab}`)})),
        ...extraTabs.map(({key, label}) => ({key, label})),
    ];
    const requestedTab = new URLSearchParams(search).get(TAB_PARAM);
    const activeTab = tabs.some((tab) => tab.key === requestedTab) ? requestedTab : tabs[0]?.key;
    const activeExtraTab = extraTabs.find((tab) => tab.key === activeTab);
    const changeTab = (tab) => {
        navigate(`${pathname}?${TAB_PARAM}=${tab}`, {replace: true});
        onTabChange?.(tab);
    };

    // guard clause: sin sesión no hay perfil que enseñar (el marco de la app ya lleva a entrar)
    if (!session) {
        return null;
    }

    return (
        <Stack spacing={2}>
            <ProfileHeader name={session.user.name} email={session.user.email} subtitle={session.user.subtitle} avatarUrl={session.user.avatarUrl}
                           chips={session.labels ?? []} />
            <Tabs value={activeTab} onChange={(event, tab) => changeTab(tab)} aria-label={t('profile.tabs.label')}
                  variant="scrollable" allowScrollButtonsMobile>
                {tabs.map((tab) => <Tab key={tab.key} value={tab.key} label={tab.label} />)}
            </Tabs>
            {activeTab === PROFILE_TAB.data && <ProfileDataSection extraFields={extraFields} onProfileSaved={onProfileSaved} texts={texts} />}
            {activeTab === PROFILE_TAB.security && <AccountSecuritySection />}
            {activeTab === PROFILE_TAB.preferences && (
                <SectionCard title={t('profile.preferences.title')}>
                    <ProfileScreenSectionTitle variant="body2" color="text.secondary" ownSx={{mb: 1}}>{t('profile.preferences.text')}</ProfileScreenSectionTitle>
                    <ProfileScreenPreferences ownSx={{maxWidth: FORM_MAX_WIDTH, mx: -1}}>
                        <AppearanceSettings showColorScheme={showColorScheme} />
                    </ProfileScreenPreferences>
                </SectionCard>
            )}
            {activeExtraTab?.content}
        </Stack>
    );
}
