// Si la barra de pestañas del teléfono va encogida, según cómo se desliza la página (la regla está en tabBarScroll.js).
//
//   - Con «reducir movimiento» encendido en el equipo no se encoge: la guía de Apple pide que el movimiento sea opcional.
//   - Solo cambia el estado cuando cambia la decisión (encogida o completa), no en cada evento de deslizar.
//   - expand() la regresa completa: es lo que hace tocar la cápsula chica.
//
// Hook genérico del paquete: function (regla de la casa).
import {useCallback, useEffect, useRef, useState} from 'react';

import {TAB_BAR_SCROLL_START, tabBarStateAfterScroll} from '@/appShell/tabBarScroll.js';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * @param {boolean} isEnabled false: siempre completa
 * @returns {{isMinimized: boolean, expand: () => void}}
 */
export function useTabBarMinimized(isEnabled) {
    const [isMinimized, setIsMinimized] = useState(false);
    const scrollState = useRef(TAB_BAR_SCROLL_START);

    useEffect(() => {
        // pintando en el servidor no hay ventana que deslizar
        if (!isEnabled || typeof window === 'undefined') {
            return undefined;
        }
        const reducedMotion = window.matchMedia?.(REDUCED_MOTION_QUERY);
        scrollState.current = {...TAB_BAR_SCROLL_START, lastY: window.scrollY};
        const onScroll = () => {
            if (reducedMotion?.matches) {
                return;
            }
            scrollState.current = tabBarStateAfterScroll(scrollState.current, window.scrollY);
            setIsMinimized(scrollState.current.isMinimized);
        };
        window.addEventListener('scroll', onScroll, {passive: true});
        return () => window.removeEventListener('scroll', onScroll);
    }, [isEnabled]);

    const expand = useCallback(() => {
        scrollState.current = {...scrollState.current, isMinimized: false, travel: 0};
        setIsMinimized(false);
    }, []);

    return {isMinimized: isEnabled && isMinimized, expand};
}
