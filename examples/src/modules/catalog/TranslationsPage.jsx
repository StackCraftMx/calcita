// Catálogo · traducciones: de dónde salen los textos de Calcita y cómo se traduce lo del proyecto. El paquete trae su propio
// traductor (sin i18next) con la sintaxis de i18next; un proyecto con i18next se conecta con translateWithI18next.
//
// La sección de las llamadas es un ejemplo vivo (cambia con el idioma del menú de la cuenta); las demás solo enseñan su
// código, abierto de entrada: los textos del proyecto, el proveedor y la conexión con i18next.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {PageHeading, SectionCard, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import TranslationCalls from '@/modules/catalog/demos/translations/TranslationCalls.tsx';
// el de i18next va como texto: los ejemplos no instalan i18next y no se puede revisar ni construir
import i18nextSetup from '@/modules/catalog/demos/translations/i18nextSetup.js?raw';

const loadAppTexts = () => import('@/modules/catalog/demos/translations/appTexts.ts?demo-source');
const loadAppProviders = () => import('@/modules/catalog/demos/translations/AppProviders.tsx?demo-source');
const I18NEXT_SOURCES = Object.freeze({js: i18nextSetup});

export const TranslationsPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('translations.title')} description={t('translations.description')} />

            <SectionCard title={t('translations.order.title')}>
                <Typography variant="body2" color="text.secondary">{t('translations.order.description')}</Typography>
            </SectionCard>
            <DemoSection title={t('translations.calls.title')} description={t('translations.calls.description')}
                         Demo={TranslationCalls} loadSource={() => import('@/modules/catalog/demos/translations/TranslationCalls.tsx?demo-source')} />
            <CodeSection title={t('translations.texts.title')} description={t('translations.texts.description')} loadSource={loadAppTexts} />
            <CodeSection title={t('translations.provider.title')} description={t('translations.provider.description')} loadSource={loadAppProviders} />
            <CodeSection title={t('translations.i18next.title')} description={t('translations.i18next.description')} sources={I18NEXT_SOURCES} />
        </Stack>
    );
};
