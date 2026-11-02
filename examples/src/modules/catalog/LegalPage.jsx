// Hecho en Calcita · documentos y avisos legales: un PDF en una ventana con el visor del navegador (PdfViewerDialog), el aviso
// de cookies (CookieNotice) y aceptar los términos antes de seguir (TermsAcceptanceDialog).
//
// Cada sección dice para qué sirve en una línea, enseña el código mínimo (JS y TS, para copiar) y trae su tabla «Cómo se
// extiende».
//
// Lo renderiza la app: arrow (regla de la casa).
import Stack from '@mui/material/Stack';
import {PageHeading, useToolkitTranslation} from '@stackcraftmx/calcita';

import {DemoSection} from '@/modules/catalog/DemoSection.jsx';
import {extensionRowsOf} from '@/modules/catalog/ExtensionTable.jsx';
import CookieNoticeDemo from '@/modules/catalog/demos/legal/CookieNoticeDemo.tsx';
import PdfViewerDemo from '@/modules/catalog/demos/legal/PdfViewerDemo.tsx';
import TermsDemo from '@/modules/catalog/demos/legal/TermsDemo.tsx';

const loadPdf = () => import('@/modules/catalog/demos/legal/PdfViewerDemo.tsx?demo-source');
const loadCookies = () => import('@/modules/catalog/demos/legal/CookieNoticeDemo.tsx?demo-source');
const loadTerms = () => import('@/modules/catalog/demos/legal/TermsDemo.tsx?demo-source');

// «Cómo se extiende» de cada sección: la opción y su ejemplo son código (no se traducen); qué hace, en catalogPageTexts
// (legal.<sección>.extend.<id>)
const PDF_EXTENSIONS = [
    {id: 'src', option: 'src', example: "src=\"/docs/contrato.pdf\"  ·  src={blobFromApi}"},
    {id: 'fileName', option: 'fileName · onDownload', example: 'fileName="contrato-2026.pdf" onDownload={() => track(\'contrato\')}'},
    {id: 'actions', option: 'actions', example: '<Button onClick={sign}>Firmar</Button>'},
    {id: 'theme', option: 'theme.components.CalcitaPdfViewerDialog', example: 'styleOverrides: {frame: {height: \'80vh\'}}'},
];
const COOKIE_EXTENSIONS = [
    {id: 'version', option: 'version · storageKey', example: 'version="2026-11" storageKey="mi-app:cookies"'},
    {id: 'policy', option: 'policyHref · onPolicyClick · policyLabel', example: 'onPolicyClick={() => setIsPolicyOpen(true)}'},
    {id: 'onAccept', option: 'onAccept', example: 'onAccept={({version, acceptedAt}) => api.recordCookieConsent(version)}'},
    {id: 'texts', option: 'text · acceptLabel · actions', example: 'actions={<Button>Configurar</Button>}'},
    {id: 'hook', option: 'useCookieConsent', example: "const {hasAccepted, accept} = useCookieConsent({version: '2026-11'});"},
];
const TERMS_EXTENSIONS = [
    {id: 'version', option: 'version · onAccept', example: 'onAccept={({version}) => api.acceptTerms(version)}'},
    {id: 'content', option: 'children · pdfSrc', example: 'pdfSrc="/docs/terminos.pdf"'},
    {id: 'reading', option: 'requireReading', example: 'requireReading={false}  // basta la casilla'},
    {id: 'decline', option: 'onDecline', example: 'onDecline={signOut}'},
    {id: 'texts', option: 'title · checkboxLabel · acceptLabel · declineLabel', example: 'checkboxLabel="Leí el aviso de privacidad"'},
];

export const LegalPage = () => {
    const {t} = useToolkitTranslation('catalog');
    const rowsOf = (section, extensions) => extensionRowsOf(t, `legal.${section}`, extensions);

    return (
        <Stack spacing={3}>
            <PageHeading title={t('legal.title')} description={t('legal.description')} />
            <DemoSection title={t('legal.pdf.title')} description={t('legal.pdf.description')}
                         extensions={rowsOf('pdf', PDF_EXTENSIONS)} Demo={PdfViewerDemo} loadSource={loadPdf} />
            <DemoSection title={t('legal.cookies.title')} description={t('legal.cookies.description')}
                         extensions={rowsOf('cookies', COOKIE_EXTENSIONS)} Demo={CookieNoticeDemo} loadSource={loadCookies} />
            <DemoSection title={t('legal.terms.title')} description={t('legal.terms.description')}
                         extensions={rowsOf('terms', TERMS_EXTENSIONS)} Demo={TermsDemo} loadSource={loadTerms} />
        </Stack>
    );
};
