// Las pestañas que la persona fijó en la barra del teléfono (desde «Más» → «Editar la barra»), recordadas en este
// navegador. La guía de Apple para las barras de pestañas pide dejar que cada quien la acomode a su gusto.
//
//   - Se lee ANTES del primer pintado (useLayoutEffect): sin eso, la barra brinca de las del proyecto a las suyas.
//   - null = no ha elegido: van las que marca el proyecto (mobileTab en menu.js).
//   - Sin almacenamiento (ventana privada estricta) cambia igual, solo no se recuerda.
//
// Hook genérico del paquete: function (regla de la casa).
import {useCallback, useEffect, useLayoutEffect, useState} from 'react';

const STORAGE_KEY = 'calcita:mobileTabs';
// en el servidor useLayoutEffect avisa en consola; ahí no hay nada que leer
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * @returns {{pinnedKeys: string[]|null, setPinnedKeys: (keys: string[]|null) => void}} las llaves son menuItemKeyOf
 */
export function usePinnedMobileTabs() {
    const [pinnedKeys, setStoredKeys] = useState(null);

    useBrowserLayoutEffect(() => {
        try {
            const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
            // algo editado a mano o de otra versión: se ignora
            if (Array.isArray(stored) && stored.every((key) => typeof key === 'string')) {
                setStoredKeys(stored);
            }
        } catch {
            // almacenamiento bloqueado o texto que no es JSON: van las del proyecto
        }
    }, []);

    const setPinnedKeys = useCallback((keys) => {
        setStoredKeys(keys);
        try {
            if (keys) {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
            } else {
                window.localStorage.removeItem(STORAGE_KEY);
            }
        } catch {
            // almacenamiento bloqueado: cambia igual, solo no se recuerda
        }
    }, []);

    return {pinnedKeys, setPinnedKeys};
}
