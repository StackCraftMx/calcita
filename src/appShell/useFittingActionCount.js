// Cuántos botones de un grupo de acciones (BarActions) caben en su renglón: el que flota arriba en el teléfono o el de la
// barra de arriba en escritorio. Lo que no cabe va a un menú «⋯» (guía de Apple, Toolbars: «Create a More menu to include
// additional items»; en la Mac, la barra de una ventana angosta hace lo mismo); si caben todos, no hay «⋯».
//
// Cómo se reparte el renglón: los grupos que van ANTES (el de `order` menor, y con el mismo order el que se escribió
// primero) tienen preferencia; este grupo usa lo que sobra. Así, si no cabe todo, el último grupo es el que manda sus
// botones al «⋯», y la cuenta no da vueltas: lo de antes no depende de lo de después.
//
// Cómo se cuenta: se mide el grupo ya pintado. Si no cabe, se esconde un botón más (el último); si sobra lugar para lo que
// midió el grupo con un botón más, se enseña. Se mide el grupo entero y no botón por botón porque en escritorio los botones
// miden distinto (con su nombre: showLabel desktop) y lo de adentro puede ser cualquier cosa. Lo que midió con cada cuenta se
// guarda; si al volver a una cuenta mide distinto (la persona eligió la letra «Muy grande», un nombre cambió a «Filtrar (12)»),
// se olvida todo y se vuelve a medir. Todo pasa antes de pintar (useLayoutEffect): nunca se ve el renglón saliéndose.
//
// El lugar libre: en el teléfono, lo ancho del renglón flotante. En escritorio el renglón de las acciones mide lo que ocupan
// (ni se estira ni se encoge), así que lo que tiene es lo ancho de la barra menos lo demás de la barra (la marca, el menú de
// arriba, la cuenta). Lo que se estira (el título de la página, el espaciador) cede todo su lugar: si las acciones no caben,
// el título de la barra se corta con «…» antes de mandar botones al «⋯». OJO: medir el renglón en escritorio no sirve, mide
// lo que ocupan sus grupos aunque se salgan de la barra (así se metía el último debajo de la cuenta, medido a 900 px).
//
// OJO: un grupo que se estira (el buscador abierto, con flex-grow) cuenta como la lupa chica: si no, al abrir el buscador
// las acciones se irían al «⋯».
//
// Gancho del paquete; no renderiza.
import {useLayoutEffect, useRef, useState} from 'react';

import {BAR_CAPSULE_HEIGHT_PIXELS} from '@/appShell/BarCapsule.jsx';

// lo que se perdona al comparar medidas: el navegador mide con fracciones de píxel y una cuenta no debe ir y venir por eso
const MEASURE_TOLERANCE_PIXELS = 0.5;

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

/** ¿El renglón va dentro de una barra (una fila flex: la barra de arriba en escritorio) y no a lo ancho (el del teléfono)? */
const isInsideBar = (slot) => {
    const parentStyle = window.getComputedStyle(slot.parentElement);
    return parentStyle.display.endsWith('flex') && parentStyle.flexDirection === 'row';
};

/** Lo de la barra que está en la fila (se ve y no flota encima con position absolute o fixed). */
const isInRow = (element) => {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.position !== 'absolute' && style.position !== 'fixed';
};

/** Lo ancho que tiene el renglón para todos sus grupos. */
const slotRoomOf = (slot) => {
    if (!isInsideBar(slot)) {
        return slot.clientWidth;
    }
    // en la barra: su ancho menos sus orillas, sus huecos y lo que no se estira (lo que se estira cede su lugar)
    const bar = slot.parentElement;
    const barStyle = window.getComputedStyle(bar);
    const inRow = [...bar.children].filter(isInRow);
    const fixedParts = inRow.filter((part) => part !== slot && pixelsOf(window.getComputedStyle(part).flexGrow) === 0);
    const takenByParts = fixedParts.reduce((total, part) => total + part.getBoundingClientRect().width, 0);
    const gaps = pixelsOf(barStyle.columnGap) * Math.max(0, inRow.length - 1);
    const edges = pixelsOf(barStyle.paddingLeft) + pixelsOf(barStyle.paddingRight);
    return bar.clientWidth - edges - gaps - takenByParts;
};

/** Lo que tiene libre este grupo: lo del renglón menos lo que ocupan los grupos de antes. */
const freeWidthOf = (slot, capsule) => {
    const rowGap = pixelsOf(window.getComputedStyle(slot).columnGap);
    const siblingsBefore = [...slot.children].filter((sibling) => sibling !== capsule && goesBefore(sibling, capsule));
    const takenBefore = siblingsBefore.reduce((total, sibling) => total + occupiedWidthOf(sibling) + rowGap, 0);
    return slotRoomOf(slot) - takenBefore;
};

/**
 * @param {Element|null} slot el renglón donde caen los grupos (null: no se mide y se ven todos)
 * @param {HTMLElement|null} capsule la cápsula (o el grupo) de este grupo de acciones
 * @param {number} maxCount lo más que pueden verse: los botones del grupo, o menos si la pantalla puso tope (maxVisible)
 * @returns {number} cuántos se ven en el renglón; los demás van al «⋯»
 */
export default function useFittingActionCount(slot, capsule, maxCount) {
    const [visibleCount, setVisibleCount] = useState(maxCount);
    const shownCount = Math.min(visibleCount, maxCount);
    // lo que midió el grupo con cada cuenta de botones a la vista (cuenta → px)
    const widthByCountRef = useRef(new Map());
    // la medición de ahora, para el ResizeObserver (que se arma una vez y necesita la cuenta de este momento)
    const measureRef = useRef(() => {});

    measureRef.current = () => {
        if (!slot || !capsule) {
            return;
        }
        const widthByCount = widthByCountRef.current;
        const width = capsule.getBoundingClientRect().width;
        const rememberedWidth = widthByCount.get(shownCount);
        // midió distinto que la otra vez con esta misma cuenta: cambió la letra o un nombre, lo guardado ya no sirve
        if (rememberedWidth !== undefined && Math.abs(rememberedWidth - width) > MEASURE_TOLERANCE_PIXELS) {
            widthByCount.clear();
        }
        widthByCount.set(shownCount, width);

        const freeWidth = freeWidthOf(slot, capsule);
        if (width > freeWidth + MEASURE_TOLERANCE_PIXELS && shownCount > 0) {
            // no cabe: el último botón a la vista se va al «⋯»
            setVisibleCount(shownCount - 1);
            return;
        }
        if (shownCount < maxCount) {
            // hay escondidos: si con uno más cabía (o nunca se midió), se enseña; si no cabe, la siguiente medición lo regresa
            const widthWithOneMore = widthByCount.get(shownCount + 1);
            if (widthWithOneMore === undefined || widthWithOneMore <= freeWidth + MEASURE_TOLERANCE_PIXELS) {
                setVisibleCount(shownCount + 1);
            }
        }
    };

    // después de cada pintada y antes de que se vea: así la cuenta llega a su lugar sin que se note el ir y venir
    useLayoutEffect(() => {
        measureRef.current();
    });

    // se vuelve a medir al girar el teléfono, al cambiar el ancho de la ventana o cuando cambia lo que ocupan los de antes
    // (y, en la barra de escritorio, lo demás de la barra: la cuenta, el menú de arriba)
    useLayoutEffect(() => {
        if (!slot || !capsule) {
            return undefined;
        }
        const observer = new ResizeObserver(() => measureRef.current());
        observer.observe(slot);
        observer.observe(capsule);
        [...slot.children].forEach((sibling) => observer.observe(sibling));
        if (isInsideBar(slot)) {
            observer.observe(slot.parentElement);
            [...slot.parentElement.children].forEach((part) => observer.observe(part));
        }
        return () => observer.disconnect();
    }, [slot, capsule, maxCount]);

    // sin renglón que medir (fuera del marco): se ven todos
    return slot && capsule ? shownCount : maxCount;
}
