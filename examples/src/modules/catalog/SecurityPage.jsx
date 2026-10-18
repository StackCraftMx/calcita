// Catálogo · seguridad: cómo se evita un XSS con el framework. Los textos del servidor se pintan como texto, las
// redirecciones de ?next= solo van dentro de la app (safeInternalPath), la sesión en una cookie que JavaScript no lee (y el
// CSRF de createApiClient) y las ligas a otros sitios con rel="noopener noreferrer".
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo y trae su tabla con lo que hay que saber.
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {CodeSection, DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import EscapedServerMessage from '@/modules/catalog/demos/security/EscapedServerMessage.tsx';
import ExternalLinks from '@/modules/catalog/demos/security/ExternalLinks.tsx';
import SafeRedirectDemo from '@/modules/catalog/demos/security/SafeRedirectDemo.tsx';

const loadSessionSetup = () => import('@/modules/catalog/demos/security/SessionCookieSetup.ts?demo-source');
const loadEscaped = () => import('@/modules/catalog/demos/security/EscapedServerMessage.tsx?demo-source');
const loadRedirect = () => import('@/modules/catalog/demos/security/SafeRedirectDemo.tsx?demo-source');
const loadLinks = () => import('@/modules/catalog/demos/security/ExternalLinks.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogTexts
// (security.<sección>.extend.<id>)
const ESCAPED_EXTENSIONS = [
    {id: 'text', option: '{texto}', example: '<Typography>{problem.detail}</Typography>'},
    {id: 'toasts', option: 'toastProblem · MessageView', example: 'toastProblem(error)  // el detail va como texto'},
    {id: 'never', option: 'dangerouslySetInnerHTML', example: '// nunca con algo que no escribió el equipo'},
];
const REDIRECT_EXTENSIONS = [
    {id: 'safePath', option: 'safeInternalPath(next)', example: "safeInternalPath(searchParams.get('next'))"},
    {id: 'fallback', option: '?? \'/\'', example: "navigate(safeInternalPath(next) ?? '/')"},
];
const SESSION_EXTENSIONS = [
    {id: 'cookie', option: "credentials: 'same-origin'", example: "createApiClient({baseUrl: '/api'})"},
    {id: 'otherDomain', option: "credentials: 'include'", example: "createApiClient({baseUrl: 'https://api.mi-tienda.com', credentials: 'include'})"},
    {id: 'csrf', option: 'csrf', example: "createApiClient({csrf: {refreshPath: '/sanctum/csrf-cookie'}})"},
];
const LINKS_EXTENSIONS = [
    {id: 'rel', option: 'rel="noopener noreferrer"', example: '<Link href={url} target="_blank" rel="noopener noreferrer">'},
    {id: 'csp', option: 'Content-Security-Policy', example: "Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-…'"},
];

export const SecurityPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `security.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('security.title')} description={t('security.description')} />

            <DemoSection title={t('security.escaped.title')} description={t('security.escaped.description')}
                         extensions={rowsOf('escaped', ESCAPED_EXTENSIONS)} Demo={EscapedServerMessage} loadSource={loadEscaped} />
            <DemoSection title={t('security.redirect.title')} description={t('security.redirect.description')}
                         extensions={rowsOf('redirect', REDIRECT_EXTENSIONS)} Demo={SafeRedirectDemo} loadSource={loadRedirect} />
            <CodeSection title={t('security.session.title')} description={t('security.session.description')}
                         extensions={rowsOf('session', SESSION_EXTENSIONS)} loadSource={loadSessionSetup} />
            <DemoSection title={t('security.links.title')} description={t('security.links.description')}
                         extensions={rowsOf('links', LINKS_EXTENSIONS)} Demo={ExternalLinks} loadSource={loadLinks} />
        </Stack>
    );
};
