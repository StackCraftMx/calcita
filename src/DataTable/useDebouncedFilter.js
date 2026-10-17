// Rebote para las cajas de texto que filtran en el servidor.
//
// Sin esto, cada tecla dispara una consulta: escribir "VIDA" son cuatro consultas de las que tres nacen muertas, y
// con respuestas de medio segundo las carreras entre ellas se ven. El valor que se TECLEA es inmediato (la caja nunca
// se siente lenta); el que viaja al servidor espera a que la persona deje de escribir.
//
// Hook genérico, no renderiza: function (regla de la casa).
import {useEffect, useRef, useState} from 'react';

export const DEFAULT_DEBOUNCE_MILLISECONDS = 350;

/**
 * @param {string|undefined} value valor confirmado (el de la URL)
 * @param {(value: string) => void} commit se llama con el valor ya rebotado
 * @param {number} [delayMilliseconds]
 * @returns {[string, (value: string) => void]} borrador que pinta la caja y su setter
 */
export function useDebouncedFilter(value, commit, delayMilliseconds = DEFAULT_DEBOUNCE_MILLISECONDS) {
    const [draft, setDraft] = useState(value ?? '');
    const committedValue = useRef(value ?? '');

    // cambios que vienen de FUERA (la URL, "Limpiar todo") se reflejan en la caja sin dispararla de vuelta
    useEffect(() => {
        if (value !== committedValue.current) {
            committedValue.current = value ?? '';
            setDraft(value ?? '');
        }
    }, [value]);

    useEffect(() => {
        // guard clause: nada nuevo que mandar
        if (draft === committedValue.current) {
            return undefined;
        }
        const timer = setTimeout(() => {
            committedValue.current = draft;
            commit(draft);
        }, delayMilliseconds);
        return () => clearTimeout(timer);
        // OJO: commit fuera de las dependencias a propósito; suele ser una función nueva en cada render
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft, delayMilliseconds]);

    return [draft, setDraft];
}
