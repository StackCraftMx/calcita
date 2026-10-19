// Los atajos de teclado de la bandeja, los mismos de Gmail: c redactar, / buscar, j y k el siguiente o el anterior, e
// archivar, # borrar, r responder, a responder a todos, f reenviar, u regresar a la lista, ? la ayuda. No hacen nada mientras
// se escribe (en un campo) ni con Ctrl, Cmd o Alt (esos son del navegador).
//
// Hook de la pantalla: arrow (regla de la casa).
import {useEffect, useRef} from 'react';

/** Cada tecla y la llave de su texto (mail.shortcuts.<llave>), en el orden de la ayuda. */
export const MAIL_SHORTCUTS = Object.freeze([
    {key: 'c', action: 'compose'}, {key: '/', action: 'search'}, {key: 'j', action: 'next'}, {key: 'k', action: 'previous'},
    {key: 'e', action: 'archive'}, {key: '#', action: 'delete'}, {key: 'r', action: 'reply'}, {key: 'a', action: 'replyAll'},
    {key: 'f', action: 'forward'}, {key: 'u', action: 'back'}, {key: '?', action: 'help'},
]);

/** ¿La tecla se escribió dentro de un campo o un editor? Ahí la tecla es texto, no un atajo. */
const isTyping = (target) => target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * @param {Record<string, () => void>} handlers por acción de MAIL_SHORTCUTS (compose, search, next…); la que no venga no hace nada
 */
export const useMailShortcuts = (handlers) => {
    // lo último que dio la pantalla, sin volver a escuchar el teclado en cada pintada
    const latest = useRef(handlers);
    useEffect(() => {
        latest.current = handlers;
    });
    useEffect(() => {
        const onKeyDown = (event) => {
            // con una ventana abierta (redactar, la ayuda) los atajos no corren: la tecla es de la ventana (el foco vive adentro).
            // OJO: no basta buscar un role="dialog" en la página: el cajón del menú del teléfono siempre está montado
            if (event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target) || event.target.closest?.('[role="dialog"], [role="menu"]')) {
                return;
            }
            const shortcut = MAIL_SHORTCUTS.find((candidate) => candidate.key === event.key);
            const handler = shortcut && latest.current[shortcut.action];
            if (handler) {
                event.preventDefault();
                handler();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);
};
