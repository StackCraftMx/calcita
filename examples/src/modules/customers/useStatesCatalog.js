// El catálogo de estados para el campo de catálogo: lo pide una vez al abrir la pantalla y avisa mientras llega.
//
// Hook del módulo, no renderiza: function (regla de la casa).
import {useEffect, useState} from 'react';
import {toastProblem} from '@stackcraftmx/calcita';

import {getStatesCatalog} from '@/modules/customers/customersApi.js';

/**
 * @returns {{states: Array<{code: string, label: string}>, isLoading: boolean}}
 */
export function useStatesCatalog() {
    const [states, setStates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const abortController = new AbortController();
        getStatesCatalog(abortController.signal)
            .then(setStates)
            .catch((error) => {
                if (!abortController.signal.aborted) {
                    toastProblem(error);
                }
            })
            .finally(() => setIsLoading(false));
        return () => abortController.abort();
    }, []);

    return {states, isLoading};
}
