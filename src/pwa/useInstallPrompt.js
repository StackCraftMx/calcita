// La invitación a instalar la app (agregar a la pantalla de inicio): escucha al navegador, decide qué variante enseñar
// (installInstructions.js) y recuerda el «Ahora no». Es el de walk-ot, ya probado en iPhone y Android.
//
// El navegador NO tiene una sola manera de instalar:
//   - Android con Chromium (Chrome, Samsung Internet, Edge) avisa con beforeinstallprompt. Se guarda el aviso (preventDefault
//     quita su barrita) y se lanza desde NUESTRO botón.
//   - Safari de iOS nunca avisa: se instala a mano y el camino cambió en iOS 26.
//   - Firefox de Android tampoco avisa: a mano.
//
// El «Ahora no» se guarda en este navegador. Mientras no se lee (en el servidor y en el primer pintado) se supone que ya
// lo dijo: así la invitación nunca parpadea al cargar ni cambia entre el servidor y el navegador.
//
// Es un gancho: function, como los demás del paquete.
import {useCallback, useEffect, useMemo, useState} from 'react';

import {createLogger} from '@/observability/logger.js';
import {detectPlatform, resolveInstallVariant} from '@/pwa/installInstructions.js';

const log = createLogger('pwa');

const DISMISS_STORAGE_KEY = 'calcita:installPromptDismissed';
const DISMISSED = '1';

/** ¿Ya se abrió como app instalada? En el iPhone lo dice navigator.standalone; en los demás, el display-mode. */
function isRunningInstalled() {
    return window.matchMedia?.('(display-mode: standalone)').matches === true || window.navigator.standalone === true;
}

/** El «Ahora no» guardado; con el almacenamiento bloqueado se toma como no dicho. */
function readDismissed() {
    try {
        return window.localStorage.getItem(DISMISS_STORAGE_KEY) === DISMISSED;
    } catch {
        return false;
    }
}

/**
 * @returns {{variant: string|null, isInstalled: boolean, dismissed: boolean, dismiss: () => void, promptInstall: () => Promise<'accepted'|'dismissed'|null>}}
 *     promptInstall regresa lo que contestó la persona al diálogo del navegador (null: ya no había diálogo)
 *   variant: una de INSTALL_VARIANT o null (nada que ofrecer). NO toma en cuenta el «Ahora no»: la invitación sí lo respeta,
 *   pero la entrada del menú de la cuenta no, porque ahí la persona la busca a propósito.
 */
export function useInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [platform, setPlatform] = useState(null);
    // se supone dicho hasta leer el navegador (ver arriba)
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        setPlatform(detectPlatform(window.navigator));
        setIsInstalled(isRunningInstalled());
        setDismissed(readDismissed());

        const handleBeforeInstall = (event) => {
            // el momento lo elige la persona con nuestro botón, no la barrita del navegador
            event.preventDefault();
            setDeferredPrompt(event);
        };
        const handleInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            log.info('app instalada');
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleInstalled);
        };
    }, []);

    // El diálogo del navegador sirve UNA vez: con cualquier respuesta se suelta. Cancelarlo no es «Ahora no» (eso solo lo
    // dice el botón de la invitación).
    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) {
            return null;
        }
        deferredPrompt.prompt();
        const {outcome} = await deferredPrompt.userChoice;
        log.info('respuesta al diálogo de instalar', {outcome});
        setDeferredPrompt(null);
        return outcome;
    }, [deferredPrompt]);

    const dismiss = useCallback(() => {
        setDismissed(true);
        try {
            window.localStorage.setItem(DISMISS_STORAGE_KEY, DISMISSED);
        } catch {
            // almacenamiento bloqueado: se cierra igual, solo no se recuerda
        }
    }, []);

    const variant = useMemo(() => {
        if (!platform) {
            return null;
        }
        return resolveInstallVariant({platform, canPromptNative: deferredPrompt !== null, isInstalled});
    }, [platform, deferredPrompt, isInstalled]);

    return {variant, isInstalled, dismissed, dismiss, promptInstall};
}
