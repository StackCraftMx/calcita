// ¿Ya aceptó esta persona el aviso de cookies, en esta versión, en este navegador? Para armar un aviso propio; CookieNotice
// es el que ya viene pintado.
//
//   const {hasAccepted, accept} = useCookieConsent({version: '2026-11'});
//
// Hook genérico: function (regla de la casa).
import {useState} from 'react';

import {acceptedVersionOf, rememberAcceptedVersion} from '@/legal/consentStorage.js';

/** Dónde se recuerda, si el proyecto no da su llave (con el nombre de su app, para no chocar con otra en el mismo dominio). */
export const DEFAULT_COOKIE_CONSENT_KEY = 'calcita:cookieConsent';

/**
 * @param {{version?: string, storageKey?: string}} [options] version: la del aviso (al cambiarla se vuelve a preguntar)
 * @returns {{hasAccepted: boolean, accept: () => void}}
 */
export function useCookieConsent({version = '1', storageKey = DEFAULT_COOKIE_CONSENT_KEY} = {}) {
    // se lee al pintar la primera vez (sin servidor de por medio: el aviso es de este navegador)
    const [acceptedVersion, setAcceptedVersion] = useState(() => acceptedVersionOf(storageKey));

    const accept = () => {
        rememberAcceptedVersion(storageKey, version);
        setAcceptedVersion(version);
    };

    return {hasAccepted: acceptedVersion === version, accept};
}
