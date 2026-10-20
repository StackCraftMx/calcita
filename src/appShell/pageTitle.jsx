// El título de la pantalla abierta, para la barra de arriba (del marco de walk-ot, como Linear):
//   - en escritorio, la barra enseña el título SOLO cuando el título grande de la página ya salió de la vista al deslizar;
//   - en el teléfono, la barra siempre enseña el título (no hay lugar para un encabezado grande y una barra vacía).
// PageHeader lo registra solo; AppLayout trae el proveedor. Fuera de AppLayout no pasa nada (el contexto por omisión no
// hace nada).
//
// Proveedor y hooks genéricos del paquete: function (regla de la casa).
import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {warnUnknownProps} from '@/toolkit/unknownProps.js';

const PageTitleContext = createContext({
    title: null,
    setTitle: () => {},
    isTitleVisible: true,
    setTitleVisible: () => {},
});

/**
 * @param {{children: import('react').ReactNode}} props
 */
export function PageTitleProvider({children, ...unknownProps}) {
    warnUnknownProps('PageTitleProvider', unknownProps);
    const [title, setTitle] = useState(null);
    const [isTitleVisible, setTitleVisible] = useState(true);
    const value = useMemo(() => ({title, setTitle, isTitleVisible, setTitleVisible}), [title, isTitleVisible]);
    return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>;
}

/**
 * El título registrado y si se está viendo.
 *
 * @returns {{title: string|null, setTitle: Function, isTitleVisible: boolean, setTitleVisible: Function}}
 */
export function usePageTitle() {
    return useContext(PageTitleContext);
}

/**
 * Registra el título de la página y avisa si su elemento se está viendo (para la barra).
 *
 * @param {string|null|undefined} title
 * @param {{current: Element|null}} titleRef el elemento del título grande
 */
export function useRegisterPageTitle(title, titleRef) {
    const {setTitle, setTitleVisible} = usePageTitle();

    useEffect(() => {
        setTitle(title ?? null);
        return () => setTitle(null);
    }, [title, setTitle]);

    useEffect(() => {
        const titleElement = titleRef.current;
        // guard clause: sin elemento o sin IntersectionObserver (pintando en el servidor) no hay nada que observar
        if (!titleElement || typeof IntersectionObserver === 'undefined') {
            return undefined;
        }
        const observer = new IntersectionObserver(([entry]) => setTitleVisible(entry.isIntersecting), {threshold: 0});
        observer.observe(titleElement);
        return () => {
            observer.disconnect();
            setTitleVisible(true);
        };
    }, [titleRef, setTitleVisible]);
}
