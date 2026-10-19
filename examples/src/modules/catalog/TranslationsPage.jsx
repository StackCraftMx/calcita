// Catálogo · traducciones: de dónde salen los textos de Calcita y cómo se traduce lo del proyecto. El paquete trae su propio
// traductor (sin i18next) con la sintaxis de i18next; un proyecto con i18next se conecta con translateWithI18next.
//
// La sección de las llamadas es un ejemplo vivo (cambia con el idioma del menú de la cuenta); las demás solo enseñan su
// código, abierto de entrada: los textos del proyecto, el proveedor, la conexión con i18next y cómo entra Calcita en un
// sistema que ya existe (islas, sin router).
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {PageHeading, SectionCard, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import TranslationCalls from '@/modules/catalog/demos/translations/TranslationCalls.tsx';
// el de i18next va como texto: los ejemplos no instalan i18next y no se puede revisar ni construir
import i18nextSetup from '@/modules/catalog/demos/translations/i18nextSetup.js?raw';

const loadAppTexts = () => import('@/modules/catalog/demos/translations/appTexts.ts?demo-source');
const loadAppProviders = () => import('@/modules/catalog/demos/translations/AppProviders.tsx?demo-source');
const I18NEXT_SOURCES = Object.freeze({js: i18nextSetup});
const loadCalls = () => import('@/modules/catalog/demos/translations/TranslationCalls.tsx?demo-source');
const loadLegacySystem = () => import('@/modules/catalog/demos/translations/LegacySystemSetup.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (translations.<sección>.extend.<id>)
const CALLS_EXTENSIONS = [
    {id: 'hook', option: 'useToolkitTranslation(namespace)', example: "const {t} = useToolkitTranslation('orders');"},
    {id: 'otherNamespace', option: 'namespace:llave', example: "t('common:actions.cancel')"},
    {id: 'values', option: '{{variable}}', example: "t('greeting', {name: user.name})"},
    {id: 'plurals', option: 'count · _one · _other', example: "t('pending', {count: total})"},
    {id: 'defaultValue', option: 'defaultValue', example: "t('help.optional', {defaultValue: ''})"},
];
const TEXTS_EXTENSIONS = [
    {id: 'shape', option: '{es: {namespace: {…}}, en: {…}}', example: "es: {orders: {title: 'Pedidos'}}"},
    {id: 'override', option: 'common.actions.cancel', example: "es: {common: {actions: {cancel: 'Regresar'}}}"},
    {id: 'missing', option: '(lo que falte)', example: "t('orders.nueva')  // → 'orders.nueva' si no existe"},
    {id: 'newLanguage', option: 'toolkitTextsEs', example: 'texts={{pt: {...portugueseToolkitTexts, orders: {…}}}}  // traducidos de toolkitTextsEs'},
];
const PROVIDER_EXTENSIONS = [
    {id: 'language', option: 'language · onLanguageChange', example: '<ToolkitProvider language={language} onLanguageChange={setLanguage}>'},
    {id: 'languages', option: 'languages', example: "languages={[...DEFAULT_LANGUAGES, {code: 'pt', label: 'Português', locale: 'pt-BR'}]}"},
    {id: 'languageToggle', option: '<LanguageToggle onChange texts>', example: "<LanguageToggle onChange={(code) => analytics.track('language', code)} />"},
    {id: 'texts', option: 'texts', example: 'texts={APP_TEXTS}'},
    {id: 'translate', option: 'translate', example: 'translate={translateWithI18next(i18n)}'},
    {id: 'place', option: 'timeZone · currency', example: 'timeZone="America/Mexico_City" currency="MXN"'},
    {id: 'appName', option: 'appName', example: 'appName="Mi tienda"'},
    {id: 'navigation', option: 'navigation', example: 'navigation={reactRouterNavigation}'},
    {id: 'buildId', option: 'buildId', example: 'buildId={import.meta.env.VITE_BUILD_ID}'},
    {id: 'canAccess', option: 'canAccess', example: '<AccountProvider …>{(canAccess) => <ToolkitProvider canAccess={canAccess}>…}'},
    {id: 'nested', option: '<ToolkitProvider> dentro de otro', example: '<ToolkitProvider language="en"><InvoicePreview /></ToolkitProvider>'},
    {id: 'componentTexts', option: 'texts · <ComponentTexts>', example: "<ServerTable texts={{count: {records_other: '{{total}} pedidos'}}} …>"},
];
const LEGACY_EXTENSIONS = [
    {id: 'hash', option: 'createHashNavigation()', example: '<ToolkitProvider navigation={createHashNavigation()}>  // /app.php#/ventas'},
    {id: 'basePath', option: 'createBrowserNavigation({basePath})', example: "navigation={createBrowserNavigation({basePath: '/portal'})}"},
    {id: 'islands', option: 'createRoot por <div>', example: "document.querySelectorAll('[data-calcita]').forEach((element) => createRoot(element).render(…))"},
    {id: 'formatters', option: 'useFormatters()', example: 'const {formatCurrency, formatDate} = useFormatters();'},
    {id: 'ownTheme', option: 'su createTheme', example: "createTheme({cssVariables: {cssVarPrefix: 'portal'}})"},
    {id: 'events', option: 'onX de cada componente', example: "onSelect={(row) => window.parent.postMessage({row}, '*')}"},
    {id: 'chunks', option: 'manualChunks', example: "if (id.includes('@stackcraftmx/calcita') && !id.includes('/filepond')) return 'calcita';"},
    {id: 'ownSx', option: 'sx en claro y oscuro', example: "<Avatar sx={{bgcolor: 'primary.main'}}>  // gana en los dos modos"},
];
const I18NEXT_EXTENSIONS = [
    {id: 'adapter', option: 'translateWithI18next(i18n)', example: 'const translate = translateWithI18next(i18n);'},
    {id: 'language', option: 'i18n.resolvedLanguage · i18n.changeLanguage', example: 'language={i18n.resolvedLanguage} onLanguageChange={(language) => i18n.changeLanguage(language)}'},
];

export const TranslationsPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `translations.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('translations.title')} description={t('translations.description')} />

            <SectionCard title={t('translations.order.title')}>
                <Typography variant="body2" color="text.secondary">{t('translations.order.description')}</Typography>
            </SectionCard>
            <DemoSection title={t('translations.calls.title')} description={t('translations.calls.description')}
                         extensions={rowsOf('calls', CALLS_EXTENSIONS)} Demo={TranslationCalls} loadSource={loadCalls} />
            <CodeSection title={t('translations.texts.title')} description={t('translations.texts.description')}
                         extensions={rowsOf('texts', TEXTS_EXTENSIONS)} loadSource={loadAppTexts} />
            <CodeSection title={t('translations.provider.title')} description={t('translations.provider.description')}
                         extensions={rowsOf('provider', PROVIDER_EXTENSIONS)} loadSource={loadAppProviders} />
            <CodeSection title={t('translations.i18next.title')} description={t('translations.i18next.description')}
                         extensions={rowsOf('i18next', I18NEXT_EXTENSIONS)} sources={I18NEXT_SOURCES} />
            <CodeSection title={t('translations.legacy.title')} description={t('translations.legacy.description')}
                         extensions={rowsOf('legacy', LEGACY_EXTENSIONS)} loadSource={loadLegacySystem} />
        </Stack>
    );
};
