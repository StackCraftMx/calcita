// Hecho en Calcita · la cuenta: entrar con su segundo paso, «¿Olvidó su contraseña?», elegir una contraseña nueva, Mi perfil
// y su seguridad vienen hechos en @stackcraftmx/calcita/account; el proyecto solo escribe el conector. Cada sección dice para
// qué sirve en una línea, enseña el código mínimo y trae su tabla «Cómo se extiende». Las pantallas se ven funcionando en la
// misma app de ejemplos (las ligas de arriba).
//
// Lo renderiza la app: arrow (regla de la casa).
import {Link as RouterLink} from 'react-router';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import {PageHeading, SectionCard, useToolkitTranslation} from '@stackcraftmx/calcita';

import {APP_PATHS} from '@/core';
import {CodeSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';

const loadRestSetup = () => import('@/modules/catalog/demos/account/AccountRestSetup.tsx?demo-source');
const loadCustomConnector = () => import('@/modules/catalog/demos/account/AccountCustomConnector.ts?demo-source');
const loadDemoSetup = () => import('@/modules/catalog/demos/account/AccountDemoSetup.ts?demo-source');
const loadGreeting = () => import('@/modules/catalog/demos/account/AccountGreeting.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (account.<sección>.extend.<id>)
const REST_EXTENSIONS = [
    {id: 'connector', option: 'createRestAccountConnector(apiClient)', example: 'createRestAccountConnector(createApiClient({baseUrl: API_URL}))'},
    {id: 'provider', option: '<AccountProvider connector>', example: '<AccountProvider connector={accountConnector}>{(canAccess) => …}</AccountProvider>'},
    {id: 'refreshKey', option: 'refreshKey', example: '<AccountProvider refreshKey={language} …>'},
    {id: 'initialSession', option: 'initialSession', example: '<AccountProvider initialSession={sessionFromServer} …>'},
    {id: 'forgotPasswordPath', option: 'forgotPasswordPath', example: '<SignInScreen forgotPasswordPath="/forgot-password" />'},
    {id: 'homePath', option: 'homePath', example: '<SignInScreen homePath="/dashboard" />'},
    {id: 'footer', option: 'footer', example: '<SignInScreen footer={<GoogleSignInButton />} />'},
    {id: 'brand', option: 'logo · brandName', example: '<SignInScreen logo={<Logo />} brandName="Mi tienda" />'},
    {id: 'toggles', option: 'showLanguageToggle · showColorSchemeToggle', example: '<SignInScreen showLanguageToggle={false} />'},
    {id: 'tokenParam', option: 'tokenParam', example: '<ResetPasswordScreen tokenParam="code" signInPath="/sign-in" />'},
    {id: 'showColorScheme', option: 'showColorScheme', example: '<ProfileScreen showColorScheme={false} />'},
    {id: 'extraFields', option: 'ProfileScreen extraFields', example: "extraFields={{initialValues: (user) => ({department: user.department ?? ''}), rules: {department: Yup.string().required()}, fields: <FormSelectField name=\"department\" … />}}"},
    {id: 'extraTabs', option: 'ProfileScreen extraTabs · hiddenTabs', example: "extraTabs={[{key: 'billing', label: 'Facturación', content: <BillingSection />}]} hiddenTabs={['preferences']}"},
    {id: 'profileEvents', option: 'ProfileScreen onTabChange · onProfileSaved', example: 'onProfileSaved={({values, response}) => analytics.track(\'profile_saved\')}'},
    {id: 'profileTexts', option: 'ProfileScreen texts', example: "texts={{profile: {tabs: {data: 'Mis datos'}}}}"},
];
const CUSTOM_EXTENSIONS = [
    {id: 'paths', option: 'paths', example: "createRestAccountConnector(apiClient, {paths: {session: '/me'}})"},
    {id: 'override', option: '{...conector, signIn}', example: '{...createRestAccountConnector(apiClient), signIn: async (credentials) => …}'},
    {id: 'type', option: 'AccountConnector', example: 'const accountConnector: AccountConnector = {…};'},
];
const DEMO_EXTENSIONS = [
    {id: 'user', option: 'user', example: "user: {id: 'u-1', name: 'Ana Martínez', email: 'ana@ejemplo.com'}"},
    {id: 'access', option: 'roles · abilities', example: "roles: ['admin'], abilities: ['orders.view']"},
    {id: 'labels', option: 'labels', example: "labels: ['Administración']"},
    {id: 'storageKey', option: 'storageKey', example: "storageKey: 'mi-tienda:session'"},
    {id: 'qr', option: 'toQrImageUrl', example: '(url) => QRCode.toDataURL(url)'},
    {id: 'issuer', option: 'issuer', example: "issuer: 'Mi tienda'"},
    {id: 'delay', option: 'delayMilliseconds', example: 'delayMilliseconds: 600'},
];
const SESSION_EXTENSIONS = [
    {id: 'session', option: 'session', example: 'const {session} = useAccount();'},
    {id: 'refreshSession', option: 'refreshSession()', example: 'await refreshSession();'},
    {id: 'signOut', option: 'signOut()', example: '<Button onClick={signOut}>Salir</Button>'},
    {id: 'connectorAccess', option: 'connector', example: 'const {connector} = useAccount();'},
];

export const AccountPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `account.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('account.title')} description={t('account.description')} />
            <SectionCard title={t('account.live.title')}>
                <Stack direction="row" spacing={1} useFlexGap sx={{flexWrap: 'wrap'}}>
                    <Button component={RouterLink} to={APP_PATHS.profile} variant="outlined">{t('account.live.profile')}</Button>
                    <Button component={RouterLink} to={`${APP_PATHS.profile}?tab=security`} variant="outlined">{t('account.live.security')}</Button>
                </Stack>
            </SectionCard>
            <CodeSection title={t('account.rest.title')} description={t('account.rest.description')}
                         extensions={rowsOf('rest', REST_EXTENSIONS)} loadSource={loadRestSetup} />
            <CodeSection title={t('account.custom.title')} description={t('account.custom.description')}
                         extensions={rowsOf('custom', CUSTOM_EXTENSIONS)} loadSource={loadCustomConnector} />
            <CodeSection title={t('account.demo.title')} description={t('account.demo.description')}
                         extensions={rowsOf('demo', DEMO_EXTENSIONS)} loadSource={loadDemoSetup} />
            <CodeSection title={t('account.session.title')} description={t('account.session.description')}
                         extensions={rowsOf('session', SESSION_EXTENSIONS)} loadSource={loadGreeting} />
        </Stack>
    );
};
