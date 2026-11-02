// El aviso de cookies de los ejemplos (CookieNotice) con su política en el visor de PDF (PdfViewerDialog): sale hasta que se
// acepta la versión de appSettings.js en este navegador. Se monta una vez en AppProviders, para las pantallas con sesión y
// para las de entrar.
//
// Lo renderiza la app: arrow (regla de la casa).
import {useState} from 'react';
import {CookieNotice, PdfViewerDialog, useToolkitTranslation} from '@stackcraftmx/calcita';

import {COOKIE_CONSENT_STORAGE_KEY, COOKIE_POLICY_VERSION, PRIVACY_NOTICE_PDF_URL} from '@/app/appSettings.js';

export const LegalNotices = () => {
    const {t} = useToolkitTranslation('shell');
    const [isPolicyOpen, setIsPolicyOpen] = useState(false);

    return (
        <>
            {/* la política se abre aquí mismo en el visor; en su proyecto puede ser policyHref a su página */}
            <CookieNotice version={COOKIE_POLICY_VERSION} storageKey={COOKIE_CONSENT_STORAGE_KEY} onPolicyClick={() => setIsPolicyOpen(true)} />
            <PdfViewerDialog open={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} title={t('legal.privacyTitle')} src={PRIVACY_NOTICE_PDF_URL}
                             fileName="aviso-de-privacidad-ejemplo.pdf" />
        </>
    );
};
