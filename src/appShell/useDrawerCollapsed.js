// Si el menú lateral está encogido (solo íconos), recordado en este navegador (del marco de walk-ot).
//
//   - La preferencia se lee ANTES del primer pintado del navegador (useLayoutEffect): sin eso, el menú brinca del valor por
//     omisión al que la persona dejó.
//   - En el teléfono no aplica: ahí el menú es un cajón que se abre con la hamburguesa (AppLayout lo elige con CSS).
//   - Sin almacenamiento (ventana privada estricta) se usa el valor por omisión, sin tronar.
//
// Hook genérico del paquete: function (regla de la casa).
import {useCallback, useEffect, useLayoutEffect, useState} from 'react';

const STORAGE_KEY = 'calcita:drawerCollapsed';
// en el servidor useLayoutEffect avisa en consola; ahí no hay nada que leer
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * @param {boolean} [defaultCollapsed]
 * @returns {{collapsed: boolean, toggle: () => void}}
 */
export function useDrawerCollapsed(defaultCollapsed = false) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    useBrowserLayoutEffect(() => {
        try {
            const storedValue = window.localStorage.getItem(STORAGE_KEY);
            if (storedValue === 'true' || storedValue === 'false') {
                setCollapsed(storedValue === 'true');
            }
        } catch {
            // almacenamiento bloqueado: se queda el valor por omisión
        }
    }, []);

    const remember = useCallback((nextCollapsed) => {
        setCollapsed(nextCollapsed);
        try {
            window.localStorage.setItem(STORAGE_KEY, String(nextCollapsed));
        } catch {
            // almacenamiento bloqueado: cambia igual, solo no se recuerda
        }
    }, []);

    const toggle = useCallback(() => remember(!collapsed), [collapsed, remember]);

    return {collapsed, toggle};
}
