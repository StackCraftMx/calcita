// Catálogo · seguridad: cómo se evita un XSS con el framework. Los textos del servidor se pintan como texto, las
// redirecciones de ?next= solo van dentro de la app (safeInternalPath), la sesión en una cookie que JavaScript no lee (y el
// CSRF de createApiClient) y las ligas a otros sitios con rel="noopener noreferrer".
//
// Los dos primeros son ejemplos vivos; los demás enseñan su código, abierto de entrada.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import EscapedServerMessage from '@/modules/catalog/demos/security/EscapedServerMessage.tsx';
import ExternalLinks from '@/modules/catalog/demos/security/ExternalLinks.tsx';
import SafeRedirectDemo from '@/modules/catalog/demos/security/SafeRedirectDemo.tsx';

const loadSessionSetup = () => import('@/modules/catalog/demos/security/SessionCookieSetup.ts?demo-source');

export const SecurityPage = () => {
    const {t} = useToolkitTranslation('catalog');

    return (
        <Stack spacing={3}>
            <PageHeading title={t('security.title')} description={t('security.description')} />

            <DemoSection title={t('security.escaped.title')} description={t('security.escaped.description')}
                         Demo={EscapedServerMessage} loadSource={() => import('@/modules/catalog/demos/security/EscapedServerMessage.tsx?demo-source')} />
            <DemoSection title={t('security.redirect.title')} description={t('security.redirect.description')}
                         Demo={SafeRedirectDemo} loadSource={() => import('@/modules/catalog/demos/security/SafeRedirectDemo.tsx?demo-source')} />
            <CodeSection title={t('security.session.title')} description={t('security.session.description')} loadSource={loadSessionSetup} />
            <DemoSection title={t('security.links.title')} description={t('security.links.description')}
                         Demo={ExternalLinks} loadSource={() => import('@/modules/catalog/demos/security/ExternalLinks.tsx?demo-source')} />
        </Stack>
    );
};
