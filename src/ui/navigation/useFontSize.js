// El tamaño de letra elegido, recordado en este navegador (del tema de walk-ot).
//
//   - Se lee al montar en el cliente: en el servidor no hay almacenamiento y la primera pintura es la normal.
//   - Sin almacenamiento (ventana privada estricta) funciona igual; solo no se recuerda.
//
// Hook genérico del paquete: function (regla de la casa).
import {useCallback, useEffect, useState} from 'react';

import {
    DEFAULT_FONT_SIZE_LEVEL, FONT_SIZE_LEVELS, FONT_SIZE_STORAGE_KEY, isFontSizeLevel, rootFontSizeOf,
} from '@/ui/navigation/fontSizeLevels.js';

// el aviso entre copias del gancho cuando la persona cambia el tamaño
const FONT_SIZE_CHANGE_EVENT = 'calcita:font-size';

/**
 * @returns {{level: string, setLevel: (levelKey: string) => void, isMounted: boolean, levels: typeof FONT_SIZE_LEVELS}}
 */
export function useFontSize() {
    const [level, setLevelState] = useState(DEFAULT_FONT_SIZE_LEVEL);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        try {
            const storedLevel = window.localStorage.getItem(FONT_SIZE_STORAGE_KEY);
            if (isFontSizeLevel(storedLevel)) {
                setLevelState(storedLevel);
            }
        } catch {
            // almacenamiento bloqueado: se queda la normal
        }
        setIsMounted(true);
    }, []);

    // otra copia del gancho (el menú de la cuenta, «Mi perfil») cambió el tamaño: esta también se entera
    useEffect(() => {
        const followOtherCopies = (event) => setLevelState(event.detail);
        window.addEventListener(FONT_SIZE_CHANGE_EVENT, followOtherCopies);
        return () => window.removeEventListener(FONT_SIZE_CHANGE_EVENT, followOtherCopies);
    }, []);

    useEffect(() => {
        if (isMounted) {
            document.documentElement.style.fontSize = rootFontSizeOf(level);
        }
    }, [level, isMounted]);

    const setLevel = useCallback((levelKey) => {
        if (!isFontSizeLevel(levelKey)) {
            return;
        }
        setLevelState(levelKey);
        try {
            window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, levelKey);
        } catch {
            // almacenamiento bloqueado: cambia igual, solo no se recuerda
        }
        window.dispatchEvent(new CustomEvent(FONT_SIZE_CHANGE_EVENT, {detail: levelKey}));
    }, []);

    return {level, setLevel, isMounted, levels: FONT_SIZE_LEVELS};
}
