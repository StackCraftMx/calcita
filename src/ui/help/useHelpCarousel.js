// Cuándo sale la ayuda en carrusel (HelpCarouselDialog): sola la primera vez que se entra, y otra vez cuando cambia
// (versión nueva), hasta que la persona la termina o marca «No volver a mostrar». Se recuerda en este navegador; si el
// proyecto ya sabe en su servidor que la persona la vio (como el «primeras instrucciones» de un usuario), lo pasa en seen
// y manda.
//
//   const help = useHelpCarousel({helpKey: 'tasks', version: '2'});
//   <HelpButton onClick={help.openHelp} />
//   <HelpCarouselDialog open={help.open} onClose={help.closeHelp} steps={…} />
//
// Hook genérico: function (regla de la casa).
import {useState} from 'react';

import {acceptedVersionOf, rememberAcceptedVersion} from '@/legal/consentStorage.js';

const STORAGE_PREFIX = 'calcita:help:';

/**
 * @param {object} options
 * @param {string} options.helpKey de qué pantalla es la ayuda ('tasks'): una llave por ayuda
 * @param {string} [options.version] súbala cuando la ayuda cambie y deba volver a salir
 * @param {boolean} [options.autoOpen] que salga sola la primera vez (por omisión sí)
 * @param {boolean} [options.seen] lo que sabe el servidor del proyecto: true = ya la vio (no sale sola)
 * @returns {{open: boolean, openHelp: () => void, closeHelp: (reason?: string, details?: {dontShowAgain: boolean}) => void, wasSeen: boolean}}
 */
export function useHelpCarousel({helpKey, version = '1', autoOpen = true, seen = false}) {
    const storageKey = `${STORAGE_PREFIX}${helpKey}`;
    const wasSeen = seen || acceptedVersionOf(storageKey) === version;
    const [open, setOpen] = useState(() => autoOpen && !wasSeen);

    return {
        open,
        wasSeen,
        openHelp: () => setOpen(true),
        // terminarla la recuerda; cerrarla antes, solo con «No volver a mostrar»
        closeHelp: (reason, {dontShowAgain = false} = {}) => {
            setOpen(false);
            if (reason === 'finished' || dontShowAgain) {
                rememberAcceptedVersion(storageKey, version);
            }
        },
    };
}
