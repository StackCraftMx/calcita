// En el teléfono, cuántos botones de un grupo de acciones (BarActions) caben en el renglón que flota arriba. Lo que no cabe
// va a un menú «⋯» (guía de Apple, Toolbars: «Create a More menu to include additional items»); si caben todos, no hay «⋯».
//
// Cómo se reparte el renglón: los grupos que van ANTES (el de `order` menor, y con el mismo order el que se escribió
// primero) tienen preferencia; este grupo usa lo que sobra. Así, si no cabe todo, el último grupo es el que manda sus
// botones al «⋯», y la cuenta no da vueltas: lo de antes no depende de lo de después.
//
// OJO: no se mide el ancho de la propia cápsula para decidir (cambia al esconder botones y la cuenta daría vueltas sin fin);
// se mide el renglón y lo que ocupan los de antes. Un grupo que se estira (el buscador abierto, con flex-grow) cuenta como
// la lupa chica: si no, al abrir el buscador las acciones se irían al «⋯».
//
// Gancho del paquete; no renderiza.
import {useLayoutEffect, useState} from 'react';

import {BAR_CAPSULE_HEIGHT_PIXELS} from '@/appShell/BarCapsule.jsx';

// si todavía no hay botones que medir: lo que mide un IconButton de MUI
const FALLBACK_BUTTON_PIXELS = 40;

const pixelsOf = (value) => Number.parseFloat(value) || 0;

/** ¿El hermano va antes que la cápsula en el renglón? (por su `order` de CSS y, si empatan, por cómo están escritos) */
const goesBefore = (sibling, capsule) => {
    const siblingOrder = pixelsOf(window.getComputedStyle(sibling).order);
    const capsuleOrder = pixelsOf(window.getComputedStyle(capsule).order);
    if (siblingOrder !== capsuleOrder) {
        return siblingOrder < capsuleOrder;
    }
    return Boolean(sibling.compareDocumentPosition(capsule) & Node.DOCUMENT_POSITION_FOLLOWING);
};

/** Lo que ocupa un hermano en el renglón; el que se estira (buscador abierto) cuenta como la lupa chica. */
const occupiedWidthOf = (sibling) => (
    pixelsOf(window.getComputedStyle(sibling).flexGrow) > 0 ? BAR_CAPSULE_HEIGHT_PIXELS : sibling.getBoundingClientRect().width
);

/**
 * @param {Element|null} slot el renglón flotante del teléfono (null: no se mide y se ven todos)
 * @param {HTMLElement|null} capsule la cápsula de este grupo
 * @param {number} actionCount cuántos botones trae el grupo
 * @returns {number} cuántos se ven como ícono; si es menor que actionCount, los demás van al «⋯»
 */
export default function useFittingActionCount(slot, capsule, actionCount) {
    const [visibleCount, setVisibleCount] = useState(actionCount);

    // antes de pintar (layout effect): así nunca se ve el renglón saliéndose de la pantalla
    useLayoutEffect(() => {
        if (!slot || !capsule) {
            setVisibleCount(actionCount);
            return undefined;
        }
        const measure = () => {
            const rowGap = pixelsOf(window.getComputedStyle(slot).columnGap);
            const siblingsBefore = [...slot.children].filter((sibling) => sibling !== capsule && goesBefore(sibling, capsule));
            const takenBefore = siblingsBefore.reduce((total, sibling) => total + occupiedWidthOf(sibling) + rowGap, 0);
            const freeWidth = slot.clientWidth - takenBefore;

            const capsuleStyle = window.getComputedStyle(capsule);
            const padding = pixelsOf(capsuleStyle.paddingLeft) + pixelsOf(capsuleStyle.paddingRight);
            const buttonGap = pixelsOf(capsuleStyle.columnGap);
            const buttonWidth = capsule.firstElementChild?.getBoundingClientRect().width || FALLBACK_BUTTON_PIXELS;
            // cuántos botones caben: relleno + n botones + (n - 1) huecos <= lo libre
            const fitting = Math.max(1, Math.floor((freeWidth - padding + buttonGap) / (buttonWidth + buttonGap)));
            // si no caben todos, uno de esos lugares es para el «⋯»
            setVisibleCount(fitting >= actionCount ? actionCount : fitting - 1);
        };
        measure();
        // se vuelve a medir al girar el teléfono o cuando cambia lo que ocupan los de antes
        const observer = new ResizeObserver(measure);
        observer.observe(slot);
        [...slot.children].forEach((sibling) => observer.observe(sibling));
        return () => observer.disconnect();
    }, [slot, capsule, actionCount]);

    return Math.min(visibleCount, actionCount);
}
